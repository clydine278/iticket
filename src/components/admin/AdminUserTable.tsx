import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ShieldAlert, Mail, MapPin, Calendar, Phone, 
  X, UserCog, Ban, AlertTriangle, Activity, Search
} from "lucide-react";
import { AdminProfile } from "@/pages/admin/AdminDashboard";

interface AdminUserTableProps {
  profiles: AdminProfile[];
  compact?: boolean;
  onRefresh: () => void;
}

export const AdminUserTable = ({ profiles, compact = false, onRefresh }: AdminUserTableProps) => {
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProfiles = useMemo(() => {
    if (!searchTerm.trim()) return profiles;
    
    const lowerSearch = searchTerm.toLowerCase();
    return profiles.filter((profile) => {
      return (
        profile.full_name?.toLowerCase().includes(lowerSearch) ||
        profile.username?.toLowerCase().includes(lowerSearch) ||
        profile.email?.toLowerCase().includes(lowerSearch) ||
        profile.phone?.toLowerCase().includes(lowerSearch) ||
        profile.id.toLowerCase().includes(lowerSearch)
      );
    });
  }, [profiles, searchTerm]);

  const handleAdminAction = async (action: string, confirmMessage: string, successMessage: string) => {
    if (!selectedUser) return;
    if (!window.confirm(confirmMessage)) return;

    setIsProcessing(action);
    toast.loading(`Processing action for ${selectedUser.full_name || selectedUser.username || 'User'}...`, { id: "admin-action" });

    try {
      const { error } = await supabase.functions.invoke("admin-actions", {
        body: { action: action, targetId: selectedUser.id },
      });

      if (error) throw error;

      toast.success(successMessage, { id: "admin-action" });
      onRefresh(); 
      setSelectedUser(null); 
      
    } catch (err: any) {
      console.error("Action Error:", err);
      toast.error(err.message || "Failed to execute action.", { id: "admin-action" });
    } finally {
      setIsProcessing(null);
    }
  };

  if (!profiles || profiles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed border-border/60">
        No users found on the platform.
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      
      {!compact && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-background border border-border/50 rounded-xl max-w-md shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search by name, email, username, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto w-full border border-border/40 rounded-xl bg-background/50">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/50 text-sm text-muted-foreground bg-muted/20">
              <th className="py-3 px-4 font-medium">User</th>
              {!compact && <th className="py-3 px-4 font-medium">Contact</th>}
              {!compact && <th className="py-3 px-4 font-medium">Location</th>}
              <th className="py-3 px-4 font-medium">Joined</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => {
                const displayName = profile.full_name || profile.username || "Unknown User";
                
                return (
                  <tr key={profile.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">{displayName}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {profile.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>

                    {!compact && (
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {profile.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="w-3.5 h-3.5" /> {profile.email}
                            </div>
                          )}
                        </div>
                      </td>
                    )}

                    {!compact && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          {profile.city || profile.country ? `${profile.city || ''} ${profile.country || ''}` : "Not provided"}
                        </div>
                      </td>
                    )}

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(profile.created_at).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(profile)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-border/50 shadow-sm"
                      >
                        <UserCog className="w-3.5 h-3.5" /> Manage
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={compact ? 3 : 5} className="py-12 text-center text-sm text-muted-foreground">
                  No users found matching "{searchTerm}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background w-full max-w-lg rounded-2xl shadow-xl border border-border/50 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between p-5 border-b border-border/50">
              <h2 className="text-lg font-semibold tracking-tight">Manage User</h2>
              <button onClick={() => setSelectedUser(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-5 space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary text-xl font-bold">
                    {(selectedUser.full_name || selectedUser.username || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{selectedUser.full_name || "No Name Provided"}</h3>
                    <p className="text-sm text-muted-foreground font-mono">@{selectedUser.username || "no_username"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Mail className="w-3.5 h-3.5"/> Email</div>
                    <p className="text-sm font-medium truncate">{selectedUser.email || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Phone className="w-3.5 h-3.5"/> Phone</div>
                    <p className="text-sm font-medium truncate">{selectedUser.phone || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><MapPin className="w-3.5 h-3.5"/> Location</div>
                    <p className="text-sm font-medium truncate">
                      {[selectedUser.city, selectedUser.country].filter(Boolean).join(", ") || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1"><Activity className="w-3.5 h-3.5"/> Account Type</div>
                    <p className="text-sm font-medium capitalize">{selectedUser.account_type || "Standard"}</p>
                  </div>
                </div>
              </div>

              <hr className="border-border/50" />

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Danger Zone / Roles</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAdminAction("make_admin", "Are you sure you want to give this user full ADMIN privileges?", "User promoted to Admin!")}
                    disabled={isProcessing !== null}
                    className="flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:bg-purple-500/10 dark:hover:bg-purple-500/20 rounded-xl transition-colors border border-purple-200 dark:border-purple-500/20 disabled:opacity-50"
                  >
                    {isProcessing === "make_admin" ? <div className="w-4 h-4 rounded-full border-2 border-purple-600/30 border-t-purple-600 animate-spin" /> : <ShieldAlert className="w-4 h-4" />} Make Admin
                  </button>

                  <button
                    onClick={() => handleAdminAction("revoke_admin", "Are you sure you want to REVOKE this user's Admin privileges? They will lose dashboard access.", "Admin privileges revoked.")}
                    disabled={isProcessing !== null}
                    className="flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 dark:text-slate-300 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                  >
                    {isProcessing === "revoke_admin" ? <div className="w-4 h-4 rounded-full border-2 border-slate-600/30 border-t-slate-600 animate-spin" /> : <X className="w-4 h-4" />} Revoke Admin
                  </button>

                  <button
                    onClick={() => handleAdminAction("make_mod", "Are you sure you want to make this user a MODERATOR?", "User promoted to Moderator!")}
                    disabled={isProcessing !== null}
                    className="flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 rounded-xl transition-colors border border-blue-200 dark:border-blue-500/20 disabled:opacity-50"
                  >
                    {isProcessing === "make_mod" ? <div className="w-4 h-4 rounded-full border-2 border-blue-600/30 border-t-blue-600 animate-spin" /> : <UserCog className="w-4 h-4" />} Make Moderator
                  </button>

                  <button
                    onClick={() => handleAdminAction("suspend_user", "Suspend this user? They will not be able to use standard features.", "User suspended.")}
                    disabled={isProcessing !== null}
                    className="flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 rounded-xl transition-colors border border-amber-200 dark:border-amber-500/20 disabled:opacity-50"
                  >
                    {isProcessing === "suspend_user" ? <div className="w-4 h-4 rounded-full border-2 border-amber-600/30 border-t-amber-600 animate-spin" /> : <AlertTriangle className="w-4 h-4" />} Suspend User
                  </button>

                  <button
                    onClick={() => handleAdminAction("ban_user", "PERMANENT BAN: Are you sure? This will lock their authentication entirely.", "User permanently banned.")}
                    disabled={isProcessing !== null}
                    className="col-span-1 sm:col-span-2 flex items-center justify-center gap-2 w-full p-3 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition-colors border border-red-200 dark:border-red-500/20 disabled:opacity-50"
                  >
                    {isProcessing === "ban_user" ? <div className="w-4 h-4 rounded-full border-2 border-red-600/30 border-t-red-600 animate-spin" /> : <Ban className="w-4 h-4" />} Ban User
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};