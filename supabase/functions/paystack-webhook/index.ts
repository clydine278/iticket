import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createHmac } from "node:crypto";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const PAYSTACK_SECRET = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!PAYSTACK_SECRET) {
    return new Response("Not configured", { status: 500 });
  }

  const body = await req.text();

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

  if (event.event === "charge.success") {
    const data = event.data;
    const meta = data.metadata || {};
    const userId = meta.user_id;
    const reference = data.reference;
    const amountInNaira = data.amount / 100;
    const customerEmail = data.customer?.email || "";
    const channel = data.channel || "card";
    const cardType = data.authorization?.card_type || "";
    const last4 = data.authorization?.last4 || "";

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

    const generateTicketCode = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "TKT-";
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    // Insert ONE order row PER individual ticket (not per ticket type)
    const tickets = meta.tickets || [];
    for (const ticket of tickets) {
      const pricePerTicket = ticket.quantity > 0 ? ticket.total / ticket.quantity : ticket.total;
      for (let i = 0; i < ticket.quantity; i++) {
        const ticketCode = generateTicketCode();
        const { error } = await adminSupabase.from("orders").insert({
          user_id: userId,
          event_id: meta.event_id,
          ticket_type_id: ticket.ticket_type_id,
          quantity: 1,
          total_amount: pricePerTicket,
          status: "confirmed",
          payment_method: `paystack_${channel}`,
          payment_reference: reference,
          qr_code: crypto.randomUUID(),
          ticket_code: ticketCode,
        });
        if (error) console.error("Order insert error:", error);
      }

      // Decrement available quantity by incrementing sold count
      const { error: soldErr } = await adminSupabase.rpc("increment_sold", {
        _ticket_type_id: ticket.ticket_type_id,
        _qty: ticket.quantity,
      });
      if (soldErr) console.error("Increment sold error:", soldErr);
    }

    const paymentDetail = last4 ? `${cardType} ****${last4}` : channel;
    const description = `Tickets for ${meta.event_title || "event"} (${paymentDetail})`;

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

  return new Response("OK", { status: 200 });
});
