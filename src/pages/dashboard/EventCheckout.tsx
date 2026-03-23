import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Minus, Plus, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

const EventCheckout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from("events")
        .select("*, ticket_types(*)")
        .eq("id", id)
        .single();
      if (data) {
        setEvent(data);
        setTicketTypes(data.ticket_types || []);
      }
      setLoading(false);
    };
    if (id) fetchEvent();
  }, [id]);

  const updateQty = (ticketId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketId] || 0;
      const newVal = Math.max(0, current + delta);
      return { ...prev, [ticketId]: newVal };
    });
  };

  const total = ticketTypes.reduce((sum, t) => sum + (quantities[t.id] || 0) * t.price, 0);
  const hasItems = Object.values(quantities).some((q) => q > 0);

  const handlePurchase = async () => {
    if (!user || !event) return;
    setPurchasing(true);
    try {
      for (const ticket of ticketTypes) {
        const qty = quantities[ticket.id] || 0;
        if (qty <= 0) continue;

        const { error } = await supabase.from("orders").insert({
          user_id: user.id,
          event_id: event.id,
          ticket_type_id: ticket.id,
          quantity: qty,
          total_amount: qty * ticket.price,
          status: "confirmed",
          payment_method: "card",
          qr_code: crypto.randomUUID(),
        });
        if (error) throw error;
      }

      // Create a transaction record
      await supabase.from("transactions").insert({
        user_id: user.id,
        amount: total,
        type: "ticket_purchase",
        description: `Tickets for ${event.title}`,
        reference_id: event.id,
        status: "completed",
      });

      toast({ title: "Purchase successful!", description: "Your tickets have been confirmed." });
      navigate("/dashboard/tickets");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-lg font-semibold">Event not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        {event.banner_url && (
          <div className="h-48 rounded-xl overflow-hidden">
            <img src={event.banner_url} alt={event.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold">{event.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{format(new Date(event.date), "MMM d, yyyy · h:mm a")}</span>
            {event.venue && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{event.venue}{event.city ? `, ${event.city}` : ""}</span>}
            <Badge variant="secondary" className="capitalize">{event.category}</Badge>
          </div>
          {event.description && <p className="text-sm text-muted-foreground mt-3">{event.description}</p>}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><Ticket className="w-5 h-5" /> Select Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ticketTypes.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No tickets available for this event</p>
            ) : (
              ticketTypes.map((ticket) => {
                const available = ticket.quantity - (ticket.sold || 0);
                return (
                  <div key={ticket.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/30">
                    <div>
                      <h4 className="font-semibold text-sm">{ticket.name}</h4>
                      {ticket.description && <p className="text-xs text-muted-foreground">{ticket.description}</p>}
                      <p className="text-primary font-bold mt-1">${ticket.price}</p>
                      <p className="text-xs text-muted-foreground">{available} remaining</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(ticket.id, -1)} disabled={(quantities[ticket.id] || 0) <= 0}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-semibold">{quantities[ticket.id] || 0}</span>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQty(ticket.id, 1)} disabled={(quantities[ticket.id] || 0) >= available}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {hasItems && (
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">${total.toFixed(2)}</span>
              </div>
              <Button size="lg" className="w-full" onClick={handlePurchase} disabled={purchasing}>
                {purchasing ? "Processing..." : "Confirm Purchase"}
              </Button>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default EventCheckout;
