import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = ["All", "Afro-Beat", "Hip-Hop", "Dancers", "Ushers", "Rapers"];

const artists = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  name: "Sabinus (Chimake Efe)",
  role: "Comedian",
  price: "$500",
  rating: 3,
}));

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const BookArtist = () => {
  return (
    <div className="min-h-screen bg-hero text-hero-foreground">
      <Navbar />

      <section className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-1 gap-2">
          <div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl font-bold"
            >
              Book An Artist
            </motion.h1>
            <p className="text-hero-foreground/60 text-xs mt-1">
              Discover and request bookings for the best talent in the industry.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-hero-foreground/60">
            <span>Price Range ▾</span>
            <span>Abia State ▾</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search artists..." className="pl-9 h-9 text-sm rounded-full bg-hero-foreground/10 border-hero-foreground/20 text-hero-foreground placeholder:text-hero-foreground/40" />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-4 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "border border-hero-foreground/20 text-hero-foreground/70 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Artist Grid */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        >
          {artists.map((artist) => (
            <motion.div key={artist.id} variants={fadeUp}>
              <Link
                to={`/artist/${artist.id}`}
                className="block border border-hero-foreground/10 rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-center p-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/30 to-muted/20" />
                </div>
                <div className="px-3 pb-3">
                  <h3 className="font-bold text-xs truncate">{artist.name}</h3>
                  <p className="text-hero-foreground/50 text-[10px]">{artist.role}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= artist.rating ? "text-primary fill-primary" : "text-hero-foreground/20"}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-xs">{artist.price}</span>
                  </div>
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

export default BookArtist;
