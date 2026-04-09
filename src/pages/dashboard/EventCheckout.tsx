import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Minus, Plus, Ticket, ShieldCheck, CreditCard, Share2, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const EventCheckout = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      const { data } = await supabase
        .from("events")
        .select("*, ticket_types(*)")
        .eq("id", id)
        .single();
      if (data) {
        setEvent(data);
        const types = data.ticket_types || [];
        setTicketTypes(types);
        const defaultQty: Record<string, number> = {};
        types.forEach((t: any) => { defaultQty[t.id] = 1; });
        setQuantities(defaultQty);
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

  const selectedTickets = ticketTypes.filter(t => (quantities[t.id] || 0) > 0);
  const total = ticketTypes.reduce((sum, t) => sum + (quantities[t.id] || 0) * Number(t.price), 0);
  const hasItems = selectedTickets.length > 0;
  
  // Magic variable: Is the entire cart totally free?
  const isFreeOrder = total === 0 && hasItems;

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: event?.title, text: `Check out ${event?.title}!`, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Event link copied to clipboard." });
    }
  };

  // --- NEW: DIRECT FREE TICKET CLAIM ---
  const handleFreeTicket = async () => {
    if (!user || !event) return;
    setPurchasing(true);
    
    try {
      const generateTicketCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "TKT-";
        for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
        return code;
      };

      for (const t of selectedTickets) {
        const qty = quantities[t.id];
        
        for (let i = 0; i < qty; i++) {
          const { error } = await supabase.from("orders").insert({
            user_id: user.id,
            event_id: event.id,
            ticket_type_id: t.id,
            quantity: 1,
            total_amount: 0,
            status: "confirmed",
            payment_method: "free_claim",
            payment_reference: `FREE-${Date.now()}-${i}`,
            qr_code: crypto.randomUUID(),
            ticket_code: generateTicketCode(),
          });

          if (error) throw error;
        }
        
        // Update ticket availability
        await supabase.rpc("increment_sold", { _ticket_type_id: t.id, _qty: qty });
      }

      toast({ title: "Ticket claimed!", description: "Your free ticket is ready." });
      navigate("/dashboard/tickets"); // Adjust if your route is /dashboard/my-tickets
      
    } catch (err: any) {
      console.error("Free ticket error:", err);
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchase = async () => {
    if (!user || !event) return;
    setPurchasing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;
      if (!email) throw new Error("No email found for your account");

      const tickets = selectedTickets.map(t => ({
        ticket_type_id: t.id,
        quantity: quantities[t.id],
        total: quantities[t.id] * Number(t.price),
      }));

      const funcUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack?action=initialize`;
      const res = await fetch(funcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          email,
          amount: total,
          callback_url: `${window.location.origin}/dashboard/payment-callback`,
          metadata: {
            user_id: user.id, // Ensures webhook creates the ticket correctly
            event_id: event.id,
            event_title: event.title,
            tickets,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to initialize payment");
      window.location.href = data.authorization_url;
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
      setPurchasing(false);
    }
  };

  if (loading) {
    return <DashboardLayout><div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div></DashboardLayout>;
  }

  if (!event) {
    return <DashboardLayout><div className="text-center py-12"><h2 className="text-lg font-semibold">Event not found</h2></div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
        
        {event.banner_url && (
          <div className="relative rounded-2xl overflow-hidden mb-4 cursor-pointer" onClick={() => setImageOpen(true)}>
            <img
              src={event.banner_url}
              alt={event.title}
              className="w-full h-40 sm:h-56 object-cover object-top hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}

        <Card className="mb-6 border-border/40">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="capitalize text-xs">{event.category}</Badge>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold">{event.title}</h1>
                <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(event.date), "MMM d, yyyy · h:mm a")}</span>
                  {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.venue}{event.city ? `, ${event.city}` : ""}</span>}
                </div>
              </div>
              <Button size="icon" variant="outline" className="h-9 w-9 rounded-full shrink-0" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={imageOpen} onOpenChange={setImageOpen}>
          <DialogContent className="max-w-3xl p-0 bg-transparent border-none shadow-none [&>button]:hidden">
            <div className="relative">
              <img src={event.banner_url} alt={event.title} className="w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
              <button onClick={() => setImageOpen(false)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors shadow-md">
                <X className="w-4 h-4" />
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-3">
            <h2 className="font-display font-semibold text-base flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" /> Choose your tickets
            </h2>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Info className="w-3 h-3" /> Use the + or − buttons to adjust the number of tickets.
            </p>
            {ticketTypes.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No tickets available</CardContent></Card>
            ) : (
              ticketTypes.map((ticket) => {
                const available = ticket.quantity - (ticket.sold || 0);
                const qty = quantities[ticket.id] || 0;
                const isSelected = qty > 0;
                const isFree = Number(ticket.price) === 0;

                return (
                  <Card key={ticket.id} className={`transition-all ${isSelected ? "border-primary/50 shadow-md" : "border-border/40"}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{ticket.name}</h3>
                            {isFree && <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-[10px]">FREE</Badge>}
                            {available <= 10 && available > 0 && (
                              <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full">{available} left</span>
                            )}
                          </div>
                          {ticket.description && <p className="text-xs text-muted-foreground mb-2">{ticket.description}</p>}
                          <p className="text-lg font-bold text-primary">
                            {isFree ? "Free" : `₦${Number(ticket.price).toLocaleString()}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 bg-muted rounded-full p-1">
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => updateQty(ticket.id, -1)} disabled={qty <= 0}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-bold text-sm">{qty}</span>
                          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full" onClick={() => updateQty(ticket.id, 1)} disabled={qty >= available}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="sticky top-4">
              <Card className="border-border/40">
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-display font-semibold text-sm">Order Summary</h3>
                  {!hasItems ? (
                    <p className="text-xs text-muted-foreground text-center py-4">Select tickets to continue</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {selectedTickets.map(t => (
                          <div key={t.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{quantities[t.id]}× {t.name}</span>
                            <span className="font-medium">
                              {Number(t.price) === 0 ? "Free" : `₦${(quantities[t.id] * t.price).toLocaleString()}`}
                            </span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-primary">
                          {isFreeOrder ? "Free" : `₦${total.toLocaleString()}`}
                        </span>
                      </div>

                      {/* SMART BUTTON SWAP */}
                      {isFreeOrder ? (
                        <Button size="lg" className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleFreeTicket} disabled={purchasing}>
                          <Ticket className="w-4 h-4" />
                          {purchasing ? "Securing Ticket..." : "Get Ticket for Free"}
                        </Button>
                      ) : (
                        <Button size="lg" className="w-full gap-2" onClick={handlePurchase} disabled={purchasing}>
                          <CreditCard className="w-4 h-4" />
                          {purchasing ? "Redirecting to Paystack..." : "Pay with Paystack"}
                        </Button>
                      )}

                      {!isFreeOrder && (
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                          <ShieldCheck className="w-3 h-3" />
                          Secured by Paystack
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {event.description && (
          <Card className="mt-6 border-border/40">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-2">About this event</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default EventCheckout;