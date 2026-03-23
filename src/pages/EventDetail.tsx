import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const EventDetail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero image area with scrolling text */}
      <div className="relative w-full h-[55vh] bg-gradient-to-b from-secondary to-background overflow-hidden">
        {/* Scrolling marquee */}
        <div className="absolute top-0 left-0 right-0 overflow-hidden py-2 bg-background/50">
          <motion.p
            animate={{ x: [0, -1000] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-destructive text-[10px] font-semibold whitespace-nowrap"
          >
            MAYO · TROUBLED MIND · KARAMÓ · KESE (DANCE) · BAD GIRL FEAT. ASAKE · TIME · PIECE OF... · BRENT FAIYAZ · BREAK ME DOWN · BEND · A MILLION BLESSINGS · APRÈS MINUIT FEAT. TIAN... · FEAT. JAZMINE SULLIVAN · SOJI · DON'T CARE · SLOW FEAT. ANAÏS CARDOT · LOSE · P...
          </motion.p>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90" />
      </div>

      {/* Event info card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", damping: 20 }}
        className="px-4 -mt-24 relative z-10"
      >
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex justify-between items-start mb-1">
            <h1 className="text-foreground text-xl font-bold">Wizkid At United Kingdom</h1>
            <span className="text-primary font-bold text-lg">$50</span>
          </div>
          <p className="text-muted-foreground text-sm">Performing live at Tomorrowland</p>
          <p className="text-muted-foreground text-xs mb-4">Sunday 27th October 2025</p>

          <h3 className="text-foreground text-sm font-semibold mb-2">Event details</h3>
          <p className="text-muted-foreground text-xs leading-relaxed mb-5">
            Your ticket grants you access to Wizkid's electrifying live performance, incredible stage production, and nonstop vibes. Expect chart-topping hits, surprise moments, and a night full of energy you won't forget. Please arrive early, as doors open ahead of showtime to give you the best experience possible.
          </p>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div>
                <p className="text-foreground text-xs font-semibold">Event Manager</p>
                <p className="text-muted-foreground text-[10px]">Ogbonnaya Daniel Kalu</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="rounded-full h-8 text-xs border-foreground/30 gap-1"
            >
              <MessageCircle className="w-3 h-3 text-primary" />
              chat
            </Button>
          </div>

          <Button
            onClick={() => navigate("/tickets/wizkid-uk")}
            className="w-full h-12 rounded-full text-base font-semibold transition-transform active:scale-95"
          >
            Buy Ticket !!!!!!1
          </Button>
        </div>
      </motion.div>

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20"
      >
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-primary-foreground" />
        </div>
      </motion.button>
    </div>
  );
};

export default EventDetail;
