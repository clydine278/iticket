import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl text-foreground mb-4">Welcome to Streamer</h1>
      <p className="text-muted-foreground mb-8">Your fan community awaits</p>
      <Button onClick={() => navigate("/landing")} className="rounded-full px-8">
        Get Started
      </Button>
    </div>
  );
};

export default Index;
