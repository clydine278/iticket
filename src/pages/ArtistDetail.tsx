import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Facebook, 
  Instagram, 
  Twitter, 
  Video,
  Music,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const ArtistDetail = () => {
  const navigate = useNavigate();
  const params = useParams();
  const artistId = params.artistId;
  
  const [artist, setArtist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    event_name: "",
    venue: "",
    event_date: "",
    offered_price: "",
    message: "",
  });

  useEffect(() => {
    if (!artistId) {
      setError("No artist ID provided");
      setLoading(false);
      return;
    }

    const fetchArtist = async () => {
      try {
        const { data, error: supabaseError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", artistId)
          .eq("account_type", "artist")
          .maybeSingle();

        if (supabaseError) {
          setError(`Database error: ${supabaseError.message}`);
          setLoading(false);
          return;
        }

        if (!data) {
          setError("Artist not found");
          setLoading(false);
          return;
        }

        setArtist(data);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("An unexpected error occurred");
        setLoading(false);
      }
    };

    fetchArtist();
  }, [artistId]);

  const handleBookClick = () => {
    navigate("/login", { 
      state: { 
        redirectTo: `/artist/${artistId}`,
        message: "Please sign in to book this artist" 
      } 
    });
  };

  const socialLinks = (artist?.social_links || {}) as Record<string, string>;
  const services = artist?.services || [];
  const videos = artist?.video_urls || [];

  if (!artistId) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex flex-col justify-center items-center h-96 gap-4">
          <p className="text-red-400 text-lg">{error}</p>
          <Button 
            onClick={() => navigate("/book-artist")}
            className="bg-orange-500 hover:bg-orange-600 rounded-full mt-4"
          >
            Back to Artists
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artist) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
        
        <div className="container flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 py-8 md:py-12 relative z-20">
          {/* Mobile: Circular Avatar (left) + Info (right) stacked horizontally */}
          {/* Desktop: Large Image (left) + Info (right) side by side */}
          
          {/* Avatar/Image Container */}
          <div className="flex-shrink-0">
            {/* Mobile: Small circular avatar (80x80) */}
            <div className="md:hidden w-40 h-40 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800">
              {artist.avatar_url ? (
                <img 
                  src={artist.avatar_url} 
                  alt={artist.stage_name || artist.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500/30 to-gray-700 flex items-center justify-center">
                  <span className="font-bold text-lg text-orange-400">
                    {(artist.stage_name || artist.full_name || "AR").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Desktop: Large rectangular image */}
            <div className="hidden md:block w-full md:w-[400px] lg:w-[500px] aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden bg-gray-800">
              {artist.avatar_url ? (
                <img 
                  src={artist.avatar_url} 
                  alt={artist.stage_name || artist.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-500/30 to-gray-700 flex items-center justify-center">
                  <span className="font-bold text-4xl text-orange-400">
                    {(artist.stage_name || artist.full_name || "AR").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Artist Info - Mobile: flex-1 to take remaining space, Desktop: full width */}
          <div className="flex-1 md:pl-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-1 md:mb-2"
            >
              {artist.stage_name || artist.full_name || "Artist"}
            </motion.h1>
            <p className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
              {artist.artist_category || services[0] || "Artist"}
            </p>
            <p className="text-gray-400 text-xs md:text-sm mb-1 md:mb-2">
              Average Booking Price: {" "}
              <span className="text-white font-semibold">
                {artist.booking_price 
                  ? `₦${Number(artist.booking_price).toLocaleString()}`
                  : "Contact for pricing"
                }
              </span>
            </p>
            <div className="flex items-center gap-1 text-gray-400 text-xs md:text-sm mb-4 md:mb-6">
              <MapPin className="w-3 h-3 md:w-4 md:h-4" /> 
              <span className="truncate">
                {[artist.city, artist.country].filter(Boolean).join(", ") || "Not specified"}
              </span>
            </div>
            
            <Button 
              onClick={handleBookClick} 
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 md:px-12 py-4 md:py-6 text-xs md:text-sm font-semibold"
            >
              Book Artist
            </Button>
          </div>
        </div>
      </section>
            {/* Gallery Section - Right under hero */}
      {artist?.gallery_images && artist.gallery_images.length > 0 && (
        <section className="container py-6 md:py-8">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Gallery</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {artist.gallery_images.map((imageUrl: string, index: number) => (
              imageUrl && (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-800 cursor-pointer"
                  onClick={() => window.open(imageUrl, '_blank')}
                >
                  <img
                    src={imageUrl}
                    alt={`${artist.stage_name || artist.full_name} gallery ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-xs text-white/90 font-medium">View Photo {index + 1}</span>
                  </div>
                </motion.div>
              )
            ))}
          </div>
        </section>
      )}
      {/* Main Content Grid */}
      <section className="container py-12">
        <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="text-white">{artist.full_name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Username</p>
                  <p className="text-white">{artist.username || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-white">{artist.email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-white">{artist.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-white">{[artist.city, artist.country].filter(Boolean).join(", ") || "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Artist Details */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Artist Details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Stage Name</p>
                  <p className="text-white">{artist.stage_name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Booking Price</p>
                  <p className="text-white">{artist.booking_price ? `₦${Number(artist.booking_price).toLocaleString()}` : "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Artist Category</p>
                  <p className="text-white">{artist.artist_category || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Services</p>
                  <p className="text-white">{services.length ? services.join(", ") : "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Social Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Facebook", key: "facebook", icon: <Facebook className="w-4 h-4 text-gray-500" /> },
                  { label: "Instagram", key: "instagram", icon: <Instagram className="w-4 h-4 text-gray-500" /> },
                  { label: "TikTok", key: "tiktok", icon: <Video className="w-4 h-4 text-gray-500" /> },
                  { label: "Twitter", key: "twitter", icon: <Twitter className="w-4 h-4 text-gray-500" /> },
                ].map((social) => (
                  <div key={social.key} className="flex items-center gap-2 text-sm">
                    {social.icon}
                    <span className="text-gray-500">{social.label}:</span>
                    <span className="text-white">
                      {socialLinks[social.key] ? (
                        <a 
                          href={socialLinks[social.key]} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-orange-500 hover:underline"
                        >
                          {socialLinks[social.key]}
                        </a>
                      ) : (
                        "Not provided"
                      )}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Videos */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Performance Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="rounded-xl border border-gray-700 p-4 bg-gray-900/50">
                    <p className="text-xs text-gray-500">Video {index + 1}</p>
                    <p className="mt-2 text-sm text-white">
                      {videos[index] ? (
                        <a 
                          href={videos[index]} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-orange-500 hover:underline break-all"
                        >
                          {videos[index]}
                        </a>
                      ) : (
                        <span className="text-gray-500">No video provided</span>
                      )}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Booking Form Card */}
            {/* <Card className="bg-[#1a1a1a] border-gray-800 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Book {artist.stage_name || artist.full_name || "this artist"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Event Name</label>
                  <Input
                    value={bookingForm.event_name}
                    onChange={(e) => setBookingForm({ ...bookingForm, event_name: e.target.value })}
                    placeholder="My private concert"
                    className="h-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Venue</label>
                    <Input
                      value={bookingForm.venue}
                      onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })}
                      placeholder="Venue name"
                      className="h-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500">Event Date</label>
                    <Input
                      type="date"
                      value={bookingForm.event_date}
                      onChange={(e) => setBookingForm({ ...bookingForm, event_date: e.target.value })}
                      className="h-10 bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Offered Price</label>
                  <Input
                    type="number"
                    value={bookingForm.offered_price}
                    onChange={(e) => setBookingForm({ ...bookingForm, offered_price: e.target.value })}
                    placeholder="10000"
                    className="h-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Message</label>
                  <Textarea
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                    placeholder="Tell the artist about your event"
                    className="min-h-[120px] bg-gray-900 border-gray-700 text-white placeholder:text-gray-600"
                  />
                </div>
                <Button 
                  onClick={handleBookClick} 
                  className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Sign in to Send Booking Request
                </Button>
              </CardContent>
            </Card> */}

            {/* About Card */}
            <Card className="bg-[#1a1a1a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-gray-400">
                  {artist.bio || "No bio yet. The artist can add a description from their profile settings."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtistDetail;