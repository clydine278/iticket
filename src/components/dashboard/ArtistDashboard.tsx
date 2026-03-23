import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { DollarSign, Eye, CheckCircle, XCircle, TrendingUp, Calendar, MoreVertical, Wallet, Music, Star } from "lucide-react";

const mockBookings = [
  { id: 1, event: "City Boy Carnival", date: "15th June 2025", organizer: "EventPro NG", status: "pending" },
  { id: 2, event: "Summer Beach Party", date: "22nd July 2025", organizer: "Beach Vibes", status: "pending" },
  { id: 3, event: "Afro Nation After Party", date: "3rd Aug 2025", organizer: "Afro Events", status: "accepted" },
];

const stats = [
  { label: "Total Balance", value: "₦0.00", icon: Wallet, gradient: "from-primary to-orange-600" },
  { label: "Total Earnings", value: "₦0.00", icon: DollarSign, gradient: "from-emerald-500 to-teal-600" },
  { label: "Profile Views", value: "0", icon: Eye, gradient: "from-violet-500 to-purple-600" },
  { label: "Avg Rating", value: "—", icon: Star, gradient: "from-amber-500 to-yellow-600" },
];

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ArtistDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={item}>
            <Card className="border-border/40 overflow-hidden">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">{stat.label}</span>
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                    <stat.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
                <p className="font-display text-lg sm:text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Earnings Chart Placeholder */}
      <motion.div variants={item}>
        <Card className="border-border/40">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-base font-semibold">Earnings Overview</h2>
              <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full">This Month</span>
            </div>
            <div className="h-32 flex items-end justify-between gap-1.5 px-2">
              {[20, 45, 30, 65, 40, 80, 55].map((h, i) => (
                <motion.div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-primary to-primary/40 rounded-t-md"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: 0.1 * i, duration: 0.5, ease: "easeOut" }}
                />
              ))}
            </div>
            <div className="flex justify-between px-2 mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="text-[9px] text-muted-foreground flex-1 text-center">{d}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Booking Requests */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Booking Requests</h2>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
            {mockBookings.filter(b => b.status === "pending").length} pending
          </span>
        </div>
        <div className="space-y-3">
          {mockBookings.map((booking) => (
            <Card key={booking.id} className="border-border/40 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center shrink-0">
                    <Music className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{booking.event}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{booking.date}</span>
                      <span className="text-border">•</span>
                      <span>{booking.organizer}</span>
                    </div>
                  </div>
                </div>
                {booking.status === "pending" ? (
                  <div className="flex border-t border-border/40">
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
                      <CheckCircle className="w-3.5 h-3.5" /> Accept
                    </button>
                    <div className="w-px bg-border/40" />
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors">
                      <XCircle className="w-3.5 h-3.5" /> Decline
                    </button>
                    <div className="w-px bg-border/40" />
                    <button className="px-3 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-border/40 px-3 py-2 bg-emerald-50/50">
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Accepted
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Performance Tips */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Boost Your Profile</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Complete your profile, add performance videos, and update your services to get more booking requests.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ArtistDashboard;
