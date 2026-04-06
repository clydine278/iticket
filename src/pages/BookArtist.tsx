import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const BookArtist = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtists = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_type", "artist")
        .eq("artist_fee_paid", true);
      setArtists(data || []);
      setLoading(false);
    };
    fetchArtists();
  }, []);

  const handleArtistClick = (e: React.MouseEvent, artistId: string) => {
    e.preventDefault();
    navigate("/login", { state: { redirectTo: `/artist/${artistId}` } });
  };

  const filtered = artists.filter(
    (a) =>
      (a.stage_name || a.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.services || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
  );

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
        </div>

        <div className="relative my-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search artists, services, cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm rounded-full bg-hero-foreground/10 border-hero-foreground/20 text-hero-foreground placeholder:text-hero-foreground/40"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-hero-foreground/60 text-sm">No artists found</div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
          >
            {filtered.map((artist) => (
              <motion.div key={artist.id} variants={fadeUp}>
                <Link
                  to={`/artist/${artist.id}`}
                  onClick={(e) => handleArtistClick(e, artist.id)}
                  className="block border border-hero-foreground/10 rounded-xl overflow-hidden hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-center p-4">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.stage_name || artist.full_name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/30 to-muted/20 flex items-center justify-center">
                        <span className="font-bold text-xl text-primary/60">
                          {(artist.stage_name || artist.full_name || "AR").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="px-3 pb-3">
                    <h3 className="font-bold text-xs truncate">{artist.stage_name || artist.full_name || "Artist"}</h3>
                    <p className="text-hero-foreground/50 text-[10px]">{(artist as any).artist_category || artist.services?.[0] || "Artist"}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-hero-foreground/50 text-[10px] truncate">
                        {[artist.city, artist.country].filter(Boolean).join(", ") || ""}
                      </p>
                      {artist.booking_price && (
                        <span className="font-bold text-xs">₦{Number(artist.booking_price).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default BookArtist;
