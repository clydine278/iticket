import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Ban, Trash2, ShieldOff, ShieldCheck, ShieldPlus, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
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
    type === "artist" ? "bg-primary/10 text-primary"
    : type === "organizer" ? "bg-accent/10 text-accent-foreground"
    : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${cls}`}>{type}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-700",
    suspended: "bg-amber-100 text-amber-700",
    banned: "bg-destructive/10 text-destructive",
  };
  return <Badge variant="outline" className={`text-[10px] capitalize border-0 ${map[status] || map.active}`}>{status || "active"}</Badge>;
}

export function AdminUserTable({ profiles, compact, onRefresh }: Props) {
  const [q, setQ] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminProfile | null>(null);
  const [modIds, setModIds] = useState<Set<string>>(new Set());

  // Fetch which users are moderators
  useEffect(() => {
    const fetchMods = async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "moderator");
      if (data) setModIds(new Set(data.map((r: any) => r.user_id)));
    };
    fetchMods();
  }, [profiles]);

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

  return (
    <>
      {/* User Detail Popup */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          {selectedUser && (() => {
            const p = selectedUser;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-base">User Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                        {(p.full_name || p.username || "U").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-base">{p.full_name || "—"}</h3>
                      <p className="text-sm text-muted-foreground">@{p.username || "—"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <TypeBadge type={p.account_type} />
                        <StatusBadge status={p.status || "active"} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <InfoRow label="Email" value={p.email} />
                    <InfoRow label="Phone" value={p.phone} />
                    <InfoRow label="City" value={p.city} />
                    <InfoRow label="Country" value={p.country} />
                    <InfoRow label="Account Type" value={p.account_type} />
                    <InfoRow label="Joined" value={new Date(p.created_at).toLocaleDateString()} />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
                    {/* Moderator toggle */}
                    {modIds.has(p.id) ? (
                      <Button size="sm" variant="outline" className="gap-1.5 text-primary border-primary/20 hover:bg-primary/5" onClick={async () => {
                        const { error } = await supabase.from("user_roles").delete().eq("user_id", p.id).eq("role", "moderator");
                        if (error) { toast.error(error.message); return; }
                        setModIds((prev) => { const next = new Set(prev); next.delete(p.id); return next; });
                        toast.success("Moderator role removed");
                      }}>
                        <ShieldOff className="w-3.5 h-3.5" /> Remove Mod
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="gap-1.5 text-primary border-primary/20 hover:bg-primary/5" onClick={async () => {
                        const { error } = await supabase.from("user_roles").insert({ user_id: p.id, role: "moderator" });
                        if (error) { toast.error(error.message); return; }
                        setModIds((prev) => new Set(prev).add(p.id));
                        toast.success("User is now a moderator");
                      }}>
                        <ShieldPlus className="w-3.5 h-3.5" /> Make Mod
                      </Button>
                    )}
                    {(p.status || "active") !== "suspended" && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => handleAction(p.id, "suspend")}>
                        <ShieldOff className="w-3.5 h-3.5" /> Suspend
                      </Button>
                    )}
                    {(p.status || "active") !== "banned" && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-destructive border-destructive/20 hover:bg-destructive/5" onClick={() => handleAction(p.id, "ban")}>
                        <Ban className="w-3.5 h-3.5" /> Ban
                      </Button>
                    )}
                    {(p.status || "active") !== "active" && (
                      <Button size="sm" variant="outline" className="gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleAction(p.id, "activate")}>
                        <ShieldCheck className="w-3.5 h-3.5" /> Activate
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" className="gap-1.5 ml-auto">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete user permanently?</AlertDialogTitle>
                          <AlertDialogDescription>This will permanently remove {p.full_name || p.email}'s profile.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAction(p.id, "delete")} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* User Table */}
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
          <div className="divide-y divide-border/40">
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
                <div className="hidden sm:block text-xs text-muted-foreground">{p.phone || "—"}</div>
                <div className="hidden md:block text-xs text-muted-foreground">{p.city ? `${p.city}, ${p.country || ""}` : "—"}</div>
                <div className="flex items-center gap-1.5">
                  {modIds.has(p.id) && <span className="text-[9px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-semibold">Mod</span>}
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
        </CardContent>
      </Card>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="bg-muted/30 rounded-lg px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-medium truncate">{value || "—"}</p>
    </div>
  );
}
