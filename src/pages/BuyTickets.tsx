import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const events = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: i % 2 === 0 ? "Asake Concert 2025" : "Davido Live Tour",
  price: "$500",
  desc: "Organizers can find artists, compare prices, and book them instantly. Artist get discovered and promoted",
}));

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const BuyTickets = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="container py-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-primary text-[10px] font-medium">Get your tickets !!!!!!!</p>
            <h1 className="font-display text-2xl font-bold">Upcoming Events</h1>
          </div>
          <div className="text-xs text-muted-foreground">Abia State ▾</div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-9 h-9 text-sm rounded-full" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {events.map((event) => (
            <motion.div key={event.id} variants={fadeUp}>
              <Link to={`/event/${event.id}`} className="block border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-28 bg-gradient-to-br from-primary/20 to-muted" />
                <div className="p-2.5">
                  <h3 className="font-bold text-xs">{event.title}</h3>
                  <p className="text-muted-foreground text-[9px] leading-relaxed my-1 line-clamp-2">{event.desc}</p>
                  <p className="font-bold text-xs">{event.price}</p>
                  <p className="text-[9px] text-muted-foreground mb-1.5">limited ticket</p>
                  <Button size="sm" className="rounded-full text-[9px] h-6 px-2.5 w-full">Get Ticket!!!</Button>
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

export default BuyTickets;
