import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, CreditCard } from "lucide-react";
import { toast } from "sonner";

export const ArtistFeePopup = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [feeAmount, setFeeAmount] = useState(1000);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data: profile } = await supabase
        .from("profiles")
        .select("account_type, artist_fee_paid")
        .eq("id", user.id)
        .single();
      if (profile?.account_type === "artist" && !profile?.artist_fee_paid) {
        // Get fee amount from settings
        const { data: setting } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "artist_fee_amount")
          .single();
        if (setting) setFeeAmount(Number(setting.value) || 1000);
        setShow(true);
      }
    };
    check();
  }, [user]);

  const handlePay = async () => {
    if (!user) return;
    setPaying(true);
    try {
      const { data, error } = await supabase.functions.invoke("paystack", {
        body: {
          email: user.email,
          amount: feeAmount,
          metadata: { type: "artist_fee", user_id: user.id },
          callback_url: `${window.location.origin}/dashboard/payment-callback?type=artist_fee`,
        },
        headers: { "x-action": "initialize" },
      });

      // The function uses query params, so let's call it differently
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/paystack?action=initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            amount: feeAmount,
            metadata: { type: "artist_fee", user_id: user.id },
            callback_url: `${window.location.origin}/dashboard/payment-callback?type=artist_fee`,
          }),
        }
      );
      const result = await res.json();
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        toast.error(result.error || "Payment initialization failed");
      }
    } catch (e) {
      toast.error("Payment failed. Please try again.");
    }
    setPaying(false);
  };

  if (!show) return null;

  return (
    <Dialog open={show} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center text-lg">Artist Registration Fee</DialogTitle>
          <DialogDescription className="text-center text-sm">
            A one-time fee of <strong>₦{feeAmount.toLocaleString()}</strong> is required for your artist profile to be published and visible to organizers and fans.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={handlePay} disabled={paying} className="w-full gap-2 mt-2">
          <CreditCard className="w-4 h-4" />
          {paying ? "Processing..." : `Pay ₦${feeAmount.toLocaleString()} Now`}
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          This is a one-time payment. Your profile won't be visible until this fee is paid.
        </p>
      </DialogContent>
    </Dialog>
  );
};
