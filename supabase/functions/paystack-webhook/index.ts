import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

Deno.serve(async (req) => {
  // Paystack only sends POST for webhooks
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET) {
    return new Response("Not configured", { status: 500 });
  }

  // Read raw body for signature verification
  const body = await req.text();

  // Verify Paystack signature (HMAC SHA512 of the raw JSON body)
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return new Response("No signature", { status: 401 });
  }

  const hash = createHmac("sha512", PAYSTACK_SECRET).update(body).digest("hex");
  if (signature !== hash) {
    return new Response("Invalid signature", { status: 401 });
  }

  const event = JSON.parse(body);
  console.log("Paystack webhook event:", event.event);

  // Only process successful charges
  if (event.event === "charge.success") {
    const data = event.data;
    // Paystack charge.success payload structure:
    // data.id, data.domain, data.status, data.reference, data.amount (in kobo),
    // data.currency, data.channel, data.ip_address, data.fees,
    // data.metadata (custom metadata we sent during initialization),
    // data.customer { id, email, customer_code, first_name, last_name, phone },
    // data.authorization { authorization_code, bin, last4, exp_month, exp_year, channel, card_type, bank, brand, reusable, signature, account_name },
    // data.paid_at, data.created_at

    const meta = data.metadata || {};
    const userId = meta.user_id;
    const reference = data.reference;
    const amountInNaira = data.amount / 100; // Paystack sends amount in kobo
    const customerEmail = data.customer?.email || "";
    const channel = data.channel || "card"; // card, bank, ussd, qr, mobile_money, etc.
    const cardType = data.authorization?.card_type || "";
    const last4 = data.authorization?.last4 || "";
    const bank = data.authorization?.bank || "";
    const paidAt = data.paid_at;

    if (!userId || !meta.event_id) {
      console.log("Missing user_id or event_id in metadata, skipping");
      return new Response("OK", { status: 200 });
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Prevent duplicate processing
    const { data: existing } = await adminSupabase
      .from("orders")
      .select("id")
      .eq("payment_reference", reference)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log("Order already exists for reference:", reference);
      return new Response("Already processed", { status: 200 });
    }

    // Generate a unique ticket code (e.g., TKT-A1B2C3D4)
    const generateTicketCode = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "TKT-";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Insert orders for each ticket type
    const tickets = meta.tickets || [];
    for (const ticket of tickets) {
      const ticketCode = generateTicketCode();
      const { error } = await adminSupabase.from("orders").insert({
        user_id: userId,
        event_id: meta.event_id,
        ticket_type_id: ticket.ticket_type_id,
        quantity: ticket.quantity,
        total_amount: ticket.total,
        status: "confirmed",
        payment_method: `paystack_${channel}`,
        payment_reference: reference,
        qr_code: crypto.randomUUID(),
        ticket_code: ticketCode,
      });
      if (error) console.error("Order insert error:", error);
    }

    // Build a detailed description
    const paymentDetail = last4 ? `${cardType} ****${last4}` : channel;
    const description = `Tickets for ${meta.event_title || "event"} (${paymentDetail})`;

    // Insert transaction record
    const { error: txError } = await adminSupabase.from("transactions").insert({
      user_id: userId,
      amount: amountInNaira,
      type: "ticket_purchase",
      description,
      reference_id: meta.event_id,
      status: "completed",
    });
    if (txError) console.error("Transaction insert error:", txError);

    console.log(`✅ Processed charge.success: ${reference}, ₦${amountInNaira}, ${customerEmail}`);
  }

  // Always return 200 so Paystack doesn't retry
  return new Response("OK", { status: 200 });
});
