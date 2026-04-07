import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "@/hooks/use-toast";

const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [artist, setArtist] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingForm, setBookingForm] = useState({
    event_name: "",
    venue: "",
    event_date: "",
    offered_price: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchArtist = async () => {
      if (!id) {
        setError("Artist ID is missing.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        setError(error?.message || "Artist not found.");
      } else {
        setArtist(data);
      }

      setLoading(false);
    };

    fetchArtist();
  }, [id]);

  const handleBooking = async () => {
    if (!user || !artist) return;
    if (!bookingForm.event_name) {
      toast({ title: "Event name required", description: "Please enter your event name.", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("bookings").insert({
      organizer_id: user.id,
      artist_id: artist.id,
      event_name: bookingForm.event_name,
      venue: bookingForm.venue || null,
      event_date: bookingForm.event_date ? new Date(bookingForm.event_date).toISOString() : null,
      offered_price: bookingForm.offered_price ? Number(bookingForm.offered_price) : null,
      message: bookingForm.message || null,
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Unable to send booking", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Booking request sent", description: "The artist will be notified.", variant: "default" });
    setBookingForm({ event_name: "", venue: "", event_date: "", offered_price: "", message: "" });
    setShowBookingForm(false);
  };

  const socialLinks = (artist?.social_links || {}) as Record<string, string>;
  const services = artist?.services || [];
  const videos = artist?.video_urls || [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-[320px] rounded-3xl border border-red-500/30 bg-red-500/5 p-8 text-red-400">
          <h2 className="text-xl font-semibold">Unable to load artist</h2>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!artist) return null;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white pb-12">
        {/* Hero Section - Matching ArtistDetail */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          
          <div className="container flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 py-8 md:py-12 relative z-20">
            {/* Mobile: Circular Avatar / Desktop: Large Image */}
            <div className="flex-shrink-0">
              {/* Mobile: Small circular avatar */}
              <div className="md:hidden w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 bg-gray-800">
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

            {/* Artist Info */}
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
              
              {/* Book Artist Button */}
              <Button 
                onClick={() => setShowBookingForm(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 md:px-12 py-4 md:py-6 text-xs md:text-sm font-semibold"
              >
                Book Artist
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="container py-8 md:py-12">
          <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
            {/* Left Column */}
            <div className="space-y-4 md:space-y-6">
              {/* Basic Information */}
              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base md:text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:gap-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Full Name</p>
                      <p className="text-white">{artist.full_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Username</p>
                      <p className="text-white">{artist.username || "-"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-white break-all">{artist.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone</p>
                      <p className="text-white">{artist.phone || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Location</p>
                    <p className="text-white">{[artist.city, artist.country].filter(Boolean).join(", ") || "-"}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Artist Details */}
              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base md:text-lg">Artist Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:gap-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Stage Name</p>
                      <p className="text-white">{artist.stage_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Booking Price</p>
                      <p className="text-white">{artist.booking_price ? `₦${Number(artist.booking_price).toLocaleString()}` : "-"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Artist Category</p>
                      <p className="text-white">{artist.artist_category || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Services</p>
                      <p className="text-white">{services.length ? services.join(", ") : "-"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social Links */}
              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base md:text-lg">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  {[
                    { label: "Facebook", key: "facebook", icon: <Facebook className="w-4 h-4 text-gray-500" /> },
                    { label: "Instagram", key: "instagram", icon: <Instagram className="w-4 h-4 text-gray-500" /> },
                    { label: "TikTok", key: "tiktok", icon: <Video className="w-4 h-4 text-gray-500" /> },
                    { label: "Twitter", key: "twitter", icon: <Twitter className="w-4 h-4 text-gray-500" /> },
                  ].map((social) => (
                    <div key={social.key} className="flex items-center gap-2 text-sm">
                      {social.icon}
                      <span className="text-gray-500 min-w-[80px]">{social.label}:</span>
                      <span className="text-white flex-1">
                        {socialLinks[social.key] ? (
                          <a 
                            href={socialLinks[social.key]} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-orange-500 hover:underline break-all"
                          >
                            {socialLinks[social.key]}
                          </a>
                        ) : (
                          <span className="text-gray-500">Not provided</span>
                        )}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Performance Videos */}
              <Card className="bg-[#1a1a1a] border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base md:text-lg">Performance Videos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 md:space-y-3">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="rounded-xl border border-gray-700 p-3 md:p-4 bg-gray-900/50">
                      <p className="text-xs text-gray-500 mb-1">Video {index + 1}</p>
                      <p className="text-sm text-white">
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

            {/* Right Column - Booking Form or About */}
            <div className="space-y-4 md:space-y-6">
              {showBookingForm ? (
                /* Booking Form Card */
                <Card className="bg-[#1a1a1a] border-gray-800 sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base">
                      Book {artist.stage_name || artist.full_name || "this artist"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500">Event Name</label>
                      <Input
                        value={bookingForm.event_name}
                        onChange={(e) => setBookingForm({ ...bookingForm, event_name: e.target.value })}
                        placeholder="My private concert"
                        className="h-9 md:h-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Venue</label>
                        <Input
                          value={bookingForm.venue}
                          onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })}
                          placeholder="Venue name"
                          className="h-9 md:h-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">Event Date</label>
                        <Input
                          type="date"
                          value={bookingForm.event_date}
                          onChange={(e) => setBookingForm({ ...bookingForm, event_date: e.target.value })}
                          className="h-9 md:h-10 bg-gray-900 border-gray-700 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500">Offered Price</label>
                      <Input
                        type="number"
                        value={bookingForm.offered_price}
                        onChange={(e) => setBookingForm({ ...bookingForm, offered_price: e.target.value })}
                        placeholder="10000"
                        className="h-9 md:h-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-gray-500">Message</label>
                      <Textarea
                        value={bookingForm.message}
                        onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                        placeholder="Tell the artist about your event"
                        className="min-h-[100px] md:min-h-[120px] bg-gray-900 border-gray-700 text-white placeholder:text-gray-600 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline"
                        onClick={() => setShowBookingForm(false)}
                        className="flex-1 rounded-full border-gray-600 text-white hover:bg-gray-800 text-xs md:text-sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleBooking} 
                        disabled={submitting}
                        className="flex-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm"
                      >
                        {submitting ? "Sending..." : "Send Request"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* About Card (shown when booking form is hidden) */
                <Card className="bg-[#1a1a1a] border-gray-800 sticky top-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-base md:text-lg">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-gray-400">
                      {artist.bio || "No bio yet. The artist can add a description from their profile settings."}
                    </p>
                    <Button 
                      onClick={() => setShowBookingForm(true)}
                      className="w-full mt-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Book This Artist
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ArtistProfile;