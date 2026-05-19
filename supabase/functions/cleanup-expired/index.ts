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

  let eventsDeleted = 0;
  let ordersDeleted = 0;
  const errors: Record<string, unknown> = {};

  // ===== EVENTS CLEANUP =====
  const { data: expiredEvents, error: fetchErr } = await adminSupabase
    .from("events")
    .select("id")
    .or(`end_date.lt.${cutoff},and(end_date.is.null,date.lt.${cutoff})`);

  if (fetchErr) errors.fetchEventsErr = fetchErr.message;

  if (expiredEvents && expiredEvents.length > 0) {
    const eventIds = expiredEvents.map((e) => e.id);

    const { error: ordersErr, count: oc } = await adminSupabase
      .from("orders").delete({ count: "exact" }).in("event_id", eventIds);
    if (ordersErr) errors.ordersErr = ordersErr.message;
    ordersDeleted = oc ?? 0;

    const { error: ttErr } = await adminSupabase
      .from("ticket_types").delete().in("event_id", eventIds);
    if (ttErr) errors.ttErr = ttErr.message;

    const { error: eventsErr, count: ec } = await adminSupabase
      .from("events").delete({ count: "exact" }).in("id", eventIds);
    if (eventsErr) errors.eventsErr = eventsErr.message;
    eventsDeleted = ec ?? 0;
  }

  // ===== CHALLENGES CLEANUP =====
  // Delete challenges whose end_date passed more than 24h ago
  let challengesDeleted = 0;
  let entriesDeleted = 0;

  const { data: expiredChallenges, error: chFetchErr } = await adminSupabase
    .from("challenges")
    .select("id")
    .not("end_date", "is", null)
    .lt("end_date", cutoff);

  if (chFetchErr) errors.chFetchErr = chFetchErr.message;

  if (expiredChallenges && expiredChallenges.length > 0) {
    const challengeIds = expiredChallenges.map((c) => c.id);

    const { error: entriesErr, count: enc } = await adminSupabase
      .from("challenge_entries").delete({ count: "exact" }).in("challenge_id", challengeIds);
    if (entriesErr) errors.entriesErr = entriesErr.message;
    entriesDeleted = enc ?? 0;

    const { error: chErr, count: cc } = await adminSupabase
      .from("challenges").delete({ count: "exact" }).in("id", challengeIds);
    if (chErr) errors.chErr = chErr.message;
    challengesDeleted = cc ?? 0;
  }

  console.log(`Cleanup: ${eventsDeleted} events, ${ordersDeleted} orders, ${challengesDeleted} challenges, ${entriesDeleted} entries deleted`);

  return new Response(JSON.stringify({
    eventsDeleted,
    ordersDeleted,
    challengesDeleted,
    entriesDeleted,
    errors,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
