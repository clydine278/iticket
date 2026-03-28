import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Ticket, Music, Trophy, ArrowRight, Calendar, MapPin, Share2, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const quickActions = [
  { title: "Buy Tickets", desc: "Explore upcoming events", icon: Ticket, to: "/dashboard/browse-events", gradient: "from-primary to-orange-600" },
  { title: "Book Artist", desc: "Hire for your event", icon: Music, to: "/dashboard/hire-artist", gradient: "from-violet-500 to-purple-600" },
  { title: "Challenges", desc: "Compete & win prizes", icon: Trophy, to: "/dashboard/browse-challenges", gradient: "from-emerald-500 to-teal-600" },
];

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PersonalDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [ordersRes, eventsRes] = await Promise.all([
        user ? supabase.from("orders").select("*, events(title, date, venue)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(5) : Promise.resolve({ data: [] }),
        supabase.from("events").select("*, ticket_types(price)").eq("status", "published").order("date", { ascending: true }).limit(5),
      ]);
      setOrders(ordersRes.data || []);
      setEvents(eventsRes.data || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const activeTickets = orders.filter((o) => o.status === "confirmed").length;

  const handleShare = async (event: any) => {
    const url = `${window.location.origin}/dashboard/event/${event.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text: `Check out ${event.title}!`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Event link copied to clipboard." });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <motion.div key={action.title} variants={item}>
            <Link to={action.to}>
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/40 cursor-pointer overflow-hidden h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
                    <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm">{action.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block mt-0.5">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">My Tickets</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">{activeTickets} active</span>
        </div>
        {orders.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 bg-muted/30">
            <CardContent className="p-6 sm:p-8 text-center">
              <Ticket className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium mb-1">No tickets yet</p>
              <p className="text-xs text-muted-foreground/70 mb-4">Your purchased tickets will appear here</p>
              <Link to="/dashboard/browse-events">
                <Button size="sm" className="rounded-full text-xs px-6">
                  Browse Events <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <Link key={order.id} to="/dashboard/tickets">
                <Card className="border-border/40 hover:shadow-md hover:border-border/70 transition-all cursor-pointer">
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center shrink-0">
                      <Ticket className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{(order.events as any)?.title || "Event"}</p>
                      <p className="text-[11px] text-muted-foreground">{order.quantity} ticket(s) · ₦{Number(order.total_amount).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${order.status === "confirmed" ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{order.status}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Upcoming Events</h2>
          <Link to="/dashboard/browse-events" className="text-xs text-primary font-medium hover:underline">See all</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
        ) : events.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 bg-muted/30">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const cheapest = event.ticket_types?.map((t: any) => t.price).filter((p: number) => p > 0).sort((a: number, b: number) => a - b)[0];
              return (
                <Card key={event.id} className="border-border/40 hover:shadow-md transition-all duration-200 group cursor-pointer overflow-hidden">
                  <Link to={`/dashboard/event/${event.id}`}>
                    {event.banner_url ? (
                      <div className="h-28 sm:h-36 w-full overflow-hidden">
                        <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className="h-20 sm:h-28 w-full bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-primary/40" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{event.title}</p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-muted-foreground mt-1">
                            <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {format(new Date(event.date), "MMM d, yyyy")}</span>
                            {event.venue && <span className="flex items-center gap-0.5 truncate"><MapPin className="w-3 h-3 shrink-0" /> {event.venue}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold text-primary">{cheapest ? `₦${cheapest.toLocaleString()}` : "Free"}</span>
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleShare(event); }}
                            className="w-7 h-7 rounded-full bg-muted hover:bg-muted-foreground/10 flex items-center justify-center transition-colors"
                          >
                            <Share2 className="w-3 h-3 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PersonalDashboard;
