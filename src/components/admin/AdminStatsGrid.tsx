import { Card, CardContent } from "@/components/ui/card";
import {
  Users, CalendarPlus, Ticket, DollarSign, Activity, UserCheck,
} from "lucide-react";
import type { AdminProfile } from "@/pages/admin/AdminDashboard";

interface Props {
  profiles: AdminProfile[];
  events: any[];
  orders: any[];
  totalRevenue: number;
}

export function AdminStatsGrid({ profiles, events, orders, totalRevenue }: Props) {
  const artistCount = profiles.filter((p) => p.account_type === "artist").length;
  const organizerCount = profiles.filter((p) => p.account_type === "organizer").length;

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, color: "text-primary" },
    { label: "Total Events", value: events.length, icon: CalendarPlus, color: "text-accent" },
    { label: "Total Orders", value: orders.length, icon: Ticket, color: "text-primary" },
    { label: "Revenue", value: `₦${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-accent" },
    { label: "Artists", value: artistCount, icon: Activity, color: "text-primary" },
    { label: "Organizers", value: organizerCount, icon: UserCheck, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="group hover:shadow-md transition-shadow border-border/50">
          <CardContent className="p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color} opacity-70`} />
            </div>
            <p className="font-display text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
