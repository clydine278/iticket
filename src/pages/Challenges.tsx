import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const challenges = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: i === 3 ? "UMBRELLA CHALLENGE Win $50!" : "Afrobeat Dance Challenge",
  prize: "$1,000",
  participants: "5,000 participant",
  desc: "Create a 2min dance vid with the song 'with you' Davido ft Omarlah",
  date: "1 January - 31 February 2026.",
}));

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Challenges = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-8">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {challenges.map((ch) => (
            <motion.div key={ch.id} variants={fadeUp}>
              <Link to={`/challenge/${ch.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-gradient-to-br from-primary/20 to-muted" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display font-bold text-sm">{ch.title}</h3>
                    <p className="font-bold text-sm">{ch.prize}</p>
                  </div>
                  <p className="text-primary text-[10px] font-medium">{ch.participants}</p>
                  <p className="text-muted-foreground text-[10px] my-1">{ch.desc}</p>
                  <p className="text-muted-foreground text-[10px]">{ch.date}</p>
                  <Button variant="secondary" size="sm" className="rounded-none text-[10px] h-7 px-4 mt-2 bg-foreground text-background hover:bg-foreground/90">
                    Participate Now!!!!!
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Challenges;
