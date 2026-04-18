import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import {
  Trophy, Music, Users, Search, Upload, CreditCard,
  Loader2, Clock, CheckCircle2, ArrowRight, ExternalLink,
} from "lucide-react";

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  song_title: string | null;
  song_url?: string | null;
  rules?: string | null;
  status: string;
  created_at: string;
  creator_id?: string;
  challenge_entries: { id: string; status: string; video_url: string | null; user_id?: string }[];
  entry_fee: number;
  prize_pool: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 200, damping: 20 } },
};

const BrowseChallenges = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userPayments, setUserPayments] = useState<Set<string>>(new Set());
  const [userEntries, setUserEntries] = useState<Map<string, { status: string; video_url: string | null }>>(new Map());
  const [globalEntryFee, setGlobalEntryFee] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: feeData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "challenge_entry_fee")
        .maybeSingle();
      const fee = feeData ? Number(feeData.value) : 0;
      setGlobalEntryFee(fee);

      const { data: challs, error } = await supabase
        .from("challenges")
        .select(`
          id, title, description, banner_url, song_title, song_url, rules, status, created_at, creator_id,
          challenge_entries(id, status, video_url, user_id)
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (challs || []).map((c: any) => {
        const entries = c.challenge_entries || [];
        return {
          ...c,
          entry_fee: fee,
          prize_pool: fee > 0 ? entries.length * fee * 0.8 : 50000,
          challenge_entries: entries,
        } as Challenge;
      });
      setChallenges(mapped);

      if (user) {
        const { data: userEntriesData } = await supabase
          .from("challenge_entries")
          .select("challenge_id, status, video_url")
          .eq("user_id", user.id);

        setUserPayments(new Set((userEntriesData || []).map((e: any) => e.challenge_id)));
        const entriesMap = new Map();
        (userEntriesData || []).forEach((e: any) => entriesMap.set(e.challenge_id, { status: e.status, video_url: e.video_url }));
        setUserEntries(entriesMap);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Verify Paystack callback
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference || !user) return;

    const verify = async () => {
      setProcessingPayment(true);
      toast({ title: "Verifying payment...", description: "Please wait while we confirm your transaction." });
      try {
        let found = false;
        for (let i = 0; i < 4; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const { data } = await supabase.from("transactions").select("id").eq("reference_id", reference as any).maybeSingle();
          if (data) { found = true; break; }
        }
        if (found) {
          toast({ title: "Payment Successful! 🎉", description: "You can now upload your video." });
        } else {
          toast({ title: "Processing", description: "Your payment is taking a moment. Please refresh shortly." });
        }
        await fetchData();
        setSearchParams({});
      } finally {
        setProcessingPayment(false);
      }
    };
    verify();
  }, [searchParams, user, fetchData, setSearchParams]);

  const handlePayment = async (challenge: Challenge) => {
    if (!user) {
      toast({ title: "Please login first", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack?action=initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            email: user.email,
            amount: globalEntryFee,
            callback_url: `${window.location.origin}/dashboard/browse-challenges`,
            metadata: { user_id: user.id, challenge_id: challenge.id, type: "challenge_entry" },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment initialization failed");
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setSubmitting(false);
    }
  };

  const handleParticipate = async () => {
    if (!user || !selectedChallenge) return;
    const hasPaid = userPayments.has(selectedChallenge.id);
    if (globalEntryFee > 0 && !hasPaid) {
      toast({ title: "Payment required", description: "Please pay the entry fee first", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("challenge_entries").insert({
        challenge_id: selectedChallenge.id,
        user_id: user.id,
        video_url: videoUrl.trim() || null,
        status: "pending_approval",
      });
      if (error) throw error;
      toast({ title: "Entry Submitted! 🚀", description: "Your submission is pending admin approval." });
      setVideoUrl("");
      setDialogOpen(false);
      setSelectedChallenge(null);
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = challenges.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background">
        <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Challenges</h1>
                <p className="text-muted-foreground mt-1">
                  {globalEntryFee === 0 ? "Free to join • Win amazing prizes" : "Stand a chance to win amazing prizes"}
                </p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mt-6 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search challenges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading || processingPayment ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {processingPayment ? "Verifying payment..." : "Loading challenges..."}
              </p>
            </div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((challenge) => {
                  const userStatus = userEntries.get(challenge.id);
                  const isFree = globalEntryFee === 0;
                  const hasPaid = userPayments.has(challenge.id) || isFree;

                  let buttonState: "pay" | "upload" | "pending" | "joined" = "pay";
                  if (userStatus) {
                    if (userStatus.status === "pending_approval") buttonState = "pending";
                    else if (userStatus.status === "approved") buttonState = "joined";
                    else buttonState = "upload";
                  } else if (hasPaid) {
                    buttonState = "upload";
                  }

                  return (
                    <motion.div key={challenge.id} variants={cardVariants} layout>
                      <Card className="group overflow-hidden bg-card border-border/40 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                          {challenge.banner_url ? (
                            <img src={challenge.banner_url} alt={challenge.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                              <Trophy className="w-12 h-12 text-primary/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0 backdrop-blur-sm text-xs shadow-lg">
                              <Trophy className="w-3 h-3 mr-1" /> ₦{Number(challenge.prize_pool).toLocaleString()}
                            </Badge>
                          </div>

                          {hasPaid && !isFree && !userStatus && (
                            <div className="absolute top-3 right-3">
                              <Badge className="bg-emerald-500/90 text-white border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Paid</Badge>
                            </div>
                          )}

                          {userStatus && (
                            <div className="absolute top-3 right-3">
                              {userStatus.status === "pending_approval" ? (
                                <Badge className="bg-amber-500/90 text-white border-0"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
                              ) : userStatus.status === "approved" ? (
                                <Badge className="bg-green-500/90 text-white border-0"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>
                              ) : null}
                            </div>
                          )}
                        </div>

                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:text-primary transition-colors">{challenge.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {challenge.description || "Join this challenge to showcase your talent!"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1.5"><Music className="w-3.5 h-3.5" />{challenge.song_title || "Original"}</span>
                            <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{challenge.challenge_entries?.length || 0}</span>
                          </div>

                          {buttonState === "joined" ? (
                            <Button variant="outline" className="w-full h-10 border-green-500/30 text-green-600 bg-green-500/5" disabled>
                              <CheckCircle2 className="w-4 h-4 mr-2" />Joined
                            </Button>
                          ) : buttonState === "pending" ? (
                            <Button variant="outline" className="w-full h-10 border-amber-500/30 text-amber-600 bg-amber-500/5" disabled>
                              <Clock className="w-4 h-4 mr-2" />Awaiting Approval
                            </Button>
                          ) : buttonState === "upload" ? (
                            <Dialog open={dialogOpen && selectedChallenge?.id === challenge.id} onOpenChange={(open) => {
                              setDialogOpen(open);
                              if (!open) { setSelectedChallenge(null); setVideoUrl(""); }
                            }}>
                              <DialogTrigger asChild>
                                <Button className="w-full h-10 bg-primary hover:bg-primary/90" onClick={() => { setSelectedChallenge(challenge); setDialogOpen(true); }}>
                                  <Upload className="w-4 h-4 mr-2" /> Upload Link
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2"><Upload className="w-5 h-5 text-primary" /> Submit Your Entry</DialogTitle>
                                  <DialogDescription>Enter your video link for <span className="font-semibold">{challenge.title}</span></DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  {(challenge.rules || challenge.description) && (
                                    <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
                                      <p className="font-medium text-foreground mb-1">📋 Challenge Rules</p>
                                      <p className="leading-relaxed whitespace-pre-line">{challenge.rules || challenge.description}</p>
                                    </div>
                                  )}
                                  {challenge.song_title && (
                                    <div className="p-3 bg-muted rounded-lg text-xs">
                                      <p className="font-medium text-foreground mb-1">🎵 Song</p>
                                      <p className="text-muted-foreground">{challenge.song_title}</p>
                                      {challenge.song_url && (
                                        <a href={challenge.song_url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 mt-1 hover:underline">
                                          <ExternalLink className="w-3 h-3" /> Listen to song
                                        </a>
                                      )}
                                    </div>
                                  )}
                                  <div className="space-y-2">
                                    <Label className="flex items-center gap-2 text-sm"><ExternalLink className="w-4 h-4 text-muted-foreground" /> Video URL</Label>
                                    <Input placeholder="https://tiktok.com/@username/video/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
                                    <p className="text-xs text-muted-foreground">Paste link from TikTok, Instagram, or YouTube</p>
                                  </div>
                                  <div className="flex gap-3">
                                    <Button variant="outline" className="flex-1" onClick={() => { setDialogOpen(false); setSelectedChallenge(null); }}>Cancel</Button>
                                    <Button className="flex-1 bg-primary" onClick={handleParticipate} disabled={submitting || !videoUrl.trim()}>
                                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit <ArrowRight className="w-4 h-4 ml-2" /></>}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handlePayment(challenge)} disabled={submitting}>
                              <CreditCard className="w-4 h-4 mr-2" /> Pay ₦{globalEntryFee.toLocaleString()}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No challenges found</h3>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your search</p>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BrowseChallenges;
