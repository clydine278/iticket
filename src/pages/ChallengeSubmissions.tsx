import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, Video, ExternalLink, Clock, CheckCircle2, 
  XCircle, Trophy, Eye, Heart, Loader2, Sparkles, Settings2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const ChallengeSubmissions = () => {
  const { user } = useAuth();
  const accountType = user?.user_metadata?.account_type || "personal";
  const isCreator = accountType === "artist" || accountType === "organizer";

  const [entries, setEntries] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  
  // Manage Modal State
  const [managingEntry, setManagingEntry] = useState<any | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      setLoading(true);

      try {
        if (isCreator) {
          const { data: myChallenges } = await supabase.from("challenges").select("id, title").eq("creator_id", user.id);
          if (!myChallenges || myChallenges.length === 0) return setLoading(false);

          setChallenges(myChallenges);
          const challengeIds = myChallenges.map(c => c.id);

          const { data: myEntries, error } = await supabase
            .from("challenge_entries")
            .select("*, challenges(title, banner_url)")
            .in("challenge_id", challengeIds)
            .order("created_at", { ascending: false });

          if (error) throw error;
          setEntries(myEntries || []);
        } else {
          const { data } = await supabase
            .from("challenge_entries")
            .select("*, challenges(title, banner_url)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });
          setEntries(data || []);
        }
      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user, isCreator]);

  // SMART STATUS UPDATE LOGIC (Enforces 1 Winner Rule)
  const handleUpdateStatus = async (newStatus: string) => {
    if (!managingEntry) return;
    setProcessingStatus(newStatus);

    try {
      // THE HIGHLANDER RULE: Only one winner per challenge
      if (newStatus === "winner") {
        const existingWinner = entries.find(e => 
          e.challenge_id === managingEntry.challenge_id && 
          e.status === "winner" && 
          e.id !== managingEntry.id
        );

        if (existingWinner) {
          const confirmReplace = window.confirm("There is already a winner for this challenge! Do you want to replace them and make this entry the new winner?");
          if (!confirmReplace) {
            setProcessingStatus(null);
            return;
          }

          // Demote the old winner in the database
          const { error: demoteErr } = await supabase
            .from("challenge_entries")
            .update({ status: "approved" })
            .eq("id", existingWinner.id)
            .select(); // Select ensures it throws if RLS blocks it
            
          if (demoteErr) throw new Error("Failed to demote previous winner.");
          
          setEntries(prev => prev.map(e => e.id === existingWinner.id ? { ...e, status: "approved" } : e));
        }
      }

      // Update the current entry
      const { data, error } = await supabase
        .from("challenge_entries")
        .update({ status: newStatus })
        .eq("id", managingEntry.id)
        .select(); // Select ensures it throws if RLS blocks it

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Database blocked the update. Check Supabase RLS policies.");

      toast({ 
        title: "Status Updated", 
        description: `Entry marked as ${newStatus.replace("_", " ")}`,
      });
      
      // Update local state instantly
      setEntries(prev => prev.map(e => e.id === managingEntry.id ? { ...e, status: newStatus } : e));
      setManagingEntry(null); // Close modal

    } catch (err: any) {
      toast({ title: "Update Failed", description: err.message, variant: "destructive" });
    } finally {
      setProcessingStatus(null);
    }
  };

  const filteredEntries = filter === "all" ? entries : entries.filter(e => e.challenge_id === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "winner": return <Badge className="bg-yellow-500 text-white border-0"><Trophy className="w-3 h-3 mr-1" /> Winner</Badge>;
      case "in_review": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Sparkles className="w-3 h-3 mr-1" /> Shortlisted</Badge>;
      case "approved": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight text-foreground">
              {isCreator ? <Users className="w-7 h-7 text-primary" /> : <Trophy className="w-7 h-7 text-primary" />}
              {isCreator ? "Submissions Manager" : "My Entries"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isCreator ? "Review, shortlist, and select the winner for your challenges." : "Track the status of your challenge videos."}
            </p>
          </div>
        </div>

        {isCreator && !loading && challenges.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button onClick={() => setFilter("all")} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filter === "all" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
              All Submissions
            </button>
            {challenges.map(c => (
              <button key={c.id} onClick={() => setFilter(c.id)} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${filter === c.id ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                {c.title}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary mb-4" /></div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20 bg-muted/10 rounded-2xl border border-dashed border-border/50">
            <Video className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No entries found</h3>
            <p className="text-muted-foreground text-sm mt-1">No videos match your current filter.</p>
          </div>
        ) : (
          <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50">
            <div className="divide-y divide-border/40">
              <AnimatePresence mode="popLayout">
                {filteredEntries.map((entry, i) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.03 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="w-16 h-16 sm:w-12 sm:h-12 rounded-lg shrink-0 overflow-hidden bg-muted flex items-center justify-center border border-border/50">
                      {entry.challenges?.banner_url ? <img src={entry.challenges.banner_url} alt="" className="w-full h-full object-cover" /> : <Video className="w-4 h-4 text-muted-foreground/40" />}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">{entry.challenges?.title || "Challenge"}</h4>
                        {getStatusBadge(entry.status)}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        {isCreator && <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">User: {entry.user_id.substring(0, 6)}</span>}
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {entry.views || 0}</span>
                        <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {entry.likes || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 mt-2 sm:mt-0 border-t sm:border-0 border-border/40">
                      <Button variant="outline" size="sm" className="h-8 text-xs shrink-0 bg-background" asChild>
                        <a href={entry.video_url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Watch Video</a>
                      </Button>
                      
                      {isCreator && (
                        <Button size="sm" className="h-8 text-xs" onClick={() => setManagingEntry(entry)}>
                          <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Manage
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </Card>
        )}
      </div>

      {/* --- MANAGE ENTRY DIALOG --- */}
      {/* UI Fix: Added max height and vertical scrolling to prevent spilling */}
      <Dialog open={!!managingEntry} onOpenChange={(open) => !open && setManagingEntry(null)}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col overflow-hidden p-6">
          <DialogHeader className="shrink-0">
            <DialogTitle>Manage Submission</DialogTitle>
            <DialogDescription>Select an action for this video entry. This updates instantly.</DialogDescription>
          </DialogHeader>

          {managingEntry && (
            <div className="flex-1 overflow-y-auto space-y-3 pt-4 pb-2 pr-2 no-scrollbar">
              <div className="p-3 bg-muted/40 rounded-lg flex items-center justify-between border border-border/50 mb-4">
                <span className="text-sm font-medium truncate flex-1">{managingEntry.video_url}</span>
                <a href={managingEntry.video_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center shrink-0 ml-4">
                  Open Link <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>

              {/* ACTION CARDS */}
              <button 
                onClick={() => handleUpdateStatus("winner")}
                disabled={processingStatus === "winner"}
                className={`w-full text-left p-4 rounded-xl border transition-all ${managingEntry.status === "winner" ? "bg-yellow-500/10 border-yellow-500 text-yellow-700 dark:text-yellow-500" : "bg-card hover:bg-muted border-border/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${managingEntry.status === "winner" ? "bg-yellow-500 text-white" : "bg-yellow-500/10 text-yellow-600"}`}>
                    {processingStatus === "winner" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trophy className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Award Grand Prize</h4>
                    <p className="text-xs opacity-80 mt-0.5">Mark as the sole winner. Replaces any existing winner.</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => handleUpdateStatus("in_review")}
                disabled={processingStatus === "in_review"}
                className={`w-full text-left p-4 rounded-xl border transition-all ${managingEntry.status === "in_review" ? "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400" : "bg-card hover:bg-muted border-border/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${managingEntry.status === "in_review" ? "bg-blue-500 text-white" : "bg-blue-500/10 text-blue-600"}`}>
                    {processingStatus === "in_review" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Shortlist (In Review)</h4>
                    <p className="text-xs opacity-80 mt-0.5">Mark this entry as a top contender for final review.</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => handleUpdateStatus("approved")}
                disabled={processingStatus === "approved"}
                className={`w-full text-left p-4 rounded-xl border transition-all ${managingEntry.status === "approved" ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-500" : "bg-card hover:bg-muted border-border/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${managingEntry.status === "approved" ? "bg-green-500 text-white" : "bg-green-500/10 text-green-600"}`}>
                    {processingStatus === "approved" ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Approve Submission</h4>
                    <p className="text-xs opacity-80 mt-0.5">Accept the entry. It will remain in the public gallery.</p>
                  </div>
                </div>
              </button>

              <button 
                onClick={() => handleUpdateStatus("rejected")}
                disabled={processingStatus === "rejected"}
                className={`w-full text-left p-4 rounded-xl border transition-all ${managingEntry.status === "rejected" ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-500" : "bg-card hover:bg-muted border-border/50"}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${managingEntry.status === "rejected" ? "bg-red-500 text-white" : "bg-red-500/10 text-red-600"}`}>
                    {processingStatus === "rejected" ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Reject Entry</h4>
                    <p className="text-xs opacity-80 mt-0.5">Decline the submission. It will be hidden.</p>
                  </div>
                </div>
              </button>

            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ChallengeSubmissions;