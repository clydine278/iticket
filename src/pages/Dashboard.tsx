import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { User, ShieldAlert, Ban } from "lucide-react";
import PersonalDashboard from "@/components/dashboard/PersonalDashboard";
import ArtistDashboard from "@/components/dashboard/ArtistDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import DashboardLayout from "@/layouts/DashboardLayout";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const Dashboard = () => {
  const { user, accountStatus } = useAuth();

  if (!user) return null;

  if (accountStatus === "banned") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Ban className="w-12 h-12 text-destructive mb-4" />
          <h2 className="text-xl font-bold mb-2">Account Banned</h2>
          <p className="text-muted-foreground text-sm max-w-md">Your account has been permanently banned. Contact support if you believe this is a mistake.</p>
        </div>
      </DashboardLayout>
    );
  }

  if (accountStatus === "suspended") {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ShieldAlert className="w-12 h-12 text-accent-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Account Suspended</h2>
          <p className="text-muted-foreground text-sm max-w-md">Your account has been temporarily suspended. Please contact support for more information.</p>
        </div>
      </DashboardLayout>
    );
  }

  const displayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split("@")[0] || "User";
  const accountType: string = user.user_metadata?.account_type || "personal";
  const roleLabel = accountType === "artist" ? "Artist Account" : accountType === "organizer" ? "Organizer Account" : "Personal Account";

  return (
    <DashboardLayout>
      <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          className="mb-6 flex items-start justify-between"
          variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-lg sm:text-xl font-bold leading-tight">
                Hello, {displayName}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">{roleLabel}</p>
            </div>
          </div>
        </motion.div>

        {accountType === "artist" && <ArtistDashboard />}
        {accountType === "organizer" && <OrganizerDashboard />}
        {accountType !== "artist" && accountType !== "organizer" && <PersonalDashboard />}
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
