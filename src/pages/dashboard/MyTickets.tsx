import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Calendar,
  MapPin,
  CheckCircle2,
  Download,
  Clock,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";

const MyTickets = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

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

  const isExpired = (order: any) => {
    const eventEnd = order.events?.end_date || order.events?.date;
    if (!eventEnd) return false;
    return new Date(eventEnd) < new Date();
  };

  const verifyUrl = (order: any) =>
    `${window.location.origin}/verify-ticket?code=${order.ticket_code}`;

  const downloadTicket = useCallback(async () => {
    if (!ticketRef.current || !selectedOrder) return;
    setDownloading(true);

    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
      });
      const link = document.createElement("a");
      link.download = `ticket-${selectedOrder.ticket_code || "download"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
    setDownloading(false);
  }, [selectedOrder]);

  // Ticket detail view
  if (selectedOrder) {
    const order = selectedOrder;
    const expired = isExpired(order);
    const eventDate = order.events?.date ? new Date(order.events.date) : null;

    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto">
          <button
            onClick={() => setSelectedOrder(null)}
            className="text-xs text-muted-foreground mb-4 hover:text-foreground transition-colors flex items-center gap-1"
          >
            ← Back to My Tickets
          </button>

          {/* Downloadable ticket card */}
          <div
            ref={ticketRef}
            className="rounded-2xl overflow-hidden border border-border/50 bg-white text-black"
          >
            {/* Banner */}
            <div className="relative h-36 overflow-hidden">
              {order.events?.banner_url ? (
                <img
                  src={order.events.banner_url}
                  alt={order.events?.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-400 to-indigo-600 flex items-center justify-center">
                  <Ticket className="w-12 h-12 text-white/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <p className="font-bold text-white text-base leading-tight truncate">
                  {order.events?.title || "Event"}
                </p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-white/80">
                  {eventDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {eventDate.toLocaleDateString("en-NG", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
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

              {/* Status badges */}
              {expired && (
                <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Expired
                </div>
              )}
              {order.used_at && !expired && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Used
                </div>
              )}
            </div>

            {/* Perforated divider */}
            <div className="relative">
              <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-background" />
              <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-background" />
              <div className="border-t-2 border-dashed border-gray-200 mx-6" />
            </div>

            {/* Ticket info */}
            <div className="p-5">
              <div className="grid grid-cols-2 gap-3 text-xs mb-5">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">
                    Ticket Type
                  </p>
                  <p className="font-semibold">{order.ticket_types?.name || "General"}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">
                    Quantity
                  </p>
                  <p className="font-semibold">{order.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">
                    Amount Paid
                  </p>
                  <p className="font-semibold">₦{Number(order.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-0.5">
                    Status
                  </p>
                  <p className={`font-semibold ${expired ? "text-red-600" : "text-emerald-600"}`}>
                    {expired ? "Expired" : order.used_at ? "Used" : "Active"}
                  </p>
                </div>
              </div>

              {/* QR Code + Ticket Code — hidden if expired */}
              {!expired ? (
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                    <QRCodeSVG value={verifyUrl(order)} size={180} level="H" includeMargin={false} />
                  </div>
                  <p className="font-mono text-sm mt-3 tracking-[0.2em] font-bold text-gray-800">
                    {order.ticket_code || "—"}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Present this QR code at the venue entrance
                  </p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Clock className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-400">Event has ended</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">
                    This ticket is no longer valid
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Download button — outside the captured area */}
          {!expired && (
            <Button
              onClick={downloadTicket}
              disabled={downloading}
              className="w-full mt-4"
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {downloading ? "Generating…" : "Download Ticket as PNG"}
            </Button>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // List view
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
          <div className="space-y-3">
            {orders.map((order) => {
              const expired = isExpired(order);
              const isUsed = !!order.used_at;
              const eventDate = order.events?.date ? new Date(order.events.date) : null;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full text-left"
                  >
                    <Card
                      className={`border-border/40 transition-all hover:shadow-md hover:border-border/70 ${
                        expired ? "opacity-50" : ""
                      }`}
                    >
                      <CardContent className="p-0">
                        <div className="flex items-stretch">
                          {/* Left: mini banner */}
                          <div className="w-20 shrink-0 relative overflow-hidden rounded-l-xl">
                            {order.events?.banner_url ? (
                              <img
                                src={order.events.banner_url}
                                alt=""
                                className="w-full h-full object-cover min-h-[80px]"
                              />
                            ) : (
                              <div className="w-full h-full min-h-[80px] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Ticket className="w-5 h-5 text-primary/30" />
                              </div>
                            )}
                          </div>

                          {/* Right: info */}
                          <div className="flex-1 p-3 flex flex-col justify-center min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-sm truncate">
                                {order.events?.title || "Event"}
                              </p>
                              <div className="shrink-0 flex items-center gap-1">
                                {expired ? (
                                  <span className="text-[9px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-semibold">
                                    Expired
                                  </span>
                                ) : isUsed ? (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                                    Used
                                  </span>
                                ) : (
                                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">
                                    Active
                                  </span>
                                )}
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                              {eventDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {eventDate.toLocaleDateString("en-NG", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                              {order.events?.venue && (
                                <span className="flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 shrink-0" />
                                  {order.events.venue}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {order.ticket_types?.name} × {order.quantity} · ₦
                              {Number(order.total_amount).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </button>
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
