import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { User, Settings } from "lucide-react";
import PersonalDashboard from "@/components/dashboard/PersonalDashboard";
import ArtistDashboard from "@/components/dashboard/ArtistDashboard";
import OrganizerDashboard from "@/components/dashboard/OrganizerDashboard";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split("@")[0] || "User";
  const accountType: string = user.user_metadata?.account_type || "personal";

  const roleLabel = accountType === "artist" ? "Artist Account" : accountType === "organizer" ? "Organizer Account" : "Personal Account";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
        >
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
            <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/10 transition-colors mt-1">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </button>
          </motion.div>

          {/* Role-specific content */}
          {accountType === "artist" && <ArtistDashboard />}
          {accountType === "organizer" && <OrganizerDashboard />}
          {accountType !== "artist" && accountType !== "organizer" && <PersonalDashboard />}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
