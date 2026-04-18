import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Trophy, Users, Music, Calendar, Search, ArrowRight, Sparkles } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Challenges = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from("challenges")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      setChallenges(data || []);
      setLoading(false);
    };
    fetchChallenges();
  }, []);

  const filtered = challenges.filter((c) =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative border-b border-border/40 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container py-10 md:py-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Compete & Win
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Live <span className="text-primary">Challenges</span>
            </h1>
            <p className="text-muted-foreground mt-3 text-sm md:text-base">
              Showcase your talent, climb the leaderboard, and win amazing prizes.
            </p>

            <div className="relative mt-6 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search challenges..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 bg-card/50 backdrop-blur border-border/60"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* List */}
      <section className="container py-10 flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary/20 border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Trophy className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg">No challenges found</h3>
            <p className="text-muted-foreground text-sm mt-1">Check back soon for new ones</p>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((ch) => (
              <motion.div key={ch.id} variants={fadeUp}>
                <Link
                  to={`/challenge/${ch.id}`}
                  className="group block bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Banner */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {ch.banner_url ? (
                      <img
                        src={ch.banner_url}
                        alt={ch.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 flex items-center justify-center">
                        <Trophy className="w-14 h-14 text-primary/30" />
                      </div>
                    )}
                    {/* Dark gradient overlay for badge contrast */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/0 to-black/40" />

                    {/* Prize badge - now with solid contrast */}
                    {ch.prize && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white border-0 shadow-lg font-semibold gap-1 px-2.5 py-1">
                          <Trophy className="w-3.5 h-3.5" />
                          ₦{Number(ch.prize).toLocaleString()}
                        </Badge>
                      </div>
                    )}

                    {/* Live badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white border-0 shadow-lg gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        Live
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display font-bold text-base md:text-lg line-clamp-1 group-hover:text-primary transition-colors">
                      {ch.title}
                    </h3>
                    {ch.description && (
                      <p className="text-muted-foreground text-sm mt-1.5 line-clamp-2">
                        {ch.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-primary" />
                        {ch.participants_count || 0} joined
                      </span>
                      {ch.song_title && (
                        <span className="flex items-center gap-1.5">
                          <Music className="w-3.5 h-3.5 text-primary" />
                          <span className="line-clamp-1 max-w-[120px]">{ch.song_title}</span>
                        </span>
                      )}
                      {ch.start_date && ch.end_date && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {format(new Date(ch.start_date), "d MMM")} – {format(new Date(ch.end_date), "d MMM")}
                        </span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      className="w-full mt-5 h-10 bg-foreground text-background hover:bg-foreground/90 group/btn"
                    >
                      Participate Now
                      <ArrowRight className="w-4 h-4 ml-1.5 transition-transform group-hover/btn:translate-x-0.5" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Challenges;
