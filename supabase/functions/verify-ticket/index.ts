import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { code, action } = await req.json();

    if (!code || typeof code !== "string" || code.trim().length < 4) {
      return new Response(
        JSON.stringify({ error: "Invalid ticket code" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSupabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const ticketCode = code.trim().toUpperCase();

    // Look up the order by ticket_code
    const { data: orders, error } = await adminSupabase
      .from("orders")
      .select("*, events(*), ticket_types(*)")
      .eq("ticket_code", ticketCode)
      .limit(1);

    if (error || !orders || orders.length === 0) {
      return new Response(
        JSON.stringify({ status: "invalid", message: "Ticket not found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = orders[0];

    // Check if event has ended
    const eventEnd = order.events?.end_date || order.events?.date;
    if (eventEnd && new Date(eventEnd) < new Date()) {
      return new Response(
        JSON.stringify({
          status: "expired",
          event: { title: order.events?.title, date: order.events?.date, venue: order.events?.venue, banner_url: order.events?.banner_url },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get holder info
    const { data: holder } = await adminSupabase
      .from("profiles")
      .select("full_name, email, avatar_url, username")
      .eq("id", order.user_id)
      .single();

    // If action is "mark_used", verify the caller is admin/moderator
    if (action === "mark_used") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: claimsData, error: claimsError } = await userSupabase.auth.getClaims(
        authHeader.replace("Bearer ", "")
      );
      if (claimsError || !claimsData?.claims?.sub) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const userId = claimsData.claims.sub;

      // Check if user is admin or moderator
      const { data: roles } = await adminSupabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const userRoles = (roles || []).map((r: any) => r.role);
      if (!userRoles.includes("admin") && !userRoles.includes("moderator")) {
        return new Response(
          JSON.stringify({ error: "Forbidden: staff only" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Mark as used
      const { error: updateError } = await adminSupabase
        .from("orders")
        .update({ used_at: new Date().toISOString() })
        .eq("id", order.id);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: "Failed to update" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ status: "used", used_at: new Date().toISOString() }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine ticket status
    let ticketStatus = "invalid";
    if (order.used_at) {
      ticketStatus = "used";
    } else if (order.status === "confirmed") {
      ticketStatus = "valid";
    }

    return new Response(
      JSON.stringify({
        status: ticketStatus,
        order: {
          id: order.id,
          ticket_code: order.ticket_code,
          quantity: order.quantity,
          total_amount: order.total_amount,
          used_at: order.used_at,
        },
        event: {
          title: order.events?.title,
          date: order.events?.date,
          end_date: order.events?.end_date,
          venue: order.events?.venue,
          banner_url: order.events?.banner_url,
        },
        ticketType: {
          name: order.ticket_types?.name,
        },
        holder: holder
          ? {
              full_name: holder.full_name,
              email: holder.email,
              avatar_url: holder.avatar_url,
            }
          : null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("verify-ticket error:", e);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
