import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Orange top bar */}
      <div className="bg-primary py-3 px-4 flex items-center justify-between">
        <span className="text-primary-foreground font-semibold text-sm">Add Account</span>
        <X className="w-5 h-5 text-primary-foreground cursor-pointer" />
      </div>

      {/* Hero section with background */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative">
        {/* Large X logo */}
        <div className="mb-8">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="text-foreground">
            <path d="M20 20L55 60L20 100H35L60 70L85 100H100L65 60L100 20H85L60 50L35 20H20Z" fill="currentColor" />
          </svg>
        </div>

        <h1 className="font-display text-3xl leading-tight text-foreground mb-2">
          Millions of Fans.
        </h1>
        <h2 className="font-display text-3xl leading-tight text-foreground mb-12">
          Can Build your platform
        </h2>

        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={() => navigate("/signup")}
            className="w-full h-12 rounded-full text-base font-semibold"
          >
            Sign up free
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary"
          >
            Log in
          </Button>
        </div>

        <p className="text-muted-foreground text-xs mt-6">
          Create a new account or Log in to get access to your account...
        </p>
      </div>
    </div>
  );
};

export default Landing;
