import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Users, Ticket, DollarSign, CalendarPlus, Shield, Search,
  TrendingUp, Activity, Eye, BarChart3, UserCheck, UserX
} from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  account_type: string;
  city: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "events" | "transactions">("overview");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user) {
      checkAdminRole();
    }
  }, [user, loading]);

  const checkAdminRole = async () => {
    const { data } = await supabase.rpc("has_role", {
      _user_id: user!.id,
      _role: "admin",
    });
    if (data) {
      setIsAdmin(true);
      fetchData();
    } else {
      toast.error("Access denied. Admin only.");
      navigate("/dashboard", { replace: true });
    }
    setCheckingAdmin(false);
  };

  const fetchData = async () => {
    const [profilesRes, eventsRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
  };

  if (loading || checkingAdmin) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) return null;

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const artistCount = profiles.filter((p) => p.account_type === "artist").length;
  const organizerCount = profiles.filter((p) => p.account_type === "organizer").length;

  const filteredProfiles = profiles.filter(
    (p) =>
      (p.full_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (p.email?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (p.username?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, gradient: "from-primary to-orange-600" },
    { label: "Total Events", value: events.length, icon: CalendarPlus, gradient: "from-violet-500 to-purple-600" },
    { label: "Total Orders", value: orders.length, icon: Ticket, gradient: "from-emerald-500 to-teal-600" },
    { label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, gradient: "from-sky-500 to-blue-600" },
    { label: "Artists", value: artistCount, icon: Activity, gradient: "from-rose-500 to-pink-600" },
    { label: "Organizers", value: organizerCount, icon: UserCheck, gradient: "from-amber-500 to-yellow-600" },
  ];

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "events" as const, label: "Events", icon: CalendarPlus },
    { id: "transactions" as const, label: "Transactions", icon: DollarSign },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Manage users, events, and platform analytics</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted p-1 rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="font-display text-2xl font-bold">{stat.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Users */}
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display">Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {profiles.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{p.full_name || p.username || "Unknown"}</p>
                          <p className="text-[10px] text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        p.account_type === "artist" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" :
                        p.account_type === "organizer" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {p.account_type}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm rounded-lg"
              />
            </div>
            <Card className="border-border/40">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40">
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">User</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Email</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">City</th>
                        <th className="text-left p-3 text-xs font-medium text-muted-foreground">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map((p) => (
                        <tr key={p.id} className="border-b border-border/20 hover:bg-muted/30">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                                <Users className="w-3 h-3 text-muted-foreground" />
                              </div>
                              <span className="font-medium text-xs">{p.full_name || p.username || "—"}</span>
                            </div>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">{p.email || "—"}</td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              p.account_type === "artist" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400" :
                              p.account_type === "organizer" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {p.account_type}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-muted-foreground">{p.city || "—"}</td>
                          <td className="p-3 text-xs text-muted-foreground">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "events" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="border-border/40">
              <CardContent className="p-4">
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarPlus className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No events created yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {events.map((e) => (
                      <div key={e.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                        <div>
                          <p className="font-medium text-sm">{e.title}</p>
                          <p className="text-[10px] text-muted-foreground">{e.venue} • {new Date(e.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          e.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground"
                        }`}>
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === "transactions" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <Card className="border-border/40">
              <CardContent className="p-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orders.map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40">
                        <div>
                          <p className="font-medium text-sm">Order #{o.id.slice(0, 8)}</p>
                          <p className="text-[10px] text-muted-foreground">Qty: {o.quantity} • {o.payment_method || "—"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">₦{Number(o.total_amount).toLocaleString()}</p>
                          <span className={`text-[10px] ${o.status === "completed" ? "text-emerald-600" : "text-amber-600"}`}>
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
