import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Orange top bar */}
      <motion.div
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-primary py-3 px-4 flex items-center justify-between"
      >
        <span className="text-primary-foreground font-semibold text-sm">Add Account</span>
        <X className="w-5 h-5 text-primary-foreground cursor-pointer" />
      </motion.div>

      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
        {/* Large X logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
          className="mb-8"
        >
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-foreground">
            <path d="M20 20L55 60L20 100H35L60 70L85 100H100L65 60L100 20H85L60 50L35 20H20Z" fill="currentColor" />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="font-display text-3xl leading-tight text-foreground mb-2"
        >
          Millions of Fans.
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="font-display text-3xl leading-tight text-foreground mb-12"
        >
          Can Build your platform
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="w-full max-w-sm space-y-3"
        >
          <Button
            onClick={() => navigate("/signup")}
            className="w-full h-12 rounded-full text-base font-semibold transition-transform active:scale-95"
          >
            Sign up free
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary transition-transform active:scale-95"
          >
            Log in
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="text-muted-foreground text-xs mt-6"
        >
          Create a new account or Log in to get access to your account...
        </motion.p>
      </div>
    </div>
  );
};

export default Landing;
