import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, ExternalLink, CheckCircle2, Clock, 
  Sparkles, XCircle, Loader2, Video, Search, User, Mail, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";

// Accept profiles as a prop from the main AdminDashboard
export const AdminAllSubmissions = ({ profiles }: { profiles: any[] }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchAllSubmissions = async () => {
      setLoading(true);
      try {
        // Just fetch the entries and challenges (no profile join needed)
        const { data, error } = await supabase
          .from("challenge_entries")
          .select(`
            *,
            challenges (
              title,
              creator_id
            )
          `)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setEntries(data || []);
      } catch (err) {
        console.error("Error fetching all submissions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubmissions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "winner": return <Badge className="bg-yellow-500 text-white border-0"><Trophy className="w-3 h-3 mr-1" /> Winner</Badge>;
      case "in_review": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Sparkles className="w-3 h-3 mr-1" /> In Review</Badge>;
      case "approved": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const filteredEntries = entries.filter(e => {
    // Find the matching user profile manually
    const userProfile = profiles.find(p => p.id === e.user_id);
    
    const matchesFilter = filter === "all" || e.status === filter;
    const searchLower = search.toLowerCase();
    
    // Search logic includes the manually matched profile data
    const matchesSearch = 
      e.challenges?.title?.toLowerCase().includes(searchLower) || 
      e.user_id.includes(searchLower) ||
      userProfile?.username?.toLowerCase().includes(searchLower) ||
      userProfile?.email?.toLowerCase().includes(searchLower) ||
      userProfile?.full_name?.toLowerCase().includes(searchLower);
      
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading global submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" /> Global Submissions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor all challenge entries, winners, and creator decisions.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search challenges, users, emails..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        {["all", "winner", "in_review", "approved", "rejected", "pending_approval"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all capitalize ${
              filter === status ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            {status.replace("_", " ")}
          </button>
        ))}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border/60 rounded-xl bg-background/50">
          <Video className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="font-semibold text-lg text-foreground">No Submissions Found</h3>
          <p className="text-muted-foreground text-sm mt-1">Adjust your filters or search to see more results.</p>
        </div>
      ) : (
        <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50">
          <div className="divide-y divide-border/40">
            <AnimatePresence mode="popLayout">
              {filteredEntries.map((entry, i) => {
                // Find the profile for this specific entry row
                const userProfile = profiles.find(p => p.id === entry.user_id);
                const displayName = userProfile?.username || userProfile?.full_name || "Unknown User";
                
                return (
                  <motion.div 
                    key={entry.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm truncate">{entry.challenges?.title || "Unknown Challenge"}</h4>
                        {getStatusBadge(entry.status)}
                      </div>
                      
                      {/* User Details Block */}
                      <div className="flex items-center gap-x-4 gap-y-2 text-xs text-muted-foreground flex-wrap bg-muted/30 p-2 rounded-md border border-border/40">
                        <div className="flex items-center gap-1 font-medium text-foreground">
                          <User className="w-3 h-3" />
                          {displayName}
                        </div>
                        
                        {userProfile?.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {userProfile.email}
                          </div>
                        )}
                        
                        {userProfile?.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {userProfile.phone}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap pl-1">
                        <span className="font-mono bg-muted/50 px-1.5 py-0.5 rounded">ID: {entry.user_id.substring(0, 8)}...</span>
                        <span>Submitted: {new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 mt-2 sm:mt-0 border-t sm:border-0 border-border/40">
                      <a 
                        href={entry.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs flex items-center px-3 py-1.5 rounded-md bg-background border border-border/50 hover:bg-muted transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Watch Video
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </Card>
      )}
    </div>
  );
};