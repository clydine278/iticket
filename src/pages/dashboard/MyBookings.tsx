import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, MapPin, Calendar, DollarSign, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const MyBookings = () => {
  const { user } = useAuth();
  const accountType = user?.user_metadata?.account_type || "personal";
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;
    const column = accountType === "artist" ? "artist_id" : "organizer_id";
    const { data } = await supabase
      .from("bookings")
      .select("*, profiles!bookings_organizer_id_fkey(full_name, stage_name, email), events(title)")
      .eq(column, user.id)
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBookings(); }, [user]);

  const handleResponse = async (bookingId: string, status: "accepted" | "declined") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Booking ${status}`, description: `You have ${status} the booking request.` });
      fetchBookings();
    }
  };

  const statusColor = (s: string) => {
    if (s === "accepted") return "default";
    if (s === "declined") return "destructive";
    return "secondary";
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-primary" />
            {accountType === "artist" ? "Booking Requests" : "My Bookings"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {accountType === "artist" ? "Manage incoming booking requests from organizers" : "Track your artist booking requests"}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No bookings yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {accountType === "artist" ? "Booking requests from organizers will appear here" : "Your booking requests will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking, i) => (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start justify-between flex-wrap gap-2">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{booking.event_name || booking.events?.title || "Untitled Event"}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {booking.profiles?.full_name || booking.profiles?.stage_name || booking.profiles?.email || "Unknown"}
                          </p>
                        </div>
                        <Badge variant={statusColor(booking.status)} className="capitalize text-xs">{booking.status}</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        {booking.event_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {format(new Date(booking.event_date), "MMM d, yyyy")}
                          </span>
                        )}
                        {booking.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {booking.venue}
                          </span>
                        )}
                        {booking.offered_price && (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <DollarSign className="w-3.5 h-3.5" />
                            {Number(booking.offered_price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {booking.message && (
                        <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{booking.message}</p>
                      )}

                      {accountType === "artist" && booking.status === "pending" && (
                        <div className="flex items-center gap-2 pt-1">
                          <Button size="sm" onClick={() => handleResponse(booking.id, "accepted")} className="gap-1">
                            <Check className="w-3.5 h-3.5" /> Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleResponse(booking.id, "declined")} className="gap-1">
                            <X className="w-3.5 h-3.5" /> Decline
                          </Button>
                        </div>
                      )}
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

export default MyBookings;
