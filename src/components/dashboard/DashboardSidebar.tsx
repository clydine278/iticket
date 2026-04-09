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
  LayoutDashboard,
  Ticket,
  ShoppingCart,
  Receipt,
  User,
  LogOut,
  Sun,
  Moon,
  Music,
  CalendarPlus,
  BarChart3,
  Trophy,
  Shield,
  ChevronRight,
  Sparkles,
  Zap,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const personalLinks: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Browse Events", url: "/dashboard/browse-events", icon: Ticket },
  { title: "Browse Challenges", url: "/dashboard/browse-challenges", icon: Trophy },
  { title: "My Tickets", url: "/dashboard/tickets", icon: Ticket },
  { title: "My Challenges", url: "/dashboard/challenges", icon: Trophy },
  { title: "Order History", url: "/dashboard/orders", icon: ShoppingCart },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
];

const artistLinks: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Browse Events", url: "/dashboard/browse-events", icon: Ticket },
  { title: "Booking Requests", url: "/dashboard/bookings", icon: CalendarPlus },
  { title: "Create Challenge", url: "/dashboard/create-challenge", icon: Trophy },
  { title: "Challenge Submissions", url: "/dashboard/challenges", icon: Trophy },
  { title: "My Tickets", url: "/dashboard/tickets", icon: Ticket },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

const organizerLinks: NavItem[] = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Create Event", url: "/dashboard/create-event", icon: CalendarPlus },
  { title: "My Events", url: "/dashboard/events", icon: CalendarPlus },
  { title: "Hire Artist", url: "/dashboard/hire-artist", icon: Music },
  { title: "Create Challenge", url: "/dashboard/create-challenge", icon: Trophy },
  { title: "Bookings", url: "/dashboard/bookings", icon: Music },
  { title: "Order History", url: "/dashboard/orders", icon: ShoppingCart },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
];

const settingsLinks: NavItem[] = [
  { title: "Profile", url: "/dashboard/profile", icon: User },
];

export function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMod, setIsMod] = useState(false);

  const accountType = user?.user_metadata?.account_type || "personal";
  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.username ||
    user?.email?.split("@")[0] ||
    "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const mainLinks =
    accountType === "artist"
      ? artistLinks
      : accountType === "organizer"
      ? organizerLinks
      : personalLinks;

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsMod(false);
      return;
    }

    Promise.all([
      supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }),
      supabase.rpc("has_role", { _user_id: user.id, _role: "moderator" }),
    ]).then(([adminRes, modRes]) => {
      setIsAdmin(Boolean(adminRes.data));
      setIsMod(Boolean(modRes.data));
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const roleIcon =
    accountType === "artist" ? Sparkles : accountType === "organizer" ? Zap : User;
  const RoleIcon = roleIcon;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar" style={{ "--sidebar-width": "280px" } as React.CSSProperties}>
      <SidebarHeader className="p-5 border-b border-sidebar-border/60">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <span className="text-primary-foreground font-black text-xs">iT</span>
          </div>
          {!collapsed && (
            <span className="font-display font-bold text-base tracking-tight">iticket</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 gap-4">
        {!collapsed ? (
          <div className="mx-1 p-4 rounded-2xl bg-card border border-border/60">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 ring-2 ring-border">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <RoleIcon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground capitalize font-medium">
                    {accountType} account
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-1 mt-1">
            <Avatar className="h-9 w-9 ring-2 ring-border">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-[10px] font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground px-3 mb-2">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {mainLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isActive(item.url)}
                    className="rounded-xl px-3"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">{item.title}</span>
                          {isActive(item.url) && (
                            <ChevronRight className="w-3.5 h-3.5 text-primary" />
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

        {(isAdmin || isMod) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground px-3 mb-2">
              Staff
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1.5">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isActive("/verify-ticket")}
                    className="rounded-xl px-3"
                  >
                    <Link to="/verify-ticket" className="flex items-center gap-3">
                      <ScanLine className="w-4 h-4" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-sm font-medium">Verify Tickets</span>
                          <span className="text-[10px] bg-accent/15 text-accent-foreground px-2 py-0.5 rounded-full font-semibold">
                            Staff
                          </span>
                        </>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isActive("/admin")}
                      className="rounded-xl px-3"
                    >
                      <Link to="/admin" className="flex items-center gap-3">
                        <Shield className="w-4 h-4" />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-sm font-semibold">Admin Panel</span>
                            <span className="text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-semibold">
                              Admin
                            </span>
                          </>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-[0.12em] font-semibold text-muted-foreground px-3 mb-2">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {settingsLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={isActive(item.url)}
                    className="rounded-xl px-3"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="text-sm font-medium">{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border/60 space-y-2">
        <SidebarMenuButton
          onClick={toggleTheme}
          size="lg"
          className="w-full rounded-xl px-3 cursor-pointer"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 shrink-0" />
          ) : (
            <Sun className="w-4 h-4 shrink-0" />
          )}
          {!collapsed && (
            <span className="text-sm font-medium">
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </span>
          )}
        </SidebarMenuButton>

        <SidebarMenuButton
          onClick={handleSignOut}
          size="lg"
          className="w-full rounded-xl px-3 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
