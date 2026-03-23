import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Ticket, Users, Calendar, Award, Sparkles, Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { icon: Calendar, value: "50", label: "Active Events" },
  { icon: Users, value: "10", label: "Top Artist" },
  { icon: Ticket, value: "5k", label: "Ticket Sold" },
  { icon: Award, value: "21", label: "Challenges" },
];

const features = [
  { icon: Ticket, title: "Buy Ticket Easily", desc: "Organizers can find artists, compare prices, and book them instantly. Artist get discovered and promoted", cta: "Explore Artist", link: "/buy-tickets" },
  { icon: Search, title: "Discover & Book Talent", desc: "Organizers can find artists, compare prices, and book them instantly. Artist get discovered and promoted", cta: "Explore Artist", link: "/book-artist" },
  { icon: Sparkles, title: "Join a Challenge", desc: "Show off your skill, compete with others, and win prizes or event tickets.", cta: "Join Challenge", link: "/challenges" },
];

const events = [
  { id: 1, title: "Asake Concert 2025", price: "$500", desc: "Organizers can find artists, compare prices, and book them instantly. Artist get discovered and promoted" },
  { id: 2, title: "Davido Live Tour", price: "$500", desc: "Organizers can find artists, compare prices, and book them instantly. Artist get discovered and promoted" },
  { id: 3, title: "Asake Concert 2025", price: "$500", desc: "Organizers can find artists, compare prices, and book them instantly. Artist get discovered and promoted" },
];

const artists = [
  { id: 1, name: "Sabinus (Chimake Efe)", role: "Comedian", location: "Port Harcourt, Nigeria", price: "$500" },
  { id: 2, name: "Carter Efe (Isaac Ini)", role: "Comedian", location: "Port Harcourt, Nigeria", price: "$500" },
  { id: 3, name: "Sabinus (Chimake Efe)", role: "Comedian", location: "Port Harcourt, Nigeria", price: "$500" },
];

const challenges = [
  { id: 1, title: "Afrobeat Dance Challenge", prize: "$1,000", participants: "5,000 participant", desc: "Create a 2min dance vid with the song 'with you' Davido ft Omarlah", date: "1 January - 31 February 2026." },
  { id: 2, title: "Afrobeat Dance Challenge", prize: "$1,000", participants: "5,000 participant", desc: "Create a 2min dance vid with the song 'with you' Davido ft Omarlah", date: "1 January - 31 February 2026." },
  { id: 3, title: "Afrobeat Dance Challenge", prize: "$1,000", participants: "5,000 participant", desc: "Create a 2min dance vid with the song 'with you' Davido ft Omarlah", date: "1 January - 31 February 2026." },
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
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero text-hero-foreground py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-hero/80 to-hero opacity-90" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 container"
        >
          <p className="text-primary text-sm font-semibold mb-2">All in One Place.</p>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
            Ticket . Music. Challenges
          </h1>
          <p className="text-hero-foreground/60 text-sm mb-6 max-w-md mx-auto">
            Discover events, book artist, and join music challenges.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/buy-tickets">
              <Button variant="outline" size="sm" className="rounded-full border-hero-foreground/30 text-hero-foreground hover:bg-hero-foreground/10 text-xs">
                Buy Ticket
              </Button>
            </Link>
            <Link to="/book-artist">
              <Button variant="outline" size="sm" className="rounded-full border-hero-foreground/30 text-hero-foreground hover:bg-hero-foreground/10 text-xs">
                Book Artist
              </Button>
            </Link>
            <Link to="/challenges">
              <Button size="sm" className="rounded-full text-xs">
                Join Challenge
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={stagger}
        className="container -mt-8 relative z-10"
      >
        <div className="border border-primary rounded-xl bg-background p-4 grid grid-cols-4 gap-2">
          {stats.map((stat) => (
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
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="border border-border rounded-xl p-5 text-center hover:shadow-md transition-shadow"
            >
              <f.icon className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <h3 className="font-display font-bold text-sm mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-[10px] leading-relaxed mb-3">{f.desc}</p>
              <Link to={f.link}>
                <Button size="sm" className="rounded-full text-[10px] h-7 px-4">{f.cta}</Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Events */}
      <section className="container pb-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {events.map((event) => (
            <motion.div key={event.id} variants={fadeUp}>
              <Link to={`/event/${event.id}`} className="block border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gradient-to-br from-primary/20 to-muted" />
                <div className="p-4">
                  <h3 className="font-display font-bold text-sm">{event.title}</h3>
                  <p className="text-muted-foreground text-[10px] leading-relaxed my-1">{event.desc}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="font-bold text-sm">{event.price}</p>
                      <p className="text-[10px] text-muted-foreground">limited ticket</p>
                    </div>
                    <Button size="sm" className="rounded-full text-[10px] h-7 px-3">Get Ticket!!!</Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <div className="text-right mt-3">
          <Link to="/buy-tickets" className="text-primary text-xs font-medium">See more...</Link>
        </div>
      </section>

      {/* Hire Artists */}
      <section className="bg-hero text-hero-foreground py-10">
        <div className="container">
          <h2 className="font-display text-lg font-bold text-center mb-6">Hire our talented Artist</h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {artists.map((artist) => (
              <motion.div key={artist.id} variants={fadeUp}>
                <Link to="/book-artist" className="block rounded-xl overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-primary/30 to-muted/20" />
                  <div className="p-3 bg-hero">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm">{artist.name}</h3>
                        <p className="text-hero-foreground/60 text-[10px]">{artist.role}</p>
                        <p className="text-hero-foreground/60 text-[10px]">{artist.location}</p>
                      </div>
                      <p className="font-bold text-sm">{artist.price}</p>
                    </div>
                    <Button size="sm" className="rounded-full text-[10px] h-7 px-3 mt-2">Book Now!!!</Button>
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

      {/* Challenges */}
      <section className="container py-12">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {challenges.map((ch) => (
            <motion.div key={ch.id} variants={fadeUp}>
              <Link to="/challenge/1" className="block border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-gradient-to-br from-primary/20 to-muted" />
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <h3 className="font-display font-bold text-sm">{ch.title}</h3>
                    <p className="font-bold text-sm">{ch.prize}</p>
                  </div>
                  <p className="text-primary text-[10px] font-medium">{ch.participants}</p>
                  <p className="text-muted-foreground text-[10px] my-1">{ch.desc}</p>
                  <p className="text-muted-foreground text-[10px]">{ch.date}</p>
                  <Button variant="secondary" size="sm" className="rounded-none text-[10px] h-7 px-4 mt-2 bg-foreground text-background hover:bg-foreground/90">
                    Participate Now!!!!!
                  </Button>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
