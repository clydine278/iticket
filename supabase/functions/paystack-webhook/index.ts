import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-paystack-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET) {
    return new Response("Not configured", { status: 500 });
  }

  // Verify Paystack signature
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const hash = createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");

  if (signature !== hash) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);

  if (event.event === "charge.success") {
    const payment = event.data;
    const meta = payment.metadata || {};
    const userId = meta.user_id;
    const reference = payment.reference;

    if (!userId || !meta.event_id) {
      return new Response("Missing metadata", { status: 200 });
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if order already exists for this reference (avoid duplicates)
    const { data: existing } = await adminSupabase
      .from("orders")
      .select("id")
      .eq("payment_reference", reference)
      .limit(1);

    if (existing && existing.length > 0) {
      return new Response("Already processed", { status: 200 });
    }

    // Insert orders
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

    // Insert transaction
    await adminSupabase.from("transactions").insert({
      user_id: userId,
      amount: payment.amount / 100,
      type: "ticket_purchase",
      description: `Tickets for ${meta.event_title || "event"}`,
      reference_id: meta.event_id,
      status: "completed",
    });
  }

  // Always return 200 to Paystack
  return new Response("OK", { status: 200 });
});
