import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* X logo */}
      <div className="mb-6">
        <svg width="80" height="80" viewBox="0 0 120 120" fill="none" className="text-foreground">
          <path d="M20 20L55 60L20 100H35L60 70L85 100H100L65 60L100 20H85L60 50L35 20H20Z" fill="currentColor" />
        </svg>
      </div>

      <p className="text-muted-foreground text-lg mb-1">Log In to</p>
      <h1 className="font-display text-4xl text-foreground mb-10">Streamer</h1>

      <div className="w-full max-w-sm space-y-3">
        <Button
          onClick={() => navigate("/auth/email?mode=login")}
          className="w-full h-12 rounded-full text-base font-semibold"
        >
          Continue with email
        </Button>
        <Button
          onClick={() => navigate("/auth/phone?mode=login")}
          variant="outline"
          className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary"
        >
          Continue with phone number
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary"
        >
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full h-12 rounded-full text-base font-semibold text-foreground border-foreground/30 hover:bg-secondary"
        >
          Continue with Facebook
        </Button>
      </div>

      <p className="text-muted-foreground text-sm mt-8">
        Don't have an account?{" "}
        <button onClick={() => navigate("/signup")} className="text-primary underline">
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
