import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Share2, X } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [similarEvents, setSimilarEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;
      const { data } = await supabase
        .from("events")
        .select("*, ticket_types(price)")
        .eq("id", id)
        .single();
      if (data) {
        setEvent(data);
        const { data: similar } = await supabase
          .from("events")
          .select("*, ticket_types(price)")
          .eq("status", "published")
          .neq("id", id)
          .order("date", { ascending: true })
          .limit(4);
        setSimilarEvents(similar || []);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [id]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event?.title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Event link copied to clipboard." });
    }
  };

  const cheapestPrice = (ev: any) => {
    const prices = ev.ticket_types?.map((t: any) => t.price).filter((p: number) => p > 0) || [];
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center"><h2 className="text-lg font-semibold">Event not found</h2></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-hero text-hero-foreground">
        <div className="container flex flex-col md:flex-row items-center gap-6 py-8">
          <div className="w-full md:w-1/2 h-48 md:h-64 rounded-xl overflow-hidden">
            {event.banner_url ? (
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setImageOpen(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/30 to-muted/20" />
            )}
          </div>
          <div className="flex-1">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-display text-2xl font-bold mb-3">
              {event.title}
            </motion.h1>
            <div className="space-y-2 text-sm text-hero-foreground/70">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {format(new Date(event.date), "d MMMM, yyyy")}</div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> {format(new Date(event.date), "h:mm a")}</div>
              {event.venue && <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.venue}{event.city ? `, ${event.city}` : ""}</div>}
            </div>
            <div className="flex items-center gap-3 mt-4">
              <Button onClick={() => navigate(`/dashboard/event/${event.id}`)} className="rounded-full px-8">Get Ticket Now</Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={handleShare}><Share2 className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Image Popup */}
      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none [&>button]:hidden">
          <div className="relative">
            <img src={event.banner_url} alt={event.title} className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
            <button onClick={() => setImageOpen(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md">
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="container py-8">
        <h2 className="font-display font-bold text-sm text-primary mb-2">About this Event</h2>
        <p className="text-muted-foreground text-xs leading-relaxed mb-4">{event.description || "No description available."}</p>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {event.venue && <li>📍 Location: {event.venue}{event.city ? `, ${event.city}` : ""}</li>}
          <li>📅 Date: {format(new Date(event.date), "EEEE, d MMMM yyyy")}</li>
          <li>🕕 Time: {format(new Date(event.date), "h:mm a")}</li>
          <li className="text-primary">✨ Secure your spot now!</li>
        </ul>
      </motion.section>

      {similarEvents.length > 0 && (
        <section className="container pb-12">
          <h2 className="font-display text-lg font-bold text-center mb-4">Similar Events</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {similarEvents.map((ev) => (
              <Link key={ev.id} to={`/event/${ev.id}`} className="flex-shrink-0 w-40 border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {ev.banner_url ? (
                  <img src={ev.banner_url} alt={ev.title} className="h-24 w-full object-cover" />
                ) : (
                  <div className="h-24 bg-gradient-to-br from-primary/20 to-muted" />
                )}
                <div className="p-2.5">
                  <h3 className="font-bold text-xs">{ev.title}</h3>
                  <p className="text-muted-foreground text-[9px] my-1 line-clamp-2">{ev.description || ""}</p>
                  <p className="font-bold text-xs">{cheapestPrice(ev) > 0 ? `₦${cheapestPrice(ev).toLocaleString()}` : "Free"}</p>
                  <p className="text-[9px] text-muted-foreground">{format(new Date(ev.date), "MMM d, yyyy")}</p>
                  <Button size="sm" className="rounded-full text-[9px] h-6 px-2.5 mt-1">Get Ticket</Button>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default EventDetailPage;
