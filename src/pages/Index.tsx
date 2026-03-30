import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ticket, Users, Calendar, Award, Sparkles, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const features = [
  { icon: Ticket, title: "Buy Ticket Easily", desc: "Browse upcoming events, pick your seats, and buy tickets instantly.", cta: "Explore Events", link: "/buy-tickets" },
  { icon: Search, title: "Discover & Book Talent", desc: "Organizers can find artists, compare prices, and book them instantly. Artists get discovered and promoted.", cta: "Explore Artists", link: "/book-artist" },
  { icon: Sparkles, title: "Join a Challenge", desc: "Show off your skill, compete with others, and win prizes or event tickets.", cta: "Join Challenge", link: "/challenges" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const Index = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [stats, setStats] = useState({ events: 0, artists: 0, tickets: 0, challenges: 0 });

  useEffect(() => {
    const fetchAll = async () => {
      const [evRes, arRes, chRes, ordRes] = await Promise.all([
        supabase.from("events").select("*, ticket_types(price)").eq("status", "published").order("date", { ascending: true }).limit(3),
        supabase.from("profiles").select("*").eq("account_type", "artist").limit(3),
        supabase.from("challenges").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(3),
        supabase.from("orders").select("quantity"),
      ]);
      setEvents(evRes.data || []);
      setArtists(arRes.data || []);
      setChallenges(chRes.data || []);

      const totalTickets = (ordRes.data || []).reduce((s: number, o: any) => s + (o.quantity || 0), 0);
      setStats({
        events: (evRes.data || []).length,
        artists: (arRes.data || []).length,
        tickets: totalTickets,
        challenges: (chRes.data || []).length,
      });
    };
    fetchAll();
  }, []);

  const statItems = [
    { icon: Calendar, value: String(stats.events), label: "Active Events" },
    { icon: Users, value: String(stats.artists), label: "Top Artists" },
    { icon: Ticket, value: stats.tickets > 1000 ? `${(stats.tickets / 1000).toFixed(1)}k` : String(stats.tickets), label: "Tickets Sold" },
    { icon: Award, value: String(stats.challenges), label: "Challenges" },
  ];

  const cheapestPrice = (event: any) => {
    const prices = event.ticket_types?.map((t: any) => t.price).filter((p: number) => p > 0) || [];
    return prices.length > 0 ? Math.min(...prices) : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero text-hero-foreground py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-hero/80 to-hero opacity-90" />
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative z-10 container">
          <p className="text-primary text-sm font-semibold mb-2">All in One Place.</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">Ticket . Artist. Challenges</h1>
          <p className="text-hero-foreground/60 text-sm mb-6 max-w-md mx-auto">Discover events, book artists, and join music challenges.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/buy-tickets"><Button variant="outline" size="sm" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">Buy Ticket</Button></Link>
            <Link to="/book-artist"><Button variant="outline" size="sm" className="rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">Book Artist</Button></Link>
            <Link to="/challenges"><Button size="sm" className="rounded-full text-xs">Join Challenge</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="container -mt-8 relative z-10">
        <div className="border border-primary rounded-xl bg-background p-4 grid grid-cols-4 gap-2">
          {statItems.map((stat) => (
            <motion.div key={stat.label} variants={fadeUp} className="text-center">
              <stat.icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="font-display font-bold text-xl text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="container py-12">
        <h2 className="font-display text-lg font-bold text-center mb-6">Discover and book Artists</h2>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="border border-border rounded-xl p-5 text-center hover:shadow-md transition-shadow">
              <f.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-display font-bold text-sm mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-[10px] leading-relaxed mb-3">{f.desc}</p>
              <Link to={f.link}><Button size="sm" className="rounded-full text-[10px] h-7 px-4">{f.cta}</Button></Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Events from DB */}
      <section className="container pb-12">
        {events.length > 0 && (
          <>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {events.map((event) => (
                <motion.div key={event.id} variants={fadeUp}>
                  <Link to={`/dashboard/event/${event.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    {event.banner_url ? (
                      <img src={event.banner_url} alt={event.title} className="h-40 w-full object-cover" />
                    ) : (
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-muted" />
                    )}
                    <div className="p-4">
                      <h3 className="font-display font-bold text-sm">{event.title}</h3>
                      <p className="text-muted-foreground text-[10px] leading-relaxed my-1 line-clamp-2">{event.description || "An exciting upcoming event."}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          <p className="font-bold text-sm">{cheapestPrice(event) > 0 ? `₦${cheapestPrice(event).toLocaleString()}` : "Free"}</p>
                          <p className="text-[10px] text-muted-foreground">{format(new Date(event.date), "MMM d, yyyy")}</p>
                        </div>
                        <Button size="sm" className="rounded-full text-[10px] h-7 px-3">Get Ticket</Button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-right mt-3">
              <Link to="/buy-tickets" className="text-primary text-xs font-medium">See more...</Link>
            </div>
          </>
        )}
      </section>

      {/* Hire Artists from DB */}
      {artists.length > 0 && (
        <section className="bg-hero text-hero-foreground py-10">
          <div className="container">
            <h2 className="font-display text-lg font-bold text-center mb-6">Hire our talented Artists</h2>
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {artists.map((artist) => (
                <motion.div key={artist.id} variants={fadeUp}>
                  <Link to="/book-artist" className="block rounded-xl overflow-hidden">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.stage_name || artist.full_name} className="h-48 w-full object-cover" />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/30 to-muted/20 flex items-center justify-center">
                        <span className="font-bold text-4xl text-primary/60">
                          {(artist.stage_name || artist.full_name || "AR").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="p-3 bg-hero">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-sm">{artist.stage_name || artist.full_name || "Artist"}</h3>
                          <p className="text-hero-foreground/60 text-[10px]">{artist.services?.[0] || "Entertainer"}</p>
                          <p className="text-hero-foreground/60 text-[10px]">{[artist.city, artist.country].filter(Boolean).join(", ") || ""}</p>
                        </div>
                        {artist.booking_price && <p className="font-bold text-sm">₦{Number(artist.booking_price).toLocaleString()}</p>}
                      </div>
                      <Button size="sm" className="rounded-full text-[10px] h-7 px-3 mt-2">Book Now</Button>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <div className="text-right mt-3">
              <Link to="/book-artist" className="text-primary text-xs font-medium">See more...</Link>
            </div>
          </div>
        </section>
      )}

      {/* Challenges from DB */}
      {challenges.length > 0 && (
        <section className="container py-12">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {challenges.map((ch) => (
              <motion.div key={ch.id} variants={fadeUp}>
                <Link to={`/challenge/${ch.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                  {ch.banner_url ? (
                    <img src={ch.banner_url} alt={ch.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 bg-gradient-to-br from-primary/20 to-muted" />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-display font-bold text-sm">{ch.title}</h3>
                      {ch.prize && <p className="font-bold text-sm">{ch.prize}</p>}
                    </div>
                    <p className="text-primary text-[10px] font-medium">{ch.participants_count || 0} participants</p>
                    <p className="text-muted-foreground text-[10px] my-1 line-clamp-2">{ch.description || ""}</p>
                    {ch.start_date && ch.end_date && (
                      <p className="text-muted-foreground text-[10px]">{format(new Date(ch.start_date), "d MMM")} - {format(new Date(ch.end_date), "d MMM yyyy")}</p>
                    )}
                    <Button variant="secondary" size="sm" className="rounded-none text-[10px] h-7 px-4 mt-2 bg-foreground text-background hover:bg-foreground/90">
                      Participate Now
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default Index;
