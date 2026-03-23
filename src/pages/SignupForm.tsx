import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff } from "lucide-react";

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
      <div className="w-28 h-28 rounded-full bg-muted mb-4" />

      <p className="text-muted-foreground text-lg">Sign Up</p>
      <h1 className="font-display text-3xl text-foreground mb-4">
        {type === "creator" ? "Istream" : "Streamer"}
      </h1>

      {/* Tabs */}
      <div className="flex gap-8 mb-6">
        <button
          onClick={() => setType("fan")}
          className={`text-sm pb-1 ${type === "fan" ? "text-primary border-b border-primary" : "text-muted-foreground"}`}
        >
          Join as a Fan
        </button>
        <button
          onClick={() => setType("creator")}
          className={`text-sm pb-1 ${type === "creator" ? "text-primary border-b border-primary" : "text-muted-foreground"}`}
        >
          Join as a Creator
        </button>
      </div>

      <div className="w-full max-w-sm space-y-3">
        {type === "fan" ? (
          <>
            <Input placeholder="Full name" className={inputClass} />
            <Input placeholder="Username" className={inputClass} />
            <Input placeholder="Email Address" type="email" className={inputClass} />
            <Input placeholder="Date of birth" type="date" className={inputClass} />
            <Input placeholder="Username" className={inputClass} />
            <div className="relative">
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="relative">
              <Input
                placeholder="Retype Password"
                type={showConfirm ? "text" : "password"}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-3 text-muted-foreground"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </>
        ) : (
          <>
            <Input placeholder="Stage Name / Display Name" className={inputClass} />
            <Input placeholder="Username" className={inputClass} />
            <Input placeholder="Email Address" type="email" className={inputClass} />
            <Input placeholder="Primary Niche" className={inputClass} />
            <Input placeholder="Username" className={inputClass} />
            <Input placeholder="Password" type="password" className={inputClass} />
            <Input placeholder="Retype Password" type="password" className={inputClass} />
            <Input placeholder="Retype Password" type="password" className={inputClass} />
            <Textarea
              placeholder="Bio"
              className="bg-secondary border-foreground/30 text-foreground placeholder:text-muted-foreground rounded-lg min-h-[80px]"
            />
          </>
        )}

        <div className="pt-4">
          {type === "fan" ? (
            <Button className="w-full h-12 rounded-full text-base font-semibold">
              Continue with Google
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/onboarding/categories")}
              className="w-full h-12 rounded-full text-base font-semibold"
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
