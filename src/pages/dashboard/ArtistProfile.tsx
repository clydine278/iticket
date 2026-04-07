import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Sparkles,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const ArtistProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<any>(null); // ADD THIS
  const [bookingForm, setBookingForm] = useState({
    event_name: "",
    venue: "",
    event_date: "",
    offered_price: "",
    message: "",
    expected_audience_size: "",
    deposit_available: false,
    event_type: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

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
    // Fetch current user profile to check if they're an organizer
  useEffect(() => {
    const fetchCurrentUserProfile = async () => {
      if (!user) {
        setCurrentUserProfile(null);
        return;
      }
      
      const { data } = await supabase
        .from("profiles")
        .select("account_type")
        .eq("id", user.id)
        .single();
        
      setCurrentUserProfile(data);
    };
    
    fetchCurrentUserProfile();
  }, [user]);
  const handleBooking = async () => {
    if (!user || !artist) return;
    
    // Validation
    if (!bookingForm.event_name) {
      toast({ 
        title: "Event name required", 
        description: "Please enter your event name.", 
        variant: "destructive" 
      });
      return;
    }
    
    if (!bookingForm.event_type) {
      toast({ 
        title: "Event type required", 
        description: "Please select an event type.", 
        variant: "destructive" 
      });
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
      // New fields
      expected_audience_size: bookingForm.expected_audience_size ? Number(bookingForm.expected_audience_size) : null,
      deposit_available: bookingForm.deposit_available,
      event_type: bookingForm.event_type,
      // Status defaults to 'pending' in DB
      status: "pending",
    });

    setSubmitting(false);

    if (error) {
      toast({ 
        title: "Unable to send booking", 
        description: error.message, 
        variant: "destructive" 
      });
      return;
    }

    toast({ 
      title: "Booking request sent!", 
      description: "The artist will review and accept or decline your request.", 
      variant: "default" 
    });
    
    // Reset form and close dialog
    setBookingForm({
      event_name: "",
      venue: "",
      event_date: "",
      offered_price: "",
      message: "",
      expected_audience_size: "",
      deposit_available: false,
      event_type: "",
    });
    setShowBookingDialog(false);
  };

  const socialLinks = (artist?.social_links || {}) as Record<string, string>;
  const services = artist?.services || [];
  const videos = artist?.video_urls || [];
  const galleryImages = artist?.gallery_images || [];
  const isOrganizer = currentUserProfile?.account_type === "organizer";
  const canBook = !!user && isOrganizer;
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
        {/* Hero Section */}
        <section className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
          
          <div className="container flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 py-8 md:py-12 relative z-20">
            {/* Avatar */}
            <div className="flex-shrink-0">
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
              
              {/* Book Button - Only for organizers */}
              {canBook ? (
                <Button 
                  onClick={() => setShowBookingDialog(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8 md:px-12 py-4 md:py-6 text-xs md:text-sm font-semibold"
                >
                  Book Artist
                </Button>
              ) : user ? (
                <div className="text-xs text-gray-500 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-700">
                  Only organizers can book artists
                </div>
              ) : (
                <Button 
                  onClick={() => navigate("/login")}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-full px-6 py-3 text-xs"
                >
                  Sign in to Book
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Gallery Section - Right under hero */}
        {galleryImages.length > 0 && (
          <section className="container py-6 md:py-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Gallery</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {galleryImages.map((imageUrl: string, index: number) => (
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

        {/* Booking Dialog */}
        <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
          <DialogContent className="bg-[#1a1a1a] border-gray-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white text-lg">
                Book {artist.stage_name || artist.full_name || "this artist"}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Event Name */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Event Name *</Label>
                <Input
                  value={bookingForm.event_name}
                  onChange={(e) => setBookingForm({ ...bookingForm, event_name: e.target.value })}
                  placeholder="My private concert"
                  className="h-10  border-gray-700 text-white placeholder:text-gray-600 text-sm"
                />
              </div>

              {/* Event Type Dropdown */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Event Type *</Label>
                <Select 
                  value={bookingForm.event_type} 
                  onValueChange={(v) => setBookingForm({ ...bookingForm, event_type: v })}
                >
                  <SelectTrigger className="h-10  border-gray-700 text-white text-sm">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent className=" border-gray-700">
                    <SelectItem value="concert">Concert</SelectItem>
                    <SelectItem value="wedding">Wedding</SelectItem>
                    <SelectItem value="corporate">Corporate Event</SelectItem>
                    <SelectItem value="party">Party</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="club">Club/Nightclub</SelectItem>
                    <SelectItem value="charity">Charity Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Venue & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">Venue</Label>
                  <Input
                    value={bookingForm.venue}
                    onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })}
                    placeholder="Venue name"
                    className="h-10  border-gray-700 text-white placeholder:text-gray-600 text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-400">Event Date</Label>
                  <Input
                    type="date"
                    value={bookingForm.event_date}
                    onChange={(e) => setBookingForm({ ...bookingForm, event_date: e.target.value })}
                    className="h-10 border-gray-700 text-white text-sm"
                  />
                </div>
              </div>

              {/* Expected Audience Size */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Expected Audience Size</Label>
                <Input
                  type="number"
                  value={bookingForm.expected_audience_size}
                  onChange={(e) => setBookingForm({ ...bookingForm, expected_audience_size: e.target.value })}
                  placeholder="e.g. 500"
                  className="h-10  border-gray-700 text-white placeholder:text-gray-600 text-sm"
                />
              </div>

              {/* Offered Price */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Offered Price (₦)</Label>
                <Input
                  type="number"
                  value={bookingForm.offered_price}
                  onChange={(e) => setBookingForm({ ...bookingForm, offered_price: e.target.value })}
                  placeholder="100000"
                  className="h-10  border-gray-700 text-white placeholder:text-gray-600 text-sm"
                />
              </div>

              {/* Deposit Available Checkbox */}
              <div className="flex items-center space-x-2 py-2">
                <Checkbox
                  id="deposit"
                  checked={bookingForm.deposit_available}
                  onCheckedChange={(checked) => 
                    setBookingForm({ ...bookingForm, deposit_available: checked as boolean })
                  }
                  className="border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                />
                <Label htmlFor="deposit" className="text-sm text-gray-300 cursor-pointer">
                  I can provide a deposit to secure this booking
                </Label>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-400">Message to Artist</Label>
                <Textarea
                  value={bookingForm.message}
                  onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                  placeholder="Tell the artist about your event, requirements, and any special requests..."
                  className="min-h-[100px]  border-gray-700 text-white placeholder:text-gray-600 text-sm"
                />
              </div>

              {/* Info Box */}
              <div className="rounded-lg  border border-gray-800 p-3">
                <p className="text-xs text-gray-400">
                  <span className="text-orange-500 font-medium">Note:</span> Your booking will be sent to the artist for review. You'll be notified once they accept or decline your request.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
              {/* Book Button - Only for organizers */}
              {canBook ? (
                <div></div>
              ) : user ? (
                <div className="text-xs text-gray-500 bg-gray-900/50 px-4 py-2 rounded-full border border-gray-700">
                  Only organizers can book artists
                </div>
              ) : (
                <Button 
                  onClick={() => navigate("/login")}
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-full px-6 py-3 text-xs"
                >
                  Sign in to Book
                </Button>
              )}
                <Button 
                  onClick={handleBooking} 
                  disabled={submitting}
                  className="flex-1 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-sm"
                >
                  {submitting ? "Sending..." : "Send Booking Request"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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

            {/* Right Column - About Card */}
            <div className="space-y-4 md:space-y-6">
              <Card className="bg-[#1a1a1a] border-gray-800 sticky top-4">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base md:text-lg">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-gray-400">
                    {artist.bio || "No bio yet. The artist can add a description from their profile settings."}
                  </p>
                  {canBook ? (
                    <Button 
                      onClick={() => setShowBookingDialog(true)}
                      className="w-full mt-4 rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      Book This Artist
                    </Button>
                  ) : user ? (
                    <div className="mt-4 p-3 rounded-lg bg-gray-900/50 border border-gray-800 text-xs text-gray-500 text-center">
                      Only organizers can book artists
                    </div>
                  ) : (
                    <Button 
                      onClick={() => navigate("/login")}
                      className="w-full mt-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
                    >
                      Sign in to Book
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ArtistProfile;