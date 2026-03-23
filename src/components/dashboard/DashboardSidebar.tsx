import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation, Link, useNavigate } from "react-router-dom";
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
  Users, BarChart3, Trophy, Heart, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";

const personalLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Tickets", url: "/dashboard/tickets", icon: Ticket },
  { title: "Order History", url: "/dashboard/orders", icon: ShoppingCart },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "Challenges", url: "/dashboard/challenges", icon: Trophy },
  { title: "Favorites", url: "/dashboard/favorites", icon: Heart },
];

const artistLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Bookings", url: "/dashboard/bookings", icon: CalendarPlus },
  { title: "Earnings", url: "/dashboard/earnings", icon: Wallet },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "My Challenges", url: "/dashboard/challenges", icon: Trophy },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

const organizerLinks = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "My Events", url: "/dashboard/events", icon: CalendarPlus },
  { title: "Ticket Sales", url: "/dashboard/sales", icon: Ticket },
  { title: "Bookings", url: "/dashboard/bookings", icon: Music },
  { title: "Transactions", url: "/dashboard/transactions", icon: Receipt },
  { title: "Revenue", url: "/dashboard/revenue", icon: Wallet },
];

const settingsLinks = [
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

  const accountType = user?.user_metadata?.account_type || "personal";
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.username || user?.email?.split("@")[0] || "User";

  const mainLinks = accountType === "artist" ? artistLinks : accountType === "organizer" ? organizerLinks : personalLinks;

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Check if user has admin role (stored in user_metadata for quick check, verified server-side)
  const isAdmin = user?.user_metadata?.is_admin === true;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-3 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 px-1">
          <span className="text-primary text-lg font-bold">●</span>
          {!collapsed && <span className="font-display font-bold text-sm">iticket</span>}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{accountType} Account</p>
              </div>
            </div>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/admin")}>
                    <Link to="/admin">
                      <Shield className="w-4 h-4" />
                      {!collapsed && <span>Admin Panel</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-start gap-2 text-xs"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {!collapsed && (theme === "light" ? "Dark Mode" : "Light Mode")}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
