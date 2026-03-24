import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const BuyTickets = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*, ticket_types(price)")
        .eq("status", "published")
        .order("date", { ascending: true });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const filtered = events.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue?.toLowerCase().includes(search.toLowerCase()) ||
      e.city?.toLowerCase().includes(search.toLowerCase())
  );

  const cheapestPrice = (event: any) => {
    const prices = event.ticket_types?.map((t: any) => t.price).filter((p: number) => p > 0) || [];
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-primary text-[10px] font-medium">Get your tickets!</p>
            <h1 className="font-display text-2xl font-bold">Upcoming Events</h1>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search events, venues, cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm rounded-full" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No events found</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {filtered.map((event) => (
              <motion.div key={event.id} variants={fadeUp}>
                <Link to={`/dashboard/event/${event.id}`} className="block border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {event.banner_url ? (
                    <img src={event.banner_url} alt={event.title} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="h-28 bg-gradient-to-br from-primary/20 to-muted" />
                  )}
                  <div className="p-2.5">
                    <h3 className="font-bold text-xs">{event.title}</h3>
                    <p className="text-muted-foreground text-[9px] leading-relaxed my-1 line-clamp-2">{event.description || ""}</p>
                    <p className="font-bold text-xs">{cheapestPrice(event) > 0 ? `₦${cheapestPrice(event).toLocaleString()}` : "Free"}</p>
                    <p className="text-[9px] text-muted-foreground mb-1.5">{format(new Date(event.date), "MMM d, yyyy")}</p>
                    <Button size="sm" className="rounded-full text-[9px] h-6 px-2.5 w-full">Get Ticket</Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default BuyTickets;
