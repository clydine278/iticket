import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trophy, Music, Users, Search, Upload } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const BrowseChallenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("*, challenge_entries(id)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setChallenges(data || []);
      setLoading(false);
    };
    fetchChallenges();
  }, []);

  const filtered = challenges.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleParticipate = async () => {
    if (!user || !selectedChallenge) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("challenge_entries").insert({
        challenge_id: selectedChallenge,
        user_id: user.id,
        video_url: videoUrl || null,
        status: "submitted",
      });
      if (error) throw error;
      toast({ title: "Entry submitted!", description: "Your challenge entry is now live." });
      setVideoUrl("");
      setSelectedChallenge(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> Browse Challenges
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Discover trending challenges and participate</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search challenges..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No challenges found</h3>
              <p className="text-muted-foreground text-sm mt-1">Check back later for new challenges</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((challenge, i) => (
              <motion.div key={challenge.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                  {challenge.banner_url && (
                    <div className="h-36 overflow-hidden rounded-t-lg">
                      <img src={challenge.banner_url} alt={challenge.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold mb-1">{challenge.title}</h3>
                    {challenge.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{challenge.description}</p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3 flex-wrap">
                      {challenge.song_title && (
                        <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5" />{challenge.song_title}</span>
                      )}
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{challenge.challenge_entries?.length || 0} entries</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                      {challenge.prize && <Badge variant="secondary" className="text-xs">{challenge.prize}</Badge>}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedChallenge(challenge.id)}>
                            <Upload className="w-3.5 h-3.5 mr-1" /> Participate
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Your Entry</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label>Video URL</Label>
                              <Input
                                placeholder="Paste your video link..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">Share a link to your TikTok, Instagram, or YouTube video</p>
                            </div>
                            <Button onClick={handleParticipate} disabled={submitting} className="w-full">
                              {submitting ? "Submitting..." : "Submit Entry"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default BrowseChallenges;
