import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CalendarPlus, Users, Ticket, DollarSign, ArrowRight, MapPin, Clock, BarChart3, PlusCircle, Music } from "lucide-react";
import { Link } from "react-router-dom";

const stats = [
  { label: "Total Events", value: "0", icon: CalendarPlus, gradient: "from-primary to-orange-600" },
  { label: "Tickets Sold", value: "0", icon: Ticket, gradient: "from-violet-500 to-purple-600" },
  { label: "Revenue", value: "₦0.00", icon: DollarSign, gradient: "from-emerald-500 to-teal-600" },
  { label: "Artists Booked", value: "0", icon: Users, gradient: "from-sky-500 to-blue-600" },
];

const mockEvents = [
  { id: 1, title: "City Boy Carnival", date: "15th June 2025", venue: "Eko Atlantic", sold: 0, total: 500, status: "upcoming" },
  { id: 2, title: "Summer Beach Jam", date: "22nd July 2025", venue: "Tarkwa Bay", sold: 0, total: 300, status: "draft" },
];

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const OrganizerDashboard = () => {
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

      {/* Create Event CTA */}
      <motion.div variants={item}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/20 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shrink-0">
              <PlusCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm">Create New Event</p>
              <p className="text-xs text-muted-foreground">Set up your event and start selling tickets</p>
            </div>
            <Button size="sm" className="rounded-full text-xs px-4 shrink-0">
              Create
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* My Events */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">My Events</h2>
          <span className="text-[10px] bg-muted text-muted-foreground px-2 py-1 rounded-full">{mockEvents.length} events</span>
        </div>
        <div className="space-y-3">
          {mockEvents.map((event) => (
            <Card key={event.id} className="border-border/40 hover:shadow-md transition-all">
              <CardContent className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{event.title}</p>
                      <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                        event.status === "upcoming" 
                          ? "bg-emerald-100 text-emerald-700" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1">
                      <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" /> {event.date}</span>
                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {event.venue}</span>
                    </div>
                  </div>
                </div>
                {/* Ticket Progress */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="text-muted-foreground">Tickets sold</span>
                    <span className="font-medium">{event.sold}/{event.total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(event.sold / event.total) * 100}%` }}
                      transition={{ delay: 0.3, duration: 0.6 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Book Artists */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Book Artists</h2>
          <Link to="/book-artist" className="text-xs text-primary font-medium hover:underline">Browse</Link>
        </div>
        <Card className="border-dashed border-2 border-border/60 bg-muted/20">
          <CardContent className="p-6 text-center">
            <Music className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium mb-1">Find artists for your events</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Browse and book talented performers</p>
            <Link to="/book-artist">
              <Button size="sm" variant="outline" className="rounded-full text-xs px-6">
                Browse Artists <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics Tip */}
      <motion.div variants={item}>
        <Card className="border-border/40 bg-gradient-to-br from-violet-500/5 to-purple-500/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0">
                <BarChart3 className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1">Analytics Coming Soon</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Track ticket sales, revenue trends, and audience insights for all your events.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default OrganizerDashboard;
