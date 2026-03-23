import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const AuthOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const mode = searchParams.get("mode") || "signup";
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleContinue = () => {
    const code = otp.join("");
    if (code.length < 4) return;
    if (mode === "signup") {
      navigate("/signup/form?type=fan");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 pt-32">
      <h1 className="text-2xl font-bold text-foreground mb-2">O.T.P Verification</h1>
      <p className="text-muted-foreground text-sm mb-8">
        A code has been sent to this email address{" "}
        <span className="text-primary">{email || phone}</span>
      </p>

      <div className="flex gap-4 justify-center mb-12">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            className="w-14 h-14 text-center text-xl font-bold bg-transparent border-2 border-primary rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ))}
      </div>

      <div className="flex justify-center">
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

export default AuthOTP;
