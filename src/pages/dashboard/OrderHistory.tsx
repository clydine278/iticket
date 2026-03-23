import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("orders")
        .select("*, events(title)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setOrders(data || []);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-xl font-bold mb-4">Order History</h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="p-8 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-sm mb-1">No orders yet</p>
              <p className="text-xs text-muted-foreground">Your purchase history will appear here</p>
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
                      {new Date(o.created_at).toLocaleDateString()} • Qty: {o.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">₦{Number(o.total_amount).toLocaleString()}</p>
                    <span className={`text-[10px] ${o.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>{o.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default OrderHistory;
