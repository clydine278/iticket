import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Ticket, Music, Trophy, User, CalendarDays, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const quickLinks = [
  { title: "Buy Tickets", desc: "Browse upcoming events", icon: Ticket, to: "/buy-tickets", color: "from-primary to-primary/70" },
  { title: "Book an Artist", desc: "Find entertainers", icon: Music, to: "/book-artist", color: "from-accent to-accent/70" },
  { title: "Challenges", desc: "Join & compete", icon: Trophy, to: "/challenges", color: "from-secondary to-secondary/70" },
];

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
  const accountType = user.user_metadata?.account_type || "personal";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-8 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">
              Welcome, {displayName} 👋
            </h1>
            <p className="text-muted-foreground text-sm">
              {accountType === "artist" ? "Manage your performances & bookings" :
               accountType === "organizer" ? "Manage your events & artists" :
               "Discover events, artists & challenges"}
            </p>
          </div>

          {/* Profile Card */}
          <Card className="mb-8 border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase tracking-wider font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {accountType}
                </span>
              </div>
              <CalendarDays className="w-5 h-5 text-muted-foreground shrink-0" />
            </CardContent>
          </Card>

          {/* Quick Links */}
          <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {quickLinks.map((link, i) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <Link to={link.to}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 cursor-pointer overflow-hidden">
                    <CardContent className="p-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3`}>
                        <link.icon className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-sm mb-0.5">{link.title}</h3>
                      <p className="text-xs text-muted-foreground">{link.desc}</p>
                      <ArrowRight className="w-4 h-4 text-muted-foreground mt-2 group-hover:translate-x-1 transition-transform" />
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
