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
import { AdminArtistFeeSettings } from "@/components/admin/AdminArtistFeeSettings";
import { AdminChallengeApprovals } from "@/components/admin/AdminChallengeApprovals";
import { AdminAllSubmissions } from "@/components/admin/AdminAllSubmissions";
import { Shield, BarChart3, Users, CalendarPlus, DollarSign, Handshake, Sparkles, Activity, CheckCircle2, Trophy } from "lucide-react";

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
  { id: "artist-fees" as const, label: "Artist Fees", icon: Sparkles },
  { id: "approvals" as const, label: "Approvals", icon: CheckCircle2 },
  { id: "submissions" as const, label: "All Submissions", icon: Trophy },
  { id: "audit-logs" as const, label: "Audit Logs", icon: Activity },
];

type TabId = typeof tabs[number]["id"];

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]); // <-- Added Transactions State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
      return;
    }
    if (user) checkAdminRole();
  }, [user, loading]);

  const handleMakeAdmin = async (targetUserId: string, userName: string) => {
    if (!window.confirm(`Are you absolutely sure you want to make ${userName} an Admin? They will have full access to this dashboard.`)) {
      return;
    }

    setIsProcessing(targetUserId);
    toast.loading(`Promoting ${userName}...`, { id: "promo-toast" });

    try {
      const { data, error } = await supabase.functions.invoke("admin-actions", {
        body: { action: "make_admin", targetId: targetUserId },
      });

      if (error) throw error;
      toast.success(`${userName} is now an admin!`, { id: "promo-toast" });
    } catch (err: any) {
      console.error("Promo Error:", err);
      toast.error(err.message || "Failed to promote user.", { id: "promo-toast" });
    } finally {
      setIsProcessing(null);
    }
  };

  const checkAdminRole = async () => {
    try {
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user!.id,
        _role: "admin",
      });
      
      if (error) {
        toast.error(`DB Error: ${error.message}`, { duration: 10000 });
        setCheckingAdmin(false);
        return; 
      }
      
      if (data) {
        setIsAdmin(true);
        fetchData();
      } else {
        toast.error("Database returned false. You don't have the role.");
      }
    } catch (error: any) {
      console.error("Code Execution Error:", error);
      toast.error(`Catch Error: ${error.message}`, { duration: 10000 });
    } finally {
      setCheckingAdmin(false);
    }
  };

  const fetchData = async () => {
    // We now fetch the permanent transactions ledger to calculate revenue accurately
    const [profilesRes, eventsRes, ordersRes, logsRes, txRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }).limit(30),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
    ]);
    
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (eventsRes.data) setEvents(eventsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
    if (logsRes.data) setAuditLogs(logsRes.data as any[]);
    if (txRes.data) setTransactions(txRes.data as any[]);
  };

  if (loading || checkingAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-r-2 border-accent animate-spin-reverse"></div>
          </div>
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Authenticating Command Center...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) return null;

  // 🚀 THE FIX: Calculate revenue from the permanent transactions ledger!
  // This will never delete when an event deletes, and it includes Challenge/Artist fees!
  const totalRevenue = transactions
    .filter(tx => tx.status === "completed" || tx.status === "success")
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Modern Header with Glassmorphism */}
        <div className="relative p-6 rounded-2xl bg-background/60 backdrop-blur-xl border border-border/50 shadow-sm overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Command Center</h1>
                <p className="text-sm text-muted-foreground mt-1">Platform overview, user management, and system analytics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border/50">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-medium text-foreground">Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Scrollable Tabs Setup */}
        <div className="sticky top-0 z-10 -mx-4 px-4 sm:mx-0 sm:px-0 pb-4 bg-background/80 backdrop-blur-md">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-primary-foreground" : ""}`} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Areas */}
        <div className="min-h-[500px] bg-background/40 border border-border/40 rounded-2xl p-4 sm:p-6 shadow-sm">
          {activeTab === "overview" && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminStatsGrid profiles={profiles} events={events} orders={orders} totalRevenue={totalRevenue} />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold tracking-tight">Recent Signups</h3>
                  <button onClick={() => setActiveTab("users")} className="text-sm text-primary hover:underline">View all</button>
                </div>
                <div className="border border-border/50 rounded-xl overflow-hidden bg-background">
                  <AdminUserTable profiles={profiles.slice(0, 5)} compact onRefresh={fetchData} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminUserTable profiles={profiles} onRefresh={fetchData} />
            </div>
          )}

          {activeTab === "events" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminEventList events={events} onRefresh={fetchData} />
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminTransactionList orders={orders} />
            </div>
          )}

          {activeTab === "partners" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminPartnerList />
            </div>
          )}

          {activeTab === "artist-fees" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminArtistFeeSettings />
            </div>
          )}
          
          {activeTab === "approvals" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminChallengeApprovals />
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
              <AdminAllSubmissions profiles={profiles} />
            </div>
          )}

          {activeTab === "audit-logs" && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">System Audit Logs</h2>
                  <p className="text-sm text-muted-foreground mt-1">Track sensitive actions performed by administrators.</p>
                </div>
                <button 
                  onClick={fetchData} 
                  className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm font-medium transition-colors"
                >
                  Refresh Logs
                </button>
              </div>
              
              {auditLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border border-dashed border-border/60 rounded-xl bg-background/50">
                  <Activity className="w-8 h-8 mx-auto mb-3 opacity-20" />
                  No security or administrative activity logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-background/60 hover:bg-muted/20 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        log.action_type.includes('PROMOTE') ? 'bg-amber-100 text-amber-600' : 
                        log.action_type.includes('BAN') ? 'bg-red-100 text-red-600' : 
                        'bg-primary/10 text-primary'
                      }`}>
                        <Activity className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                           <p className="text-sm font-bold text-foreground">{log.action_type.replace(/_/g, ' ')}</p>
                           <span className="text-xs text-muted-foreground whitespace-nowrap">
                             {new Date(log.created_at).toLocaleString()}
                           </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{log.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">
                             Admin: {log.admin_id.substring(0,8)}...
                           </p>
                           {log.target_id && (
                             <p className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md">
                               Target: {log.target_id.substring(0,8)}...
                             </p>
                           )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;