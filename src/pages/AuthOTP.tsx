import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AuthOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const mode = searchParams.get("mode") || "signup";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleContinue = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast({ title: "Error", description: "Please enter the full 6-digit code", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const verifyParams = email
        ? { email, token: code, type: "email" as const }
        : { phone: phone!, token: code, type: "sms" as const };

      const { error } = await supabase.auth.verifyOtp(verifyParams);

      if (error) {
        toast({ title: "Verification failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Verified!", description: "You're now signed in" });
        if (mode === "signup") {
          navigate("/signup/form?type=fan");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-32">
      <motion.h1
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="text-2xl font-bold text-foreground mb-2"
      >
        O.T.P Verification
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm mb-8"
      >
        A code has been sent to{" "}
        <span className="text-primary">{email || phone}</span>
      </motion.p>

      <div className="flex gap-3 justify-center mb-12">
        {otp.map((digit, index) => (
          <motion.input
            key={index}
            id={`otp-${index}`}
            initial={{ opacity: 0, y: 30, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: 0.3 + index * 0.08,
            }}
            whileFocus={{ scale: 1.1 }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-14 text-center text-xl font-bold bg-transparent border-2 border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.8 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleContinue}
          disabled={loading}
          className="px-10 h-12 rounded-full text-base font-semibold transition-transform active:scale-95"
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </motion.div>
    </div>
  );
};

export default AuthOTP;
