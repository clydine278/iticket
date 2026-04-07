import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, MapPin, Calendar, DollarSign, Users, Check, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // ADD THIS
  const [accountType, setAccountType] = useState<string>("personal"); // ADD THIS

  // First fetch the user's account type
  useEffect(() => {
    const fetchAccountType = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();
        
      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setAccountType("personal");
      } else {
        setAccountType(profile?.account_type || "personal");
      }
    };
    
    fetchAccountType();
  }, [user]);

  // Then fetch bookings once we know account type
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user || !accountType) return;
      
      setLoading(true);
      setError(null);

      try {
        const isArtist = accountType === "artist";
        const filterColumn = isArtist ? "artist_id" : "organizer_id";
        
        console.log("User ID:", user.id);
        console.log("Account type:", accountType);
        console.log("Filtering by:", filterColumn);

        // Simple query first
        const { data: rawBookings, error: fetchError } = await supabase
          .from("bookings")
          .select("*")
          .eq(filterColumn, user.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          console.error("Fetch error:", fetchError);
          setError(fetchError.message);
          setBookings([]);
        } else {
          console.log("Raw bookings found:", rawBookings?.length || 0);
          
          if (!rawBookings || rawBookings.length === 0) {
            setBookings([]);
            setLoading(false);
            return;
          }
          
          // Fetch profiles separately
          const enrichedBookings = await Promise.all(
            rawBookings.map(async (booking) => {
              const [{ data: organizer }, { data: artist }] = await Promise.all([
                supabase.from("profiles").select("id, full_name, stage_name, email, avatar_url").eq("id", booking.organizer_id).single(),
                supabase.from("profiles").select("id, full_name, stage_name, email, avatar_url").eq("id", booking.artist_id).single()
              ]);
              
              return {
                ...booking,
                organizer: organizer || { email: "Unknown" },
                artist: artist || { email: "Unknown" },
              };
            })
          );
          
          setBookings(enrichedBookings);
        }
      } catch (err: any) {
        console.error("Unexpected error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, accountType]); // Only run when user or accountType changes

  const handleResponse = async (bookingId: string, status: "accepted" | "declined") => {
    const { error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Booking ${status}`, description: `You have ${status} the booking request.` });
      // Refetch bookings
      const { data: updated } = await supabase.from("bookings").select("*").eq(accountType === "artist" ? "artist_id" : "organizer_id", user?.id).order("created_at", { ascending: false });
      if (updated) {
        const enriched = await Promise.all(updated.map(async (b) => {
          const [{ data: org }, { data: art }] = await Promise.all([
            supabase.from("profiles").select("full_name, stage_name, email").eq("id", b.organizer_id).single(),
            supabase.from("profiles").select("full_name, stage_name, email").eq("id", b.artist_id).single()
          ]);
          return { ...b, organizer: org || {}, artist: art || {} };
        }));
        setBookings(enriched);
      }
    }
  };

  const statusColor = (s: string) => {
    if (s === "accepted") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (s === "declined") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  };

  const isArtist = accountType === "artist";

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Please sign in to view bookings</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-primary" />
            {isArtist ? "Booking Requests" : "My Bookings"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isArtist 
              ? "Manage incoming booking requests from organizers" 
              : "Track your artist booking requests"}
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-800 bg-muted/20">
            <CardContent className="py-12 text-center">
              <CalendarPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No bookings yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {isArtist 
                  ? "Booking requests will appear here when organizers request you" 
                  : "Your booking requests to artists will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking, i) => {
              const otherParty = isArtist ? booking.organizer : booking.artist;
              const otherName = otherParty?.stage_name || otherParty?.full_name || otherParty?.email || "Unknown";
              
              return (
                <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border-gray-800 bg-[#1a1a1a]">
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-white">{booking.event_name || "Untitled Event"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {isArtist ? "From:" : "Artist:"} <span className="text-orange-400">{otherName}</span>
                            </p>
                          </div>
                          <Badge className={`capitalize text-xs border ${statusColor(booking.status)}`}>
                            {booking.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
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
                            <span className="flex items-center gap-1 text-primary">
                              {/* <DollarSign className="w-3.5 h-3.5" /> */}
                              ₦{Number(booking.offered_price).toLocaleString()}
                            </span>
                          )}
                          {booking.expected_audience_size && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              {booking.expected_audience_size} guests
                            </span>
                          )}
                        </div>

                        {booking.event_type && (
                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300">
                              {booking.event_type}
                            </span>
                            {booking.deposit_available && (
                              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                                Deposit Available
                              </span>
                            )}
                          </div>
                        )}

                        {booking.message && (
                          <p className="text-sm text-muted-foreground bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                            {booking.message}
                          </p>
                        )}

                        {isArtist && booking.status === "pending" && (
                          <div className="flex items-center gap-3 pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleResponse(booking.id, "accepted")} 
                              className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                            >
                              <Check className="w-4 h-4" /> Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleResponse(booking.id, "declined")} 
                              className="gap-1"
                            >
                              <X className="w-4 h-4" /> Decline
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default MyBookings;