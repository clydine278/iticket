import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [error, setError] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference || !user) return;

    const verify = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const funcUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/paystack?action=verify`;
        const res = await fetch(funcUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");

        setStatus("success");
      } catch (err: any) {
        setError(err.message);
        setStatus("failed");
      }
    };

    // Small delay to let webhook process first
    setTimeout(verify, 2000);
  }, [searchParams, user]);

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto py-12">
        <Card className="border-border/40">
          <CardContent className="p-8 text-center space-y-4">
            {status === "verifying" && (
              <>
                <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
                <h2 className="text-lg font-bold">Verifying your payment...</h2>
                <p className="text-sm text-muted-foreground">Please wait while we confirm your transaction.</p>
              </>
            )}
            {status === "success" && (
              <>
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h2 className="text-lg font-bold">Payment Successful!</h2>
                <p className="text-sm text-muted-foreground">Your tickets have been confirmed. Check your tickets page for details.</p>
                <Button onClick={() => navigate("/dashboard/tickets")} className="w-full">
                  View My Tickets
                </Button>
              </>
            )}
            {status === "failed" && (
              <>
                <XCircle className="w-12 h-12 text-destructive mx-auto" />
                <h2 className="text-lg font-bold">Payment Failed</h2>
                <p className="text-sm text-muted-foreground">{error || "Something went wrong with your payment."}</p>
                <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
                  Try Again
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PaymentCallback;
