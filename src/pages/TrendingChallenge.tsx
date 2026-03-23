import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const challenges = [
  {
    id: 1,
    title: "Funds By Davido",
    price: "$50",
    rules: ["1. Must be in the fan club", "2. 7mins short clip of the above record", "3. Cultural attire"],
  },
  {
    id: 2,
    title: "Gold VIP Ticket $90",
    price: "",
    rules: [
      "✨ Priority entry (skip general lines)",
      "🎪 Reserved seating area closer to the stage",
      "🎁 Exclusive tour wristband or small merch item included",
      "📸 Access to a 'photo wall' for fan selfies",
    ],
  },
  {
    id: 3,
    title: "Silver V.I.P Ticket $120",
    price: "",
    rules: [
      "✨ Priority entry (skip general lines)",
      "🎪 Reserved seating area closer to the stage",
      "🎁 Exclusive tour wristband or small merch item included",
      "📸 Access to a 'photo wall' for fan selfies",
    ],
  },
  {
    id: 4,
    title: "Diamond (VVIP / All-Access) $150",
    price: "",
    rules: [
      "✨ Priority entry (skip general lines)",
      "🎪 Reserved seating area closer to the stage",
      "🎁 Exclusive tour wristband or small merch item included",
      "📸 Access to a 'photo wall' for fan selfies",
    ],
  },
];

const TrendingChallenge = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 mb-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-primary-foreground" />
          </div>
        </motion.button>
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-foreground text-lg font-bold"
        >
          Trending Challenge
        </motion.h1>
      </div>

      {/* Challenge hero area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring", damping: 20 }}
        className="mx-4 rounded-2xl bg-gradient-to-b from-amber-900/30 to-background h-64 mb-4 flex items-end p-4 overflow-hidden"
      >
        <p className="text-muted-foreground text-xs">Sunday 27th October 2025</p>
      </motion.div>

      {/* Challenge tiers */}
      <div className="px-4 space-y-2 pb-6">
        {challenges.map((challenge, index) => (
          <motion.div
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, type: "spring", damping: 24 }}
            className="flex items-center justify-between bg-card rounded-xl px-4 py-3 border border-border"
          >
            <div className="flex-1 pr-3">
              <div className="flex items-center gap-2">
                <h3 className="text-foreground text-sm font-bold">{challenge.title}</h3>
                {challenge.price && (
                  <span className="text-muted-foreground font-bold text-sm">{challenge.price}</span>
                )}
              </div>
              <div className="mt-1 space-y-0.5">
                {challenge.rules.map((rule, i) => (
                  <p key={i} className="text-muted-foreground text-[10px]">{rule}</p>
                ))}
              </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 transition-transform active:scale-90">
              <ArrowRight className="w-5 h-5 text-primary-foreground" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrendingChallenge;
