import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, Calendar, MapPin, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const MyTickets = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*, events(*), ticket_types(*)")
      .eq("user_id", user!.id)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  const verifyUrl = (order: any) =>
    `${window.location.origin}/verify-ticket?code=${order.ticket_code}`;

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto">
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
              <p className="text-xs text-muted-foreground">
                Purchase tickets to events and they'll appear here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isUsed = !!order.used_at;
              const isExpanded = expandedId === order.id;
              const eventDate = order.events?.date
                ? new Date(order.events.date)
                : null;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {/* Ticket Card */}
                  <div
                    className={`relative rounded-2xl overflow-hidden border ${
                      isUsed
                        ? "border-muted-foreground/20 opacity-60"
                        : "border-border/50"
                    } bg-card shadow-sm`}
                  >
                    {/* Top: Event Banner + Info */}
                    <div className="relative h-28 overflow-hidden">
                      {order.events?.banner_url ? (
                        <img
                          src={order.events.banner_url}
                          alt={order.events?.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Ticket className="w-10 h-10 text-primary/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4">
                        <p className="font-bold text-white text-sm leading-tight truncate">
                          {order.events?.title || "Event"}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-white/80">
                          {eventDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {eventDate.toLocaleDateString("en-NG", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                          {order.events?.venue && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {order.events.venue}
                            </span>
                          )}
                        </div>
                      </div>
                      {isUsed && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Used
                        </div>
                      )}
                    </div>

                    {/* Perforated divider */}
                    <div className="relative">
                      <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-background" />
                      <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-background" />
                      <div className="border-t border-dashed border-border/60 mx-6" />
                    </div>

                    {/* Bottom: Ticket Details */}
                    <div className="p-4 pt-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                            {order.ticket_types?.name || "General"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Qty: {order.quantity} · ₦
                            {Number(order.total_amount).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            setExpandedId(isExpanded ? null : order.id)
                          }
                          className="text-xs text-primary flex items-center gap-1 font-medium"
                        >
                          {isExpanded ? "Hide" : "Show"} QR
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 flex flex-col items-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <div className="cursor-pointer bg-white p-3 rounded-xl shadow-sm border border-border/30">
                                    <QRCodeSVG
                                      value={verifyUrl(order)}
                                      size={160}
                                      level="H"
                                      includeMargin={false}
                                    />
                                  </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-xs flex flex-col items-center p-6">
                                  <div className="bg-white p-4 rounded-xl">
                                    <QRCodeSVG
                                      value={verifyUrl(order)}
                                      size={240}
                                      level="H"
                                    />
                                  </div>
                                  <p className="text-sm font-mono mt-3 tracking-widest font-bold">
                                    {order.ticket_code || "—"}
                                  </p>
                                </DialogContent>
                              </Dialog>
                              <p className="text-xs font-mono mt-2 tracking-widest text-muted-foreground">
                                {order.ticket_code || "—"}
                              </p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">
                                Tap QR code to enlarge
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTickets;
