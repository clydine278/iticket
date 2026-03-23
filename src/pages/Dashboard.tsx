import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import PersonalDashboard from "@/components/dashboard/PersonalDashboard";
import ArtistDashboard from "@/components/dashboard/ArtistDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";
import DashboardLayout from "@/layouts/DashboardLayout";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

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
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
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
