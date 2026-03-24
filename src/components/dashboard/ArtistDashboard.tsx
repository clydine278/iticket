import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DollarSign, CheckCircle, XCircle, TrendingUp, Calendar, Wallet, Music, Star, Ticket, ArrowRight, MapPin, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast as sonnerToast } from "sonner";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ArtistDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    const [bkRes, txRes, evRes] = await Promise.all([
      supabase.from("bookings").select("*").eq("artist_id", user.id).order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("events").select("*, ticket_types(price)").eq("status", "published").order("date", { ascending: true }).limit(5),
    ]);
    setBookings(bkRes.data || []);
    setTransactions(txRes.data || []);
    setEvents(evRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleBookingAction = async (bookingId: string, status: "accepted" | "declined") => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", bookingId);
    if (error) { sonnerToast.error(error.message); return; }
    sonnerToast.success(`Booking ${status}`);
    fetchData();
  };

  const handleShare = async (event: any) => {
    const url = `${window.location.origin}/dashboard/event/${event.id}`;
    if (navigator.share) {
      try { await navigator.share({ title: event.title, text: `Check out ${event.title}!`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Event link copied to clipboard." });
    }
  };

  const totalEarnings = transactions.filter(t => t.type === "booking_payment" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const pendingBookings = bookings.filter(b => b.status === "pending");
  const acceptedBookings = bookings.filter(b => b.status === "accepted");

  const stats = [
    { label: "Total Balance", value: `₦${totalEarnings.toLocaleString()}`, icon: Wallet, gradient: "from-primary to-orange-600" },
    { label: "Total Bookings", value: String(bookings.length), icon: DollarSign, gradient: "from-emerald-500 to-teal-600" },
    { label: "Accepted", value: String(acceptedBookings.length), icon: CheckCircle, gradient: "from-violet-500 to-purple-600" },
    { label: "Pending", value: String(pendingBookings.length), icon: Star, gradient: "from-amber-500 to-yellow-600" },
  ];

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
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
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Booking Requests</h2>
          <Link to="/dashboard/bookings" className="text-xs text-primary font-medium hover:underline">View all</Link>
        </div>
        {bookings.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 bg-muted/30">
            <CardContent className="p-6 text-center">
              <Music className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium">No booking requests yet</p>
              <p className="text-xs text-muted-foreground/70">Complete your profile to start receiving bookings</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <Card key={booking.id} className="border-border/40 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-3 p-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center shrink-0">
                      <Music className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{booking.event_name || "Event"}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{booking.event_date ? new Date(booking.event_date).toLocaleDateString() : "TBD"}</span>
                        {booking.offered_price && (
                          <>
                            <span className="text-border">•</span>
                            <span className="text-primary font-medium">₦{Number(booking.offered_price).toLocaleString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {booking.status === "pending" ? (
                    <div className="flex border-t border-border/40">
                      <button onClick={() => handleBookingAction(booking.id, "accepted")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                      </button>
                      <div className="w-px bg-border/40" />
                      <button onClick={() => handleBookingAction(booking.id, "declined")} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  ) : (
                    <div className={`border-t border-border/40 px-3 py-2 ${booking.status === "accepted" ? "bg-emerald-50/50" : "bg-destructive/5"}`}>
                      <span className={`text-[11px] font-medium flex items-center gap-1 ${booking.status === "accepted" ? "text-emerald-600" : "text-destructive"}`}>
                        {booking.status === "accepted" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {booking.status === "accepted" ? "Accepted" : "Declined"}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      {/* Browse Events for Artists */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Upcoming Events</h2>
          <Link to="/dashboard/browse-events" className="text-xs text-primary font-medium hover:underline">Browse all</Link>
        </div>
        {events.length === 0 ? (
          <Card className="border-dashed border-2 border-border/60 bg-muted/30">
            <CardContent className="p-6 text-center">
              <Ticket className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No upcoming events</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const cheapest = event.ticket_types?.map((t: any) => t.price).filter((p: number) => p > 0).sort((a: number, b: number) => a - b)[0];
              return (
                <div key={event.id} className="flex items-center gap-3">
                  <Link to={`/dashboard/event/${event.id}`} className="flex-1">
                    <Card className="border-border/40 hover:shadow-md transition-all duration-200 group cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                          {event.banner_url ? (
                            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                              <Ticket className="w-5 h-5 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate">{event.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                            <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                            {event.venue && <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {event.venue}</span>}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-primary">{cheapest ? `₦${cheapest.toLocaleString()}` : "Free"}</p>
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <button onClick={() => handleShare(event)} className="shrink-0 w-8 h-8 rounded-full bg-muted hover:bg-muted-foreground/10 flex items-center justify-center transition-colors">
                    <Share2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <motion.div variants={item}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Boost Your Profile</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Complete your profile, add performance videos, and update your services to get more booking requests.
                </p>
                <Link to="/dashboard/profile" className="text-xs text-primary font-medium hover:underline mt-2 inline-block">
                  Update Profile →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ArtistDashboard;
