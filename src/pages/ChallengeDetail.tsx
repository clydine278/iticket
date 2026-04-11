import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Trophy, Users, Calendar, Music, ExternalLink, ArrowRight, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format, differenceInDays } from "date-fns";

const ChallengeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", id)
        .single();
      setChallenge(data);
      setLoading(false);
    };

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchChallenge();
    getUser();
  }, [id]);

  const handleParticipate = () => {
    if (user) {
      navigate("/dashboard/browse-challenges");
    } else {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-2">Challenge Not Found</h1>
          <p className="text-muted-foreground">This challenge may have been removed.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const daysLeft = challenge.end_date
    ? Math.max(0, differenceInDays(new Date(challenge.end_date), new Date()))
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Banner */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 overflow-hidden">
        {challenge.banner_url ? (
          <img src={challenge.banner_url} alt={challenge.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Trophy className="w-16 h-16 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <section className="container -mt-16 relative z-10 pb-12 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Title area */}
          <div className="mb-6">
            <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">{challenge.title}</h1>
            <p className="text-muted-foreground text-sm">{challenge.description || "Join this challenge and showcase your talent!"}</p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3 mb-6">
            {daysLeft !== null && (
              <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                {daysLeft > 0 ? `${daysLeft} days left` : "Ended"}
              </Badge>
            )}
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              {challenge.participants_count || 0} participants
            </Badge>
            {challenge.prize && (
              <Badge className="gap-1.5 px-3 py-1.5 text-xs bg-primary text-primary-foreground">
                <Trophy className="w-3.5 h-3.5" />
                ₦{Number(challenge.prize).toLocaleString()}
              </Badge>
            )}
          </div>

          {/* Details cards */}
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {/* Rewards */}
            {challenge.prize && (
              <div className="border border-border rounded-xl p-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-primary" /> Rewards
                </h3>
                <p className="text-sm text-muted-foreground">
                  💰 ₦{Number(challenge.prize).toLocaleString()} prize pool
                </p>
              </div>
            )}

            {/* Song */}
            {challenge.song_title && (
              <div className="border border-border rounded-xl p-5">
                <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4 text-primary" /> Song
                </h3>
                <p className="text-sm text-foreground font-medium">{challenge.song_title}</p>
                {challenge.song_url && (
                  <a
                    href={challenge.song_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-xs flex items-center gap-1 mt-2 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Listen to song
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Rules */}
          {challenge.rules && (
            <div className="border border-border rounded-xl p-5 mb-8">
              <h3 className="font-bold text-sm mb-3">📋 Rules</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">{challenge.rules}</p>
            </div>
          )}

          {/* Deadline */}
          {(challenge.start_date || challenge.end_date) && (
            <div className="border border-border rounded-xl p-5 mb-8">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Timeline
              </h3>
              <div className="flex gap-6 text-sm text-muted-foreground">
                {challenge.start_date && (
                  <div>
                    <span className="text-foreground font-medium">Start:</span>{" "}
                    {format(new Date(challenge.start_date), "d MMM yyyy")}
                  </div>
                )}
                {challenge.end_date && (
                  <div>
                    <span className="text-foreground font-medium">End:</span>{" "}
                    {format(new Date(challenge.end_date), "d MMM yyyy")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              className="w-full sm:w-auto gap-2"
              onClick={handleParticipate}
              disabled={daysLeft === 0}
            >
              {daysLeft === 0 ? "Challenge Ended" : "Join Challenge"}
              {daysLeft !== 0 && <ArrowRight className="w-4 h-4" />}
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default ChallengeDetail;
