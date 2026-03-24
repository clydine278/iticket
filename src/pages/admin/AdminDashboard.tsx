import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { toast } from "sonner";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { AdminEventList } from "@/components/admin/AdminEventList";
import { AdminTransactionList } from "@/components/admin/AdminTransactionList";
import { AdminPartnerList } from "@/components/admin/AdminPartnerList";
import { Shield, BarChart3, Users, CalendarPlus, DollarSign, Handshake } from "lucide-react";

export interface AdminProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  account_type: string;
  city: string | null;
  country: string | null;
  status: string | null;
  created_at: string;
}

const tabs = [
  { id: "overview" as const, label: "Overview", icon: BarChart3 },
  { id: "users" as const, label: "Users", icon: Users },
  { id: "events" as const, label: "Events", icon: CalendarPlus },
  { id: "transactions" as const, label: "Transactions", icon: DollarSign },
  { id: "partners" as const, label: "Partners", icon: Handshake },
];

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "events" | "transactions">("overview");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user) checkAdminRole();
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md shrink-0">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage users, events, and platform analytics</p>
          </div>
        </div>

        {/* Tabs — scrollable on mobile */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 bg-muted p-1 rounded-xl w-max sm:w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <AdminStatsGrid profiles={profiles} events={events} orders={orders} totalRevenue={totalRevenue} />
            <AdminUserTable profiles={profiles.slice(0, 5)} compact onRefresh={fetchData} />
          </div>
        )}

        {activeTab === "users" && (
          <div className="animate-in fade-in duration-300">
            <AdminUserTable profiles={profiles} onRefresh={fetchData} />
          </div>
        )}

        {activeTab === "events" && (
          <div className="animate-in fade-in duration-300">
            <AdminEventList events={events} onRefresh={fetchData} />
          </div>
        )}

        {activeTab === "transactions" && (
          <div className="animate-in fade-in duration-300">
            <AdminTransactionList orders={orders} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
