import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Ticket, Music, Trophy, ArrowRight, Calendar, MapPin, Clock, Star } from "lucide-react";
import { Link } from "react-router-dom";

const upcomingEvents = [
  { id: 1, title: "City Boy Carnival", date: "15th June 2025", venue: "Eko Atlantic, Lagos", time: "6:00 PM", image: "🎪" },
  { id: 2, title: "Afro Nation Festival", date: "22nd July 2025", venue: "Tarkwa Bay, Lagos", time: "4:00 PM", image: "🎵" },
  { id: 3, title: "Comedy Night Live", date: "3rd Aug 2025", venue: "The Palms, Lekki", time: "8:00 PM", image: "🎭" },
];

const trendingArtists = [
  { name: "DJ Neptune", genre: "Afrobeats", rating: 4.8, emoji: "🎧" },
  { name: "Kizz Daniel", genre: "Afro-pop", rating: 4.9, emoji: "🎤" },
  { name: "Mayorkun", genre: "Afrobeats", rating: 4.7, emoji: "🎶" },
];

const quickActions = [
  { title: "Buy Tickets", desc: "Explore upcoming events", icon: Ticket, to: "/buy-tickets", gradient: "from-primary to-orange-600" },
  { title: "Book Artist", desc: "Hire for your event", icon: Music, to: "/book-artist", gradient: "from-violet-500 to-purple-600" },
  { title: "Challenges", desc: "Compete & win prizes", icon: Trophy, to: "/challenges", gradient: "from-emerald-500 to-teal-600" },
];

const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PersonalDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action, i) => (
          <motion.div key={action.title} variants={item}>
            <Link to={action.to}>
              <Card className="group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/40 cursor-pointer overflow-hidden h-full">
                <CardContent className="p-3 sm:p-4 text-center">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2 sm:mb-3 shadow-lg`}>
                    <action.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm">{action.title}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block mt-0.5">{action.desc}</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* My Tickets Section */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">My Tickets</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">0 active</span>
        </div>
        <Card className="border-dashed border-2 border-border/60 bg-muted/30">
          <CardContent className="p-6 sm:p-8 text-center">
            <Ticket className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-medium mb-1">No tickets yet</p>
            <p className="text-xs text-muted-foreground/70 mb-4">Your purchased tickets will appear here</p>
            <Link to="/buy-tickets">
              <Button size="sm" className="rounded-full text-xs px-6">
                Browse Events <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Events */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Trending Events</h2>
          <Link to="/buy-tickets" className="text-xs text-primary font-medium hover:underline">See all</Link>
        </div>
        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <Card key={event.id} className="border-border/40 hover:shadow-md transition-all duration-200 group cursor-pointer">
              <CardContent className="p-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center text-2xl shrink-0">
                  {event.image}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{event.title}</p>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-0.5"><Calendar className="w-3 h-3" /> {event.date}</span>
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" /> {event.venue}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Trending Artists */}
      <motion.div variants={item}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base sm:text-lg font-semibold">Popular Artists</h2>
          <Link to="/book-artist" className="text-xs text-primary font-medium hover:underline">See all</Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {trendingArtists.map((artist) => (
            <Card key={artist.name} className="border-border/40 hover:shadow-md transition-all">
              <CardContent className="p-3 text-center">
                <div className="text-3xl mb-2">{artist.emoji}</div>
                <p className="font-semibold text-xs truncate">{artist.name}</p>
                <p className="text-[10px] text-muted-foreground">{artist.genre}</p>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-[10px] font-medium">{artist.rating}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalDashboard;
