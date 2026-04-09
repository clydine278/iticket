import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, MapPin, Calendar, Users, Check, X, Loader2, CreditCard, Clock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const MyBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountType, setAccountType] = useState<string>("personal");
  
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // 1. Fetch the user's account type (Dependency fixed to user?.id to prevent infinite loops)
  useEffect(() => {
    const fetchAccountType = async () => {
      if (!user) return setLoading(false);
      
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();
        
      if (!profileError && profile) {
        setAccountType(profile.account_type || "personal");
      }
    };
    
    fetchAccountType();
  }, [user?.id]);

  // 2. Fetch bookings
  const fetchBookings = useCallback(async () => {
    if (!user || !accountType) return;
    
    setLoading(true);
    setError(null);

    try {
      const isArtist = accountType === "artist";
      const filterColumn = isArtist ? "artist_id" : "organizer_id";

      const { data: rawBookings, error: fetchError } = await supabase
        .from("bookings")
        .select("*")
        .eq(filterColumn, user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      
      if (!rawBookings || rawBookings.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
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
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, accountType]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // 3. Check for Paystack redirect to verify payment
  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (reference) {
      verifyPaymentAndRefresh(reference);
    }
  }, [searchParams]);

  const verifyPaymentAndRefresh = async (reference: string) => {
    setVerifyingPayment(true);
    toast({ title: "Verifying payment...", description: "Please wait..." });
    
    try {
      // Give the webhook a second to update the database
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({ title: "Payment Successful! 🎉", description: "The artist has been notified.", variant: "default" });
      await fetchBookings();
      setSearchParams({}); // Clear URL params
    } catch (err) {
      console.error("Verification error:", err);
    } finally {
      setVerifyingPayment(false);
    }
  };

  // 4. Handle Artist Accept/Decline
  const handleResponse = async (bookingId: string, status: "accepted" | "declined") => {
    setProcessingId(bookingId);
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", bookingId);

      if (error) throw error;

      toast({ title: `Booking ${status}`, description: `You have ${status} the booking request.` });
      await fetchBookings();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setProcessingId(null);
    }
  };

  // 5. Handle Organizer Payment
  const handlePayment = async (booking: any) => {
    if (!user) return;
    setProcessingId(booking.id);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack?action=initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            email: user.email,
            amount: booking.offered_price, 
            callback_url: window.location.href, 
            metadata: {
              user_id: user.id,
              booking_id: booking.id,
              event_name: booking.event_name,
              type: "booking_payment", // This matches your updated webhook logic!
            },
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment initialization failed");
      
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setProcessingId(null);
    }
  };

  const statusColor = (s: string) => {
    if (s === "paid") return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (s === "accepted") return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (s === "declined") return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-orange-500/20 text-orange-400 border-orange-500/30"; // Pending
  };

  const isArtist = accountType === "artist";

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96"><p className="text-muted-foreground">Please sign in to view bookings</p></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-primary" />
            {isArtist ? "Booking Requests" : "My Bookings"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isArtist ? "Manage incoming booking requests from organizers" : "Track your artist booking requests and payments"}
          </p>
        </div>

        {error && <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">Error: {error}</div>}

        {loading || verifyingPayment ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-8 h-8 border-b-2 animate-spin text-primary mb-4" />
            <p>{verifyingPayment ? "Verifying payment..." : "Loading bookings..."}</p>
          </div>
        ) : bookings.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-800 bg-muted/20">
            <CardContent className="py-12 text-center">
              <CalendarPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No bookings yet</h3>
              <p className="text-muted-foreground text-sm mt-1">
                {isArtist ? "Booking requests will appear here when organizers request you" : "Your booking requests to entertainers will appear here"}
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
                        
                        {/* Header Row */}
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="space-y-1">
                            <h3 className="font-semibold text-white text-lg">{booking.event_name || "Untitled Event"}</h3>
                            <p className="text-sm text-muted-foreground">
                              {isArtist ? "From Organizer:" : "Artist:"} <span className="text-orange-400 font-medium">{otherName}</span>
                            </p>
                          </div>
                          <Badge className={`capitalize px-3 py-1 text-xs border ${statusColor(booking.status)}`}>
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Details Row */}
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground bg-black/40 p-3 rounded-lg border border-gray-800/50">
                          {booking.event_date && (
                            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-500" />{format(new Date(booking.event_date), "MMM d, yyyy")}</span>
                          )}
                          {booking.venue && (
                            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-500" />{booking.venue}</span>
                          )}
                          {booking.offered_price && (
                            <span className="flex items-center gap-1.5 font-medium text-white"><CreditCard className="w-4 h-4 text-primary" />₦{Number(booking.offered_price).toLocaleString()}</span>
                          )}
                          {booking.expected_audience_size && (
                            <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-gray-500" />{booking.expected_audience_size} guests</span>
                          )}
                        </div>

                        {booking.event_type && (
                          <div className="flex gap-2">
                            <span className="text-xs px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 capitalize">{booking.event_type}</span>
                            {booking.deposit_available && <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Deposit Available</span>}
                          </div>
                        )}

                        {booking.message && (
                          <div className="text-sm text-gray-300 bg-gray-900/80 p-3 rounded-lg border border-gray-800 mt-2">
                            <span className="text-xs text-gray-500 block mb-1">Message:</span>
                            {booking.message}
                          </div>
                        )}

                        {/* --- ACTIONS SECTION --- */}
                        <div className="pt-3 mt-2 border-t border-gray-800/50">
                          
                          {/* Artist View: Accept/Decline Buttons */}
                          {isArtist && booking.status === "pending" && (
                            <div className="flex items-center gap-3">
                              <Button size="sm" onClick={() => handleResponse(booking.id, "accepted")} disabled={processingId === booking.id} className="bg-emerald-600 hover:bg-emerald-700 w-28">
                                {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-1" /> Accept</>}
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleResponse(booking.id, "declined")} disabled={processingId === booking.id} className="w-28 border-red-500/30 text-red-400 hover:bg-red-500/10">
                                {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-1" /> Decline</>}
                              </Button>
                            </div>
                          )}

                          {/* Artist View: Awaiting Payment */}
                          {isArtist && booking.status === "accepted" && (
                            <div className="text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-2 rounded-md inline-flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5" /> Awaiting payment from organizer...
                            </div>
                          )}

                          {/* Organizer View: Make Payment Button */}
                          {!isArtist && booking.status === "accepted" && (
                            <div>
                              <p className="text-xs text-emerald-400 mb-2 font-medium">The artist has accepted your request! Secure the booking by making payment.</p>
                              <Button onClick={() => handlePayment(booking)} disabled={processingId === booking.id} className="bg-primary hover:bg-primary/90 text-white shadow-lg">
                                {processingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CreditCard className="w-4 h-4 mr-2" />}
                                Pay ₦{Number(booking.offered_price).toLocaleString()}
                              </Button>
                            </div>
                          )}

                          {/* Both Views: Fully Paid */}
                          {booking.status === "paid" && (
                            <div className="text-sm font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg inline-flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Booking Officially Confirmed & Paid
                            </div>
                          )}

                        </div>
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