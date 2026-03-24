import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Challenges = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-8">
        <div className="mb-6">
          <p className="text-primary text-[10px] font-medium">Compete & Win</p>
          <h1 className="font-display text-2xl font-bold">Challenges</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No active challenges right now</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {challenges.map((ch) => (
              <motion.div key={ch.id} variants={fadeUp}>
                <Link to={`/challenge/${ch.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {ch.banner_url ? (
                    <img src={ch.banner_url} alt={ch.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-primary/20 to-muted" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-display font-bold text-sm">{ch.title}</h3>
                      {ch.prize && <p className="font-bold text-sm">{ch.prize}</p>}
                    </div>
                    <p className="text-primary text-[10px] font-medium">{ch.participants_count || 0} participants</p>
                    <p className="text-muted-foreground text-[10px] my-1 line-clamp-2">{ch.description || ""}</p>
                    {ch.start_date && ch.end_date && (
                      <p className="text-muted-foreground text-[10px]">
                        {format(new Date(ch.start_date), "d MMM")} - {format(new Date(ch.end_date), "d MMM yyyy")}
                      </p>
                    )}
                    <Button variant="secondary" size="sm" className="rounded-none text-[10px] h-7 px-4 mt-2 bg-foreground text-background hover:bg-foreground/90">
                      Participate Now
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
