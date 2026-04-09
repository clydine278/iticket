import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Ticket, Music } from "lucide-react";
import { format } from "date-fns";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountType, setAccountType] = useState("personal");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: profile } = await supabase.from("profiles").select("account_type").eq("id", user.id).single();
      const type = profile?.account_type || "personal";
      setAccountType(type);

      // Fetch ticket orders
      const { data: ordersData } = await supabase
        .from("orders")
        .select("*, events(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(ordersData || []);

      // For organizers, also fetch bookings they made
      if (type === "organizer") {
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("organizer_id", user.id)
          .order("created_at", { ascending: false });
        setBookings(bookingsData || []);
      }

      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-xl font-bold">Order History</h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Ticket Orders */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Ticket className="w-4 h-4" /> Tickets Purchased
              </h2>
              {orders.length === 0 ? (
                <Card className="border-border/40">
                  <CardContent className="p-8 text-center">
                    <Ticket className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No tickets purchased yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {orders.map((o) => (
                    <Card key={o.id} className="border-border/40">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{o.events?.title || "Event"}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(o.created_at), "MMM d, yyyy")} • Qty: {o.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {Number(o.total_amount) === 0 ? "Free" : `₦${Number(o.total_amount).toLocaleString()}`}
                          </p>
                          <Badge variant="outline" className={`text-[10px] ${o.status === "confirmed" ? "text-emerald-600 border-emerald-200" : "text-amber-600 border-amber-200"}`}>
                            {o.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Organizer Bookings */}
            {accountType === "organizer" && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Music className="w-4 h-4" /> Artists Booked
                </h2>
                {bookings.length === 0 ? (
                  <Card className="border-border/40">
                    <CardContent className="p-8 text-center">
                      <Music className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No artist bookings yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {bookings.map((b) => (
                      <Card key={b.id} className="border-border/40">
                        <CardContent className="p-3 flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{b.event_name || "Booking"}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {format(new Date(b.created_at), "MMM d, yyyy")} • {b.venue || "—"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">₦{Number(b.offered_price || 0).toLocaleString()}</p>
                            <Badge variant="outline" className={`text-[10px] capitalize ${
                              b.status === "accepted" ? "text-emerald-600 border-emerald-200" 
                              : b.status === "declined" ? "text-destructive border-destructive/20" 
                              : "text-amber-600 border-amber-200"
                            }`}>
                              {b.payment_status === "paid" ? "Paid" : b.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrderHistory;
