import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const adminSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Find events that ended more than 24 hours ago
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Get expired event IDs
  const { data: expiredEvents, error: fetchErr } = await adminSupabase
    .from("events")
    .select("id")
    .or(`end_date.lt.${cutoff},and(end_date.is.null,date.lt.${cutoff})`);

  if (fetchErr || !expiredEvents || expiredEvents.length === 0) {
    return new Response(JSON.stringify({ message: "No expired events to clean up", error: fetchErr }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const eventIds = expiredEvents.map((e) => e.id);

  // Delete orders for expired events
  const { error: ordersErr, count: ordersDeleted } = await adminSupabase
    .from("orders")
    .delete({ count: "exact" })
    .in("event_id", eventIds);

  // Delete ticket types for expired events
  const { error: ttErr } = await adminSupabase
    .from("ticket_types")
    .delete()
    .in("event_id", eventIds);

  // Delete the expired events
  const { error: eventsErr, count: eventsDeleted } = await adminSupabase
    .from("events")
    .delete({ count: "exact" })
    .in("id", eventIds);

  console.log(`Cleanup: ${eventsDeleted} events, ${ordersDeleted} orders deleted`);

  return new Response(JSON.stringify({
    eventsDeleted,
    ordersDeleted,
    errors: { ordersErr, ttErr, eventsErr },
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
