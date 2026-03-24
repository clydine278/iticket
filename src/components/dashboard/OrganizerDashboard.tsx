import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CalendarPlus, Users, Ticket, DollarSign, ArrowRight, MapPin, Clock, PlusCircle, Music } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const [evRes, bkRes] = await Promise.all([
        supabase.from("events").select("*, ticket_types(id, price, quantity, sold)").eq("organizer_id", user.id).order("created_at", { ascending: false }),
        supabase.from("bookings").select("*").eq("organizer_id", user.id),
      ]);
      const evts = evRes.data || [];
      setEvents(evts);
      setBookings(bkRes.data || []);

      // Fetch orders for organizer's events
      const eventIds = evts.map((e: any) => e.id);
      if (eventIds.length > 0) {
        const { data: ordersData } = await supabase.from("orders").select("*").in("event_id", eventIds);
        setOrders(ordersData || []);
      }
      setLoading(false);
    };
    fetch();
  }, [user]);

  const totalTicketsSold = events.reduce((sum, e) => sum + (e.ticket_types?.reduce((s: number, t: any) => s + (t.sold || 0), 0) || 0), 0);
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalCapacity = (event: any) => event.ticket_types?.reduce((s: number, t: any) => s + t.quantity, 0) || event.capacity || 0;
  const totalSold = (event: any) => event.ticket_types?.reduce((s: number, t: any) => s + (t.sold || 0), 0) || 0;

  const getEventStatus = (event: any) => {
    const now = new Date();
    const endDate = event.end_date ? new Date(event.end_date) : new Date(event.date);
    if (endDate < now) return "ended";
    return event.status;
  };

  const stats = [
    { label: "Total Events", value: String(events.length), icon: CalendarPlus, gradient: "from-primary to-orange-600" },
    { label: "Tickets Sold", value: String(totalTicketsSold), icon: Ticket, gradient: "from-violet-500 to-purple-600" },
    { label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, gradient: "from-emerald-500 to-teal-600" },
    { label: "Artists Booked", value: String(bookings.length), icon: Users, gradient: "from-sky-500 to-blue-600" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="border-border/40 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</span>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <p className="font-display text-lg sm:text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item}>
        <Link to="/dashboard/create-event">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/20 overflow-hidden">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shrink-0">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-sm">Create New Event</p>
                <p className="text-xs text-muted-foreground">Set up your event and start selling tickets</p>
              </div>
              <Button size="sm" className="rounded-full text-xs px-4 shrink-0">Create</Button>
            </CardContent>
          </Card>
        </Link>
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">My Events</h2>
          <Link to="/dashboard/my-events" className="text-xs text-primary font-medium hover:underline">View all</Link>
        </div>
        {events.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 bg-muted/30">
            <CardContent className="p-6 text-center">
              <CalendarPlus className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No events yet</p>
              <p className="text-xs text-muted-foreground/70 mb-4">Create your first event to get started</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => {
              const status = getEventStatus(event);
              return (
                <Card key={event.id} className="border-border/40 hover:shadow-md transition-all">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{event.title}</p>
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                            status === "published" ? "bg-emerald-100 text-emerald-700"
                              : status === "ended" ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-muted-foreground"
                          }`}>{status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                          <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {format(new Date(event.date), "MMM d, yyyy")}</span>
                          {event.venue && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {event.venue}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="text-muted-foreground">Tickets sold</span>
                        <span className="font-medium">{totalSold(event)}/{totalCapacity(event)}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${totalCapacity(event) > 0 ? (totalSold(event) / totalCapacity(event)) * 100 : 0}%` }}
                          transition={{ delay: 0.3, duration: 0.6 }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Book Artists</h2>
          <Link to="/dashboard/hire-artist" className="text-xs text-primary font-medium hover:underline">Browse</Link>
        </div>
        <Card className="border-dashed border-2 border-border/60 bg-muted/20">
          <CardContent className="p-6 text-center">
            <Music className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium mb-1">Find artists for your events</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Browse and book talented performers</p>
            <Link to="/dashboard/hire-artist">
              <Button size="sm" variant="outline" className="rounded-full text-xs px-6">
                Browse Artists <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OrganizerDashboard;
