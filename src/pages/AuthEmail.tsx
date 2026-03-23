import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signup";
  const [email, setEmail] = useState("");

  const handleContinue = () => {
    if (!email) return;
    navigate(`/auth/otp?email=${encodeURIComponent(email)}&mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-32">
      <h1 className="text-2xl font-bold text-foreground mb-4">What's your email?</h1>

      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        className="h-12 bg-secondary border-foreground/30 text-foreground placeholder:text-muted-foreground rounded-lg"
      />

      <p className="text-muted-foreground text-sm mt-3">
        Already have an account?{" "}
        <button onClick={() => navigate("/login")} className="text-primary underline">
          Log In
        </button>
      </p>

      <div className="flex justify-center mt-12">
        <Button
          onClick={handleContinue}
          className="px-10 h-12 rounded-full text-base font-semibold"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default AuthEmail;
