import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const howItWorks = [
  { title: "Get Supported", desc: "Upload your vid according to the stated minute showing your best dance move" },
  { title: "Get Supported", desc: "Get likes and support from iticket community which adds and extra point keeping you at the edge to win" },
  { title: "Get Supported", desc: "Top videos with high creativity wins the prize... keeps your heads up champ" },
];

const ChallengeDetail = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-2xl font-bold text-center mb-1"
        >
          Afro beat Dance Challenge
        </motion.h1>
        <p className="text-muted-foreground text-sm text-center mb-8">
          Show us your best Afro beat Dance move and stand a chance to win big
        </p>

        {/* Challenge card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-border rounded-xl overflow-hidden flex flex-col md:flex-row mb-10"
        >
          <div className="md:w-1/2 h-56 md:h-auto bg-muted flex flex-col items-center justify-center p-6 gap-4">
            <Button variant="secondary" className="bg-foreground text-background hover:bg-foreground/90 rounded-none text-xs px-6">
              Upload video
            </Button>
            <div className="flex justify-between w-full text-xs text-muted-foreground">
              <span>30 Days left</span>
              <span>400 Participant</span>
            </div>
          </div>
          <div className="md:w-1/2 p-5">
            <h3 className="font-bold text-sm mb-2">Reward attached to this challenge</h3>
            <div className="flex flex-wrap gap-3 text-[10px] mb-4">
              <span>💰 $1,000 cash price</span>
              <span>🎫 Free ticket to kokpee show</span>
              <span>📣 Free promotion on our socials</span>
            </div>

            <h4 className="font-bold text-xs mb-1">Deadline</h4>
            <p className="text-muted-foreground text-[10px] leading-relaxed mb-4">
              All videos must be submitted before 28th February 2026. meanwhile the online registration which is a show of interest in the competition ends on the 1st of February
            </p>

            <h4 className="font-bold text-xs mb-1">Rules</h4>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Upload a 1minute video of yourself dancing to the song Chairman by Kokopee... Get the most likes and stand a chance to win
            </p>
          </div>
        </motion.div>

        {/* How it works */}
        <h2 className="font-display text-xl font-bold text-center mb-6">How it works</h2>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
        >
          {howItWorks.map((item, i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="bg-primary text-primary-foreground rounded-xl p-5 text-center"
            >
              <h3 className="font-bold text-sm mb-2">{item.title}</h3>
              <p className="text-primary-foreground/80 text-[10px] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default ChallengeDetail;
