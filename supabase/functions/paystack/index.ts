import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET) {
    return new Response(JSON.stringify({ error: "Paystack not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
  if (claimsError || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub;

  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    if (action === "initialize") {
      const body = await req.json();
      const { email, amount, metadata, callback_url } = body;

      if (!email || !amount) {
        return new Response(JSON.stringify({ error: "email and amount are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Initialize transaction with Paystack
      const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Paystack expects kobo
          callback_url,
          metadata: { ...metadata, user_id: userId },
        }),
      });

      const paystackData = await paystackRes.json();
      if (!paystackData.status) {
        return new Response(JSON.stringify({ error: paystackData.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify(paystackData.data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "verify") {
      const body = await req.json();
      const { reference } = body;

      if (!reference) {
        return new Response(JSON.stringify({ error: "reference is required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Verify transaction with Paystack
      const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
      });

      const paystackData = await paystackRes.json();
      if (!paystackData.status || paystackData.data.status !== "success") {
        return new Response(JSON.stringify({ error: "Payment not successful", details: paystackData }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payment = paystackData.data;
      const meta = payment.metadata || {};

      // Use service role to insert orders
      const adminSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Insert orders from metadata
      const tickets = meta.tickets || [];
      for (const ticket of tickets) {
        await adminSupabase.from("orders").insert({
          user_id: userId,
          event_id: meta.event_id,
          ticket_type_id: ticket.ticket_type_id,
          quantity: ticket.quantity,
          total_amount: ticket.total,
          status: "confirmed",
          payment_method: "paystack",
          payment_reference: reference,
          qr_code: crypto.randomUUID(),
        });
      }

      // Insert transaction record
      await adminSupabase.from("transactions").insert({
        user_id: userId,
        amount: payment.amount / 100, // Convert kobo back to naira
        type: "ticket_purchase",
        description: `Tickets for ${meta.event_title || "event"}`,
        reference_id: meta.event_id,
        status: "completed",
      });

      return new Response(JSON.stringify({ success: true, payment }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
