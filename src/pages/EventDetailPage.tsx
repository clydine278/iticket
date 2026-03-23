import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const similarEvents = [
  { id: 2, title: "Asake Concert 2025", price: "$500" },
  { id: 3, title: "Davido Live Tour", price: "$500" },
  { id: 4, title: "Asake Concert 2025", price: "$500" },
  { id: 5, title: "Asake Concert 2025", price: "$500" },
];

const EventDetailPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero banner */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-hero text-hero-foreground"
      >
        <div className="container flex flex-col md:flex-row items-center gap-6 py-8">
          <div className="w-full md:w-1/2 h-48 md:h-64 rounded-xl bg-gradient-to-br from-primary/30 to-muted/20 overflow-hidden" />
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display text-2xl font-bold mb-3"
            >
              Asake Concert 2025
            </motion.h1>
            <div className="space-y-2 text-sm text-hero-foreground/70">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> 12 February, 2026</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> 10pm - Till Dawn</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Lekki Toll Badagary, Lagos State...</div>
            </div>
            <Button
              onClick={() => navigate("/checkout/1")}
              className="mt-4 rounded-full px-8"
            >
              Get Ticket Now!!!!
            </Button>
          </div>
        </div>
      </motion.section>

      {/* About */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="container py-8"
      >
        <h2 className="font-display font-bold text-sm text-primary mb-2">About this Event</h2>
        <p className="text-muted-foreground text-xs leading-relaxed mb-4">
          Get ready for an unforgettable night of music, energy, and pure entertainment! Vibe Night Live brings together top artists, DJs, and performers for a thrilling live experience you don't want to miss. From electrifying performances to nonstop vibes, this event is designed for music lovers, party goers, and fans who love great moments.
        </p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          <li>📍 Location: Lagos, Nigeria</li>
          <li>📅 Date: Saturday, 20th July 2026</li>
          <li>🕕 Time: 6:00 PM (late)</li>
          <li className="text-primary">✨ Secure your spot now and be part of the vibe!</li>
        </ul>
      </motion.section>

      {/* Similar Events */}
      <section className="container pb-12">
        <p className="text-primary text-[10px] font-medium text-center mb-1">Get your tickets !!!!!!!</p>
        <h2 className="font-display text-lg font-bold text-center mb-4">Similar Events</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {similarEvents.map((event) => (
            <Link
              key={event.id}
              to={`/event/${event.id}`}
              className="flex-shrink-0 w-40 border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="h-24 bg-gradient-to-br from-primary/20 to-muted" />
              <div className="p-2.5">
                <h3 className="font-bold text-xs">{event.title}</h3>
                <p className="text-muted-foreground text-[9px] my-1">Organizers can find artists, compare prices, and book them instantly.</p>
                <p className="font-bold text-xs">{event.price}</p>
                <p className="text-[9px] text-muted-foreground">limited ticket</p>
                <Button size="sm" className="rounded-full text-[9px] h-6 px-2.5 mt-1">Get Ticket!!!</Button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EventDetailPage;
