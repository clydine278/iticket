import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const MyTickets = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, events(*), ticket_types(*)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-xl font-bold mb-4">My Tickets</h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="p-8 text-center">
              <Ticket className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-sm mb-1">No tickets yet</p>
              <p className="text-xs text-muted-foreground">Purchase tickets to events and they'll appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{order.events?.title || "Event"}</p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(order.events?.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{order.events?.venue || "TBA"}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {order.ticket_types?.name} × {order.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm">₦{Number(order.total_amount).toLocaleString()}</p>
                        <span className={`text-[10px] font-medium ${order.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTickets;
