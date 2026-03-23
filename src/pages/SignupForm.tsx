import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

const SignupForm = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get("type") || "fan";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const setType = (t: string) => {
    setSearchParams({ type: t });
  };

  const inputClass =
    "h-12 bg-secondary border-foreground/30 text-foreground placeholder:text-muted-foreground rounded-lg";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-10">
      {/* Avatar placeholder */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="w-28 h-28 rounded-full bg-muted mb-4"
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-lg"
      >
        Sign Up
      </motion.p>
      <motion.h1
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.3 }}
        className="font-display text-3xl text-foreground mb-4"
      >
        {type === "creator" ? "Istream" : "Streamer"}
      </motion.h1>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-8 mb-6"
      >
        <button
          onClick={() => setType("fan")}
          className={`text-sm pb-1 transition-colors ${type === "fan" ? "text-primary border-b border-primary" : "text-muted-foreground"}`}
        >
          Join as a Fan
        </button>
        <button
          onClick={() => setType("creator")}
          className={`text-sm pb-1 transition-colors ${type === "creator" ? "text-primary border-b border-primary" : "text-muted-foreground"}`}
        >
          Join as a Creator
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={type}
          variants={container}
          initial="hidden"
          animate="show"
          exit={{ opacity: 0, x: 30, transition: { duration: 0.2 } }}
          className="w-full max-w-sm space-y-3"
        >
          {type === "fan" ? (
            <>
              <motion.div variants={item}><Input placeholder="Full name" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Username" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Email Address" type="email" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Date of birth" type="date" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Username" className={inputClass} /></motion.div>
              <motion.div variants={item}>
                <div className="relative">
                  <Input placeholder="Password" type={showPassword ? "text" : "password"} className={inputClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
              <motion.div variants={item}>
                <div className="relative">
                  <Input placeholder="Retype Password" type={showConfirm ? "text" : "password"} className={inputClass} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-muted-foreground">
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div variants={item}><Input placeholder="Stage Name / Display Name" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Username" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Email Address" type="email" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Primary Niche" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Username" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Password" type="password" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Retype Password" type="password" className={inputClass} /></motion.div>
              <motion.div variants={item}><Input placeholder="Retype Password" type="password" className={inputClass} /></motion.div>
              <motion.div variants={item}>
                <Textarea placeholder="Bio" className="bg-secondary border-foreground/30 text-foreground placeholder:text-muted-foreground rounded-lg min-h-[80px]" />
              </motion.div>
            </>
          )}

          <motion.div variants={item} className="pt-4">
            {type === "fan" ? (
              <Button className="w-full h-12 rounded-full text-base font-semibold transition-transform active:scale-95">
                Continue with Google
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/onboarding/categories")}
                className="w-full h-12 rounded-full text-base font-semibold transition-transform active:scale-95"
              >
                Continue
              </Button>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SignupForm;
