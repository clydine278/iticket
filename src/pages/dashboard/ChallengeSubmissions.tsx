import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, Video, ExternalLink, Clock, CheckCircle2, 
  XCircle, Trophy, Eye, Heart, Loader2 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ChallengeSubmissions = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      setLoading(true);

      try {
        // 1. Find all challenges created by this user
        const { data: myChallenges } = await supabase
          .from("challenges")
          .select("id, title")
          .eq("creator_id", user.id);

        if (!myChallenges || myChallenges.length === 0) {
          setLoading(false);
          return;
        }

        setChallenges(myChallenges);
        const challengeIds = myChallenges.map(c => c.id);

        // 2. Fetch all entries for those specific challenges
        const { data: myEntries, error } = await supabase
          .from("challenge_entries")
          .select(`
            *,
            challenges ( title )
          `)
          .in("challenge_id", challengeIds)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEntries(myEntries || []);

      } catch (err) {
        console.error("Error fetching submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  // Filter entries based on the selected challenge tab
  const filteredEntries = filter === "all" 
    ? entries 
    : entries.filter(e => e.challenge_id === filter);

  // Quick stats
  const totalEntries = entries.length;
  const approvedEntries = entries.filter(e => e.status === "approved").length;
  const pendingEntries = entries.filter(e => e.status === "pending_approval").length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight text-foreground">
              <Users className="w-8 h-8 text-primary" /> 
              Challenge Submissions
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and track all video entries submitted by your fans.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        {!loading && challenges.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg"><Video className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Entries</p>
                  <h4 className="text-2xl font-bold">{totalEntries}</h4>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-500/5 border-green-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <h4 className="text-2xl font-bold text-green-700 dark:text-green-500">{approvedEntries}</h4>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-500/10 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                  <h4 className="text-2xl font-bold text-amber-700 dark:text-amber-500">{pendingEntries}</h4>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        {!loading && challenges.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All Challenges
            </button>
            {challenges.map(c => (
              <button
                key={c.id}
                onClick={() => setFilter(c.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === c.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No Challenges Yet</h3>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Create a challenge first to start receiving submissions.</p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
            <Video className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No Entries Found</h3>
            <p className="text-muted-foreground text-sm mt-1">Fans haven't submitted videos for this filter yet.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden hover:shadow-md transition-shadow border-border/50">
                    <div className="p-4 bg-muted/30 border-b border-border/50 flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-semibold text-sm line-clamp-1">{entry.challenges?.title || "Challenge"}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-1">User ID: {entry.user_id.substring(0,6)}...</p>
                      </div>
                      
                      {entry.status === "approved" ? (
                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 shrink-0"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>
                      ) : entry.status === "pending_approval" ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 shrink-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                      ) : (
                        <Badge variant="destructive" className="shrink-0"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>
                      )}
                    </div>
                    
                    <CardContent className="p-5">
                      <div className="bg-background rounded-lg p-3 border border-border/50 flex items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Video className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm font-medium truncate text-foreground">
                            {entry.video_url || "No link provided"}
                          </span>
                        </div>
                        {entry.video_url && (
                          <Button variant="secondary" size="icon" className="shrink-0 w-8 h-8" asChild>
                            <a href={entry.video_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
                        <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {entry.views || 0} views</span>
                        <span className="flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> {entry.likes || 0} likes</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChallengeSubmissions;