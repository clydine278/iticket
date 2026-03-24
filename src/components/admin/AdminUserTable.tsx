import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Ban, Trash2, ShieldOff, ShieldCheck, Eye, ChevronLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { AdminProfile } from "@/pages/admin/AdminDashboard";

interface Props {
  profiles: AdminProfile[];
  compact?: boolean;
  onRefresh?: () => void;
}

function TypeBadge({ type }: { type: string }) {
  const cls =
    type === "artist"
      ? "bg-primary/10 text-primary"
      : type === "organizer"
      ? "bg-accent/10 text-accent-foreground"
      : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cls}`}>{type}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-green-500/10 text-green-600",
    suspended: "bg-yellow-500/10 text-yellow-600",
    banned: "bg-destructive/10 text-destructive",
  };
  return (
    <Badge variant="outline" className={`text-[10px] capitalize border-0 ${map[status] || map.active}`}>
      {status || "active"}
    </Badge>
  );
}

export function AdminUserTable({ profiles, compact, onRefresh }: Props) {
  const [q, setQ] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);

  const filtered = profiles.filter(
    (p) =>
      (p.full_name?.toLowerCase() || "").includes(q.toLowerCase()) ||
      (p.email?.toLowerCase() || "").includes(q.toLowerCase()) ||
      (p.username?.toLowerCase() || "").includes(q.toLowerCase()),
  );

  const handleAction = async (userId: string, action: "suspend" | "ban" | "activate" | "delete") => {
    if (action === "delete") {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) { toast.error(error.message); return; }
      toast.success("User deleted");
    } else {
      const statusMap = { suspend: "suspended", ban: "banned", activate: "active" };
      const { error } = await supabase.from("profiles").update({ status: statusMap[action] }).eq("id", userId);
      if (error) { toast.error(error.message); return; }
      toast.success(`User ${statusMap[action]}`);
    }
    setSelectedUser(null);
    onRefresh?.();
  };

  // Detail view
  if (selectedUser) {
    const p = selectedUser;
    return (
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="h-8 w-8 p-0">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-sm font-display flex-1">User Details</CardTitle>
            <StatusBadge status={p.status || "active"} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {(p.full_name || p.username || "U").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-base">{p.full_name || "—"}</h3>
              <p className="text-sm text-muted-foreground">@{p.username || "—"}</p>
              <TypeBadge type={p.account_type} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <InfoRow label="Email" value={p.email} />
            <InfoRow label="Phone" value={p.phone} />
            <InfoRow label="City" value={p.city} />
            <InfoRow label="Country" value={p.country} />
            <InfoRow label="Account Type" value={p.account_type} />
            <InfoRow label="Joined" value={new Date(p.created_at).toLocaleDateString()} />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
            {(p.status || "active") !== "suspended" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-yellow-600" onClick={() => handleAction(p.id, "suspend")}>
                <ShieldOff className="w-3.5 h-3.5" /> Suspend
              </Button>
            )}
            {(p.status || "active") !== "banned" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive" onClick={() => handleAction(p.id, "ban")}>
                <Ban className="w-3.5 h-3.5" /> Ban
              </Button>
            )}
            {(p.status || "active") !== "active" && (
              <Button size="sm" variant="outline" className="gap-1.5 text-green-600" onClick={() => handleAction(p.id, "activate")}>
                <ShieldCheck className="w-3.5 h-3.5" /> Activate
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="gap-1.5">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove {p.full_name || p.email}'s profile. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleAction(p.id, "delete")} className="bg-destructive text-destructive-foreground">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <CardTitle className="text-sm font-display flex-1">{compact ? "Recent Users" : "All Users"}</CardTitle>
        {!compact && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-9 h-9 text-sm rounded-xl" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-border/40">
          {filtered.map((p) => (
            <button key={p.id} onClick={() => setSelectedUser(p)} className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-muted/30 transition-colors">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-muted text-xs font-semibold">
                  {(p.full_name || p.username || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.full_name || p.username || "—"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{p.email || "—"}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <TypeBadge type={p.account_type} />
                <StatusBadge status={p.status || "active"} />
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">User</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Email</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">City</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Joined</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs font-semibold">
                          {(p.full_name || p.username || "U").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium text-sm block">{p.full_name || p.username || "—"}</span>
                        <span className="text-[11px] text-muted-foreground">@{p.username || "—"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{p.email || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{p.phone || "—"}</td>
                  <td className="p-3"><TypeBadge type={p.account_type} /></td>
                  <td className="p-3 text-sm text-muted-foreground">{p.city || "—"}</td>
                  <td className="p-3"><StatusBadge status={p.status || "active"} /></td>
                  <td className="p-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="p-3">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSelectedUser(p)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-muted/30 rounded-lg px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value || "—"}</p>
    </div>
  );
}
