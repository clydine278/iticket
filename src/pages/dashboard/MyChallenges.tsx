import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Plus, Music, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const MyChallenges = () => {
  const { user } = useAuth();
  const accountType = user?.user_metadata?.account_type || "personal";
  const [challenges, setChallenges] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      if (accountType === "artist" || accountType === "organizer") {
        // Show challenges created by this user
        const { data } = await supabase
          .from("challenges")
          .select("*, challenge_entries(id)")
          .eq("creator_id", user.id)
          .order("created_at", { ascending: false });
        setChallenges(data || []);
      } else {
        // Fan: show challenges they've entered
        const { data } = await supabase
          .from("challenge_entries")
          .select("*, challenges(title, prize, status, end_date)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setEntries(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user, accountType]);

  const isCreator = accountType === "artist" || accountType === "organizer";

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" /> {isCreator ? "My Challenges" : "Challenges I Joined"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isCreator ? "Manage your music challenges" : "Track your challenge participations"}
            </p>
          </div>
          {isCreator && (
            <Button asChild>
              <Link to="/dashboard/create-challenge"><Plus className="w-4 h-4 mr-2" /> Create Challenge</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : isCreator ? (
          challenges.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold text-lg">No challenges yet</h3>
                <p className="text-muted-foreground text-sm mt-1">Create a challenge to engage your fans</p>
                <Button asChild className="mt-4">
                  <Link to="/dashboard/create-challenge">Create Challenge</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {challenges.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold truncate">{c.title}</h3>
                            <Badge variant={c.status === "active" ? "default" : "secondary"} className="text-xs capitalize">{c.status}</Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            {c.song_title && <span className="flex items-center gap-1"><Music className="w-3.5 h-3.5" />{c.song_title}</span>}
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{c.challenge_entries?.length || 0} entries</span>
                            {c.prize && <span className="text-primary font-medium">{c.prize}</span>}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        ) : entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No entries yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Browse challenges and start participating</p>
              <Button asChild className="mt-4">
                <Link to="/dashboard/browse-challenges">Browse Challenges</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {entries.map((entry, i) => (
              <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5">
                        <h3 className="font-semibold">{entry.challenges?.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <Badge variant={entry.status === "submitted" ? "default" : "secondary"} className="text-xs capitalize">{entry.status}</Badge>
                          {entry.challenges?.prize && <span className="text-primary font-medium">{entry.challenges.prize}</span>}
                          <span>👁 {entry.views || 0} views</span>
                          <span>❤️ {entry.likes || 0} likes</span>
                        </div>
                      </div>
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

export default MyChallenges;
