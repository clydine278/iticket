import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Ticket, MapPin, Calendar, Search } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const BrowseEvents = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*, ticket_types(id, name, price, quantity, sold)")
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
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="w-6 h-6 text-primary" /> Browse Events
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Discover upcoming events and buy tickets</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search events, venues, cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : filtered.length === 0 ? (
          <Card><CardContent className="py-12 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No events found</h3>
            <p className="text-muted-foreground text-sm mt-1">Check back later for upcoming events</p>
          </CardContent></Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                  {event.banner_url && (
                    <div className="h-36 overflow-hidden rounded-t-lg">
                      <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="secondary" className="text-xs capitalize">{event.category}</Badge>
                    </div>
                    <h3 className="font-semibold mb-1 line-clamp-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(event.date), "MMM d, yyyy · h:mm a")}
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {event.venue}{event.city ? `, ${event.city}` : ""}
                        </div>
                      )}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                      <span className="font-bold text-primary">
                        {cheapestPrice(event) > 0 ? `From ₦${cheapestPrice(event).toLocaleString()}` : "Free"}
                      </span>
                      <Button size="sm" asChild>
                        <Link to={`/dashboard/event/${event.id}`}>Buy Tickets</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default BrowseEvents;
