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

type TicketData = {
  order: { id: string; ticket_code: string; quantity: number; total_amount: number; used_at: string | null };
  event: { title: string; date: string; end_date: string | null; venue: string; banner_url: string | null };
  ticketType: { name: string };
  holder: { full_name: string; email: string; avatar_url: string | null } | null;
};

type VerifyStatus = "idle" | "loading" | "valid" | "used" | "invalid" | "expired";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const VerifyTicket = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [status, setStatus] = useState<VerifyStatus>("idle");
  const [ticketData, setTicketData] = useState<TicketData | null>(null);
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
    setTicketData(null);

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ticketCode.trim().toUpperCase() }),
      });

      const data = await res.json();

      if (data.status === "invalid") {
        setStatus("invalid");
        return;
      }

      if (data.status === "expired") {
        setTicketData({ order: {} as any, event: data.event, ticketType: { name: "" }, holder: null });
        setStatus("expired");
        return;
      }

      setTicketData({
        order: data.order,
        event: data.event,
        ticketType: data.ticketType,
        holder: data.holder,
      });

      setStatus(data.status === "used" ? "used" : data.status === "valid" ? "valid" : "invalid");
    } catch {
      setStatus("invalid");
    }
  };

  const markAsUsed = async () => {
    if (!ticketData) return;
    setMarkingUsed(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setMarkingUsed(false);
        return;
      }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-ticket`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: ticketData.order.ticket_code, action: "mark_used" }),
      });

      const result = await res.json();
      if (result.status === "used") {
        setStatus("used");
        setTicketData((prev) =>
          prev ? { ...prev, order: { ...prev.order, used_at: result.used_at } } : prev
        );
      }
    } catch {
      // silent
    }
    setMarkingUsed(false);
  };

  const holderInitials = ticketData?.holder?.full_name
    ? ticketData.holder.full_name
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

        {status === "expired" && ticketData && (
          <Card className="border-muted-foreground/20">
            <CardContent className="p-8 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-semibold text-sm text-foreground mb-1">Event Ended</p>
              <p className="text-xs text-muted-foreground">
                {ticketData.event?.title || "This event"} has already ended. This ticket is no longer valid.
              </p>
            </CardContent>
          </Card>
        )}

        {(status === "valid" || status === "used") && ticketData && (
          <Card className="overflow-hidden">
            <div
              className={`px-4 py-2.5 flex items-center gap-2 text-white text-sm font-semibold ${
                status === "used" ? "bg-amber-600" : "bg-emerald-600"
              }`}
            >
              {status === "used" ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Approved
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Valid Ticket
                </>
              )}
            </div>

            <CardContent className="p-4 space-y-4">
              <div className="flex gap-3">
                {ticketData.event?.banner_url ? (
                  <img
                    src={ticketData.event.banner_url}
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
                    {ticketData.event?.title || "Event"}
                  </p>
                  <div className="flex flex-col gap-0.5 mt-1 text-[11px] text-muted-foreground">
                    {ticketData.event?.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticketData.event.date).toLocaleDateString("en-NG", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    )}
                    {ticketData.event?.venue && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {ticketData.event.venue}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Ticket Type</p>
                  <p className="font-medium text-foreground">{ticketData.ticketType?.name || "General"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Quantity</p>
                  <p className="font-medium text-foreground">{ticketData.order.quantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Code</p>
                  <p className="font-mono font-medium tracking-wider text-foreground">{ticketData.order.ticket_code}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Amount</p>
                  <p className="font-medium text-foreground">₦{Number(ticketData.order.total_amount).toLocaleString()}</p>
                </div>
              </div>

              {ticketData.holder && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  {ticketData.holder.avatar_url ? (
                    <img src={ticketData.holder.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {holderInitials}
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-medium text-foreground">{ticketData.holder.full_name || "Unknown"}</p>
                    <p className="text-[10px] text-muted-foreground">{ticketData.holder.email || ""}</p>
                  </div>
                </div>
              )}

              {status === "used" && ticketData.order.used_at && (
                <p className="text-[10px] text-amber-500 text-center">
                  Used on {new Date(ticketData.order.used_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
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
