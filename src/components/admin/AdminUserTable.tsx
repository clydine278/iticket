import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AdminProfile } from "@/pages/admin/AdminDashboard";

interface Props {
  profiles: AdminProfile[];
  compact?: boolean;
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

export function AdminUserTable({ profiles, compact }: Props) {
  const [q, setQ] = useState("");

  const filtered = profiles.filter(
    (p) =>
      (p.full_name?.toLowerCase() || "").includes(q.toLowerCase()) ||
      (p.email?.toLowerCase() || "").includes(q.toLowerCase()) ||
      (p.username?.toLowerCase() || "").includes(q.toLowerCase()),
  );

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3 flex flex-col sm:flex-row sm:items-center gap-3">
        <CardTitle className="text-sm font-display flex-1">{compact ? "Recent Users" : "All Users"}</CardTitle>
        {!compact && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-9 text-sm rounded-xl"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* Mobile cards */}
        <div className="sm:hidden divide-y divide-border/40">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarFallback className="bg-muted text-xs font-semibold">
                  {(p.full_name || p.username || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{p.full_name || p.username || "—"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{p.email || "—"}</p>
              </div>
              <TypeBadge type={p.account_type} />
            </div>
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
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">City</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Joined</th>
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
                      <span className="font-medium text-sm">{p.full_name || p.username || "—"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{p.email || "—"}</td>
                  <td className="p-3"><TypeBadge type={p.account_type} /></td>
                  <td className="p-3 text-sm text-muted-foreground">{p.city || "—"}</td>
                  <td className="p-3 text-sm text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
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
