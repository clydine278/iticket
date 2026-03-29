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

const MyTickets = () => {
  const { user } = useAuth();
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

  const isApproved = (order: any) => !!order.used_at;

  const verifyUrl = (order: any) => {
    const origin = window.location.origin;
    return `${origin}/verify-ticket?code=${order.ticket_code}`;
  };

  const downloadTicket = useCallback(async () => {
    if (!ticketRef.current || !selectedOrder) return;
    setDownloading(true);

    try {
      const { default: html2canvas } = await import("html2canvas");

      const clone = ticketRef.current.cloneNode(true) as HTMLElement;
      Object.assign(clone.style, {
        position: "fixed",
        left: "-9999px",
        top: "0",
        width: "480px",
        minHeight: "auto",
        transform: "none",
        zIndex: "-1",
      });
      document.body.appendChild(clone);

      const canvas = await html2canvas(clone, {
        backgroundColor: "#ffffff",
        scale: 3,
        useCORS: true,
        logging: false,
        width: 480,
        windowWidth: 480,
      });

      document.body.removeChild(clone);

      const link = document.createElement("a");
      link.download = `ticket-${selectedOrder.ticket_code || "download"}.png`;
      link.href = canvas.toDataURL("image/png", 1);
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
    const approved = isApproved(order);
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

          <div
            ref={ticketRef}
            style={{
              borderRadius: "16px",
              overflow: "hidden",
              border: "1px solid #e5e7eb",
              backgroundColor: "#ffffff",
              color: "#000000",
              fontFamily: "system-ui, -apple-system, sans-serif",
              width: "100%",
            }}
          >
            {/* Banner */}
            <div style={{ position: "relative", width: "100%", height: "180px", overflow: "hidden" }}>
              {order.events?.banner_url ? (
                <img
                  src={order.events.banner_url}
                  alt={order.events?.title}
                  crossOrigin="anonymous"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{
                  width: "100%", height: "100%",
                  background: "linear-gradient(135deg, #8b5cf6, #4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ticket style={{ width: 48, height: 48, color: "rgba(255,255,255,0.3)" }} />
                </div>
              )}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1), transparent)",
              }} />
              <div style={{ position: "absolute", bottom: 14, left: 16, right: 16 }}>
                <p style={{
                  fontWeight: 700, color: "#fff", fontSize: 18,
                  lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {order.events?.title || "Event"}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>
                  {eventDate && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <Calendar style={{ width: 13, height: 13 }} />
                      {eventDate.toLocaleDateString("en-NG", {
                        weekday: "short", month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                  )}
                  {order.events?.venue && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <MapPin style={{ width: 13, height: 13 }} />
                      {order.events.venue}
                    </span>
                  )}
                </div>
              </div>

              {expired && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  backgroundColor: "#dc2626", color: "#fff", fontSize: 11,
                  fontWeight: 600, padding: "4px 12px", borderRadius: 999,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Clock style={{ width: 12, height: 12 }} /> Expired
                </div>
              )}
              {approved && !expired && (
                <div style={{
                  position: "absolute", top: 12, right: 12,
                  backgroundColor: "#059669", color: "#fff", fontSize: 11,
                  fontWeight: 600, padding: "4px 12px", borderRadius: 999,
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <CheckCircle2 style={{ width: 12, height: 12 }} /> Approved
                </div>
              )}
            </div>

            {/* Perforated divider */}
            <div style={{ position: "relative", height: 1, overflow: "visible" }}>
              <div style={{
                position: "absolute", left: -12, top: -12,
                width: 24, height: 24, borderRadius: "50%", backgroundColor: "#f3f4f6",
              }} />
              <div style={{
                position: "absolute", right: -12, top: -12,
                width: 24, height: 24, borderRadius: "50%", backgroundColor: "#f3f4f6",
              }} />
              <div style={{ borderTop: "2px dashed #e5e7eb", margin: "0 24px" }} />
            </div>

            {/* Ticket info */}
            <div style={{ padding: "20px 20px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, fontSize: 13, marginBottom: 24 }}>
                <div>
                  <p style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    Ticket Type
                  </p>
                  <p style={{ fontWeight: 600 }}>{order.ticket_types?.name || "General"}</p>
                </div>
                <div>
                  <p style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    Amount Paid
                  </p>
                  <p style={{ fontWeight: 600 }}>₦{Number(order.total_amount).toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ color: "#9ca3af", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    Status
                  </p>
                  <p style={{ fontWeight: 600, color: expired ? "#dc2626" : approved ? "#059669" : "#059669" }}>
                    {expired ? "Expired" : approved ? "Approved" : "Active"}
                  </p>
                </div>
              </div>

              {approved && !expired ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0" }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: "50%",
                    backgroundColor: "#059669", display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CheckCircle2 style={{ width: 56, height: 56, color: "#ffffff" }} />
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 18, marginTop: 14, color: "#059669" }}>
                    Approved
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    This ticket has been verified and admitted
                  </p>
                  {order.used_at && (
                    <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                      {new Date(order.used_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                    </p>
                  )}
                </div>
              ) : !expired ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    backgroundColor: "#fff", padding: 16, borderRadius: 12,
                    border: "1px solid #f3f4f6", boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                  }}>
                    <QRCodeSVG value={verifyUrl(order)} size={160} level="H" includeMargin={false} />
                  </div>
                  <p style={{ fontFamily: "monospace", fontSize: 16, marginTop: 14, letterSpacing: "0.2em", fontWeight: 700, color: "#1f2937" }}>
                    {order.ticket_code || "—"}
                  </p>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                    Present this QR code at the venue entrance
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <Clock style={{ width: 40, height: 40, color: "#d1d5db", margin: "0 auto 8px" }} />
                  <p style={{ fontSize: 14, fontWeight: 500, color: "#9ca3af" }}>Event has ended</p>
                  <p style={{ fontSize: 11, color: "#d1d5db", marginTop: 2 }}>
                    This ticket is no longer valid
                  </p>
                </div>
              )}
            </div>
          </div>

          {!expired && !approved && (
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
              const approved = isApproved(order);
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
                                ) : approved ? (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-semibold">
                                    Approved
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
                              {order.ticket_types?.name} · ₦
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
