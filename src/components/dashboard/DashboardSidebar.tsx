import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Ticket, ShoppingCart, Receipt, Wallet,
  User, Settings, LogOut, Sun, Moon, Music, CalendarPlus,
  Users, BarChart3, Trophy, Heart, Shield, ChevronRight,
  Sparkles, Zap
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  badge?: string;
}

const personalLinks: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Tickets", url: "/dashboard/tickets", icon: Ticket },
  { title: "Order History", url: "/dashboard/orders", icon: ShoppingCart },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "Challenges", url: "/dashboard/challenges", icon: Trophy },
  { title: "Favorites", url: "/dashboard/favorites", icon: Heart },
];

const artistLinks: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Bookings", url: "/dashboard/bookings", icon: CalendarPlus },
  { title: "Earnings", url: "/dashboard/earnings", icon: Wallet },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "My Challenges", url: "/dashboard/challenges", icon: Trophy },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

const organizerLinks: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Events", url: "/dashboard/events", icon: CalendarPlus },
  { title: "Ticket Sales", url: "/dashboard/sales", icon: Ticket },
  { title: "Bookings", url: "/dashboard/bookings", icon: Music },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "Revenue", url: "/dashboard/revenue", icon: Wallet },
];

const settingsLinks: NavItem[] = [
  { title: "Profile", url: "/dashboard/profile", icon: User },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const accountType = user?.user_metadata?.account_type || "personal";
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const mainLinks = accountType === "artist" ? artistLinks : accountType === "organizer" ? organizerLinks : personalLinks;

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (user) {
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" as const }).then(({ data }) => {
        if (data) setIsAdmin(true);
      });
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const roleGradient = accountType === "artist"
    ? "from-violet-500 to-fuchsia-500"
    : accountType === "organizer"
    ? "from-emerald-500 to-teal-500"
    : "from-primary to-orange-500";

  const roleIcon = accountType === "artist" ? Sparkles : accountType === "organizer" ? Zap : User;
  const RoleIcon = roleIcon;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      {/* Header / Logo */}
      <SidebarHeader className="p-4 border-b border-sidebar-border/50">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${roleGradient} flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}>
            <span className="text-white font-black text-xs">iT</span>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-base tracking-tight">iticket</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-2">
        {/* User Card */}
        {!collapsed && (
          <div className="mx-2 mb-3 p-3 rounded-xl bg-gradient-to-br from-muted/80 to-muted/30 border border-border/30">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarFallback className={`bg-gradient-to-br ${roleGradient} text-white text-xs font-bold`}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <RoleIcon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground capitalize font-medium">{accountType}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="flex justify-center mb-2 mt-1">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarFallback className={`bg-gradient-to-br ${roleGradient} text-white text-[10px] font-bold`}>
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/70 px-3">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="group/btn relative rounded-lg transition-all duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm">{item.title}</span>
                          {isActive(item.url) && (
                            <ChevronRight className="w-3.5 h-3.5 text-primary opacity-70" />
                          )}
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/70 px-3">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin")}
                    className="rounded-lg"
                  >
                    <Link to="/admin" className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                        <Shield className="w-2.5 h-2.5 text-white" />
                      </div>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">Admin Panel</span>
                          <span className="text-[9px] bg-red-500/10 text-red-500 dark:text-red-400 px-1.5 py-0.5 rounded-full font-semibold">
                            Admin
                          </span>
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground/70 px-3">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="rounded-lg"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-sidebar-border/50 space-y-1">
        <SidebarMenuButton
          onClick={toggleTheme}
          className="w-full rounded-lg cursor-pointer"
        >
          <div className="flex items-center gap-3 w-full">
            {theme === "light" ? (
              <Moon className="w-4 h-4 shrink-0" />
            ) : (
              <Sun className="w-4 h-4 shrink-0" />
            )}
            {!collapsed && (
              <span className="text-sm">{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            )}
          </div>
        </SidebarMenuButton>
        <SidebarMenuButton
          onClick={handleSignOut}
          className="w-full rounded-lg cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <div className="flex items-center gap-3 w-full">
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="text-sm">Sign Out</span>}
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
