import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const AuthPhone = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signup";
  const [phone, setPhone] = useState("");

  const handleContinue = () => {
    if (!phone) return;
    navigate(`/auth/otp?phone=${encodeURIComponent("+234" + phone)}&mode=${mode}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-32">
      <h1 className="text-2xl font-bold text-foreground mb-4">Enter phone number</h1>

      <div className="flex gap-2">
        <div className="h-12 px-3 flex items-center bg-secondary border border-foreground/30 rounded-lg text-muted-foreground text-sm">
          +234
        </div>
        <Input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="h-12 flex-1 bg-secondary border-foreground/30 text-foreground placeholder:text-muted-foreground rounded-lg"
        />
      </div>

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

export default AuthPhone;
