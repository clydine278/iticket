import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Music, DollarSign, Calendar, Users } from "lucide-react";

const Analytics = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchData = async () => {
    const [bookingsRes, challengesRes] = await Promise.all([
      supabase.from("bookings").select("*").eq("artist_id", user!.id),
      supabase.from("challenges").select("*").eq("creator_id", user!.id),
    ]);
    setBookings(bookingsRes.data || []);
    setChallenges(challengesRes.data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const totalBookings = bookings.length;
  const accepted = bookings.filter(b => b.status === "accepted").length;
  const pending = bookings.filter(b => b.status === "pending").length;
  const declined = bookings.filter(b => b.status === "declined").length;
  // Only count earnings where payment_status is 'paid'
  const totalEarnings = bookings
    .filter(b => b.payment_status === "paid")
    .reduce((sum, b) => sum + Number(b.offered_price || 0), 0);

  const stats = [
    { label: "Total Bookings", value: totalBookings, icon: Calendar, color: "text-primary" },
    { label: "Accepted", value: accepted, icon: TrendingUp, color: "text-emerald-500" },
    { label: "Pending", value: pending, icon: Music, color: "text-amber-500" },
    { label: "Earnings (Paid)", value: `₦${totalEarnings.toLocaleString()}`, icon: DollarSign, color: "text-primary" },
    { label: "Challenges Created", value: challenges.length, icon: BarChart3, color: "text-accent-foreground" },
    { label: "Entries Submitted", value: bookings.filter(b => b.status === "accepted").length, icon: Users, color: "text-accent-foreground" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" /> Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Track your performance and earnings</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50 hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-medium">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color} opacity-70`} />
                </div>
                <p className="font-display text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">Booking Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {totalBookings === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No bookings yet. Share your profile to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                <ProgressBar label="Accepted" value={accepted} total={totalBookings} color="bg-emerald-500" />
                <ProgressBar label="Pending" value={pending} total={totalBookings} color="bg-amber-500" />
                <ProgressBar label="Declined" value={declined} total={totalBookings} color="bg-destructive" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {bookings.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-muted-foreground">No bookings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {bookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{b.event_name || "Untitled Event"}</p>
                        <p className="text-xs text-muted-foreground">{b.venue || "—"}</p>
                      </div>
                      <StatusBadge status={b.payment_status === "paid" ? "paid" : b.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display">My Challenges</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {challenges.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-muted-foreground">No challenges created yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border/40">
                  {challenges.slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.participants_count || 0} participants</p>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "accepted" || status === "active" || status === "paid"
      ? "bg-emerald-500/10 text-emerald-600"
      : status === "pending"
      ? "bg-amber-500/10 text-amber-600"
      : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cls}`}>{status}</span>;
}

function ProgressBar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value} ({Math.round(pct)}%)</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default Analytics;
