import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.6 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* X logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="mb-6"
      >
        <svg width="80" height="80" viewBox="0 0 120 120" fill="none" className="text-foreground">
          <path d="M20 20L55 60L20 100H35L60 70L85 100H100L65 60L100 20H85L60 50L35 20H20Z" fill="currentColor" />
        </svg>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground text-lg mb-1"
      >
        Log In to
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
        className="font-display text-4xl text-foreground mb-10"
      >
        Streamer
      </motion.h1>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-sm space-y-3"
      >
        <motion.div variants={item}>
          <Button
            onClick={() => navigate("/auth/email?mode=login")}
            className="w-full h-12 rounded-full text-base font-semibold transition-transform active:scale-95"
          >
            Continue with email
          </Button>
        </motion.div>
        <motion.div variants={item}>
          <Button
            onClick={() => navigate("/auth/phone?mode=login")}
            variant="outline"
            className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary transition-transform active:scale-95"
          >
            Continue with phone number
          </Button>
        </motion.div>
        <motion.div variants={item}>
          <Button
            variant="outline"
            className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary transition-transform active:scale-95"
          >
            Continue with Google
          </Button>
        </motion.div>
        <motion.div variants={item}>
          <Button
            variant="outline"
            className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary transition-transform active:scale-95"
          >
            Continue with Facebook
          </Button>
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-muted-foreground text-sm mt-8"
      >
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="text-primary underline">
          Sign Up
        </button>
      </motion.p>
    </div>
  );
};

export default Login;
