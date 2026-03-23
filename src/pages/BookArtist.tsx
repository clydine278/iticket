import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const artists = [
  { id: 1, name: "Sabinus (Chimake Efe)", role: "Comedian", location: "Port Harcourt, Nigeria", price: "$500" },
  { id: 2, name: "Carter Efe (Isaac Ini)", role: "Comedian", location: "Port Harcourt, Nigeria", price: "$500" },
  { id: 3, name: "Sabinus (Chimake Efe)", role: "Comedian", location: "Port Harcourt, Nigeria", price: "$500" },
];

const BookArtist = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="bg-hero text-hero-foreground py-8">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-2xl font-bold mb-6"
          >
            Book An Artist
          </motion.h1>

          {/* Featured artist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-6 bg-hero rounded-xl overflow-hidden"
          >
            <div className="w-full md:w-1/2 h-48 bg-gradient-to-br from-primary/30 to-muted/20 rounded-xl" />
            <div className="flex-1">
              <h2 className="font-display text-xl font-bold">Cater Efe</h2>
              <p className="text-hero-foreground/60 text-sm">Stand up Comedian</p>
              <p className="text-hero-foreground/60 text-sm">Average Booking Price 400 -1000$</p>
              <div className="flex items-center gap-1 text-hero-foreground/60 text-sm mt-1">
                <MapPin className="w-3 h-3" /> Location: Abuja
              </div>
              <Button className="mt-3 rounded-full px-8">Book Artist</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Portfolio */}
      <section className="container py-8">
        <p className="text-center text-muted-foreground text-sm mb-6">
          Add your best performance so entertainers can see
        </p>
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-3 gap-3"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
              className="aspect-square bg-gradient-to-br from-primary/20 to-muted rounded-lg"
            />
          ))}
        </motion.div>
      </section>

      {/* More artists */}
      <section className="bg-hero text-hero-foreground py-8">
        <div className="container">
          <h2 className="font-display text-lg font-bold text-center mb-6">Hire our talented Artist</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div key={artist.id} className="rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-primary/30 to-muted/20" />
                <div className="p-3">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BookArtist;
