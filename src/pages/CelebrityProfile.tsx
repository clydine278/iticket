import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const CelebrityProfile = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6 py-10">
      {/* Scrolling text marquee */}
      <div className="w-full overflow-hidden mb-4">
        <p className="text-muted-foreground text-[10px] whitespace-nowrap animate-pulse text-center">
          KARAMÓ · KESE DANCÓ · BAD GIRL I... · BREAK ME DOWN · BEND · A MILLION BLESSINGS · A... · 
          MINE SULLIVAN · SOJI · DON'T CARE · SLOW FEAT. ANAÏS
        </p>
      </div>

      {/* Profile image */}
      <div className="w-48 h-48 rounded-full bg-stone-800 mb-4 flex items-center justify-center overflow-hidden">
        <div className="w-full h-full bg-gradient-to-b from-stone-700 to-stone-900" />
      </div>

      {/* Verified badge */}
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center -mt-6 mb-2 relative z-10">
        <Check className="w-5 h-5 text-primary-foreground" />
      </div>

      <h1 className="font-display text-3xl text-foreground mb-3">Wizkid</h1>

      <Button className="px-8 h-10 rounded-full text-sm font-semibold mb-3">
        Follow
      </Button>

      <p className="text-muted-foreground text-sm mb-auto">
        Add other celebrities of your choice
      </p>

      <Button
        onClick={() => navigate("/")}
        className="w-full max-w-sm h-12 rounded-full text-base font-semibold mt-8"
      >
        Join Community
      </Button>
    </div>
  );
};

export default CelebrityProfile;
