import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Ticket,
  Calendar,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Lock,
} from "lucide-react";

type TicketInfo = {
  order: any;
  event: any;
  ticketType: any;
  holder: any;
};

type VerifyStatus = "idle" | "loading" | "valid" | "used" | "invalid" | "expired";

const VerifyTicket = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [markingUsed, setMarkingUsed] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        const roles = (data || []).map((r: any) => r.role);
        setIsStaff(roles.includes("admin") || roles.includes("moderator"));
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (code && authChecked) {
      verifyTicket(code);
    }
  }, [authChecked]);

  const verifyTicket = async (ticketCode: string) => {
    if (!ticketCode.trim()) return;
    setStatus("loading");
    setTicketInfo(null);

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, events(*), ticket_types(*)")
      .eq("ticket_code", ticketCode.trim().toUpperCase())
      .limit(1);

    if (error || !orders || orders.length === 0) {
      setStatus("invalid");
      return;
    }

    const order = orders[0];

    const eventEnd = order.events?.end_date || order.events?.date;
    if (eventEnd && new Date(eventEnd) < new Date()) {
      setTicketInfo({ order, event: order.events, ticketType: order.ticket_types, holder: null });
      setStatus("expired");
      return;
    }

    const { data: holder } = await supabase
      .from("profiles")
      .select("full_name, email, avatar_url, username")
      .eq("id", order.user_id)
      .single();

    setTicketInfo({ order, event: order.events, ticketType: order.ticket_types, holder });

    if (order.used_at) {
      setStatus("used");
    } else if (order.status === "confirmed") {
      setStatus("valid");
    } else {
      setStatus("invalid");
    }
  };

  const markAsUsed = async () => {
    if (!ticketInfo) return;
    setMarkingUsed(true);
    const { error } = await supabase
      .from("orders")
      .update({ used_at: new Date().toISOString() })
      .eq("id", ticketInfo.order.id);

    if (!error) {
      setStatus("used");
      setTicketInfo((prev) =>
        prev ? { ...prev, order: { ...prev.order, used_at: new Date().toISOString() } } : prev
      );
    }
    setMarkingUsed(false);
  };

  const holderInitials = ticketInfo?.holder?.full_name
    ? ticketInfo.holder.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-xl font-display font-bold text-foreground">Ticket Verification</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Scan QR code or enter ticket code manually
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            placeholder="Enter code (e.g. TKT-A1B2C3D4)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="font-mono text-sm tracking-wider"
            onKeyDown={(e) => e.key === "Enter" && verifyTicket(code)}
          />
          <Button
            onClick={() => verifyTicket(code)}
            disabled={!code.trim() || status === "loading"}
            size="sm"
          >
            {status === "loading" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {status === "loading" && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              <p className="text-sm mt-3 text-muted-foreground">Verifying ticket…</p>
            </CardContent>
          </Card>
        )}

        {status === "invalid" && (
          <Card className="border-destructive/30">
            <CardContent className="p-8 text-center">
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
              <p className="font-semibold text-sm text-foreground mb-1">Invalid Ticket</p>
              <p className="text-xs text-muted-foreground">
                This ticket code was not found or the order is not confirmed.
              </p>
            </CardContent>
          </Card>
        )}

        {status === "expired" && ticketInfo && (
          <Card className="border-muted-foreground/20">
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-sm text-foreground mb-1">Event Ended</p>
              <p className="text-xs text-muted-foreground">
                {ticketInfo.event?.title || "This event"} has already ended. This ticket is no longer valid.
              </p>
            </CardContent>
          </Card>
        )}

        {(status === "valid" || status === "used") && ticketInfo && (
          <Card className="overflow-hidden">
            <div
              className={`px-4 py-2.5 flex items-center gap-2 text-white text-sm font-semibold ${
                status === "used" ? "bg-amber-600" : "bg-emerald-600"
              }`}
            >
              {status === "used" ? (
                <>
                  <AlertTriangle className="w-4 h-4" /> Ticket Already Used
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Valid Ticket
                </>
              )}
            </div>

            <CardContent className="p-4 space-y-4">
              <div className="flex gap-3">
                {ticketInfo.event?.banner_url ? (
                  <img
                    src={ticketInfo.event.banner_url}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Ticket className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-sm text-foreground truncate">
                    {ticketInfo.event?.title || "Event"}
                  </p>
                  <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-muted-foreground">
                    {ticketInfo.event?.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticketInfo.event.date).toLocaleDateString("en-NG", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {ticketInfo.event?.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ticketInfo.event.venue}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Ticket Type</p>
                  <p className="font-medium text-foreground">{ticketInfo.ticketType?.name || "General"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Quantity</p>
                  <p className="font-medium text-foreground">{ticketInfo.order.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Code</p>
                  <p className="font-mono font-medium tracking-wider text-foreground">{ticketInfo.order.ticket_code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Amount</p>
                  <p className="font-medium text-foreground">₦{Number(ticketInfo.order.total_amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                {ticketInfo.holder?.avatar_url ? (
                  <img src={ticketInfo.holder.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {holderInitials}
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-foreground">{ticketInfo.holder?.full_name || "Unknown"}</p>
                  <p className="text-[10px] text-muted-foreground">{ticketInfo.holder?.email || ""}</p>
                </div>
              </div>

              {status === "used" && ticketInfo.order.used_at && (
                <p className="text-[10px] text-amber-500 text-center">
                  Used on {new Date(ticketInfo.order.used_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}

              {status === "valid" && isStaff && (
                <Button onClick={markAsUsed} disabled={markingUsed} className="w-full" size="sm">
                  {markingUsed ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  Admit — Mark as Used
                </Button>
              )}

              {status === "valid" && !isStaff && (
                <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground py-2">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Only event staff can admit this ticket</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerifyTicket;
