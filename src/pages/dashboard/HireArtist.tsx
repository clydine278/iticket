import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Search, MapPin, Mail, Phone, Globe, Facebook, Instagram, Twitter, Video, Sparkles, ChevronDown, ChevronUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

const HireArtist = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [bookingForm, setBookingForm] = useState({
    event_name: "",
    venue: "",
    event_date: "",
    offered_price: "",
    message: "",
  });
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, Record<string, boolean>>>({});

  useEffect(() => {
    const fetchArtists = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_type", "artist")
        .order("created_at", { ascending: false });
      setArtists(data || []);
      setLoading(false);
    };
    fetchArtists();
  }, []);

  const filtered = artists.filter(
    (a) =>
      (a.stage_name || a.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.city || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleSection = (artistId: string, section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [artistId]: {
        ...prev[artistId],
        [section]: !prev[artistId]?.[section]
      }
    }));
  };

  const handleBooking = async () => {
    if (!user || !selectedArtist) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        organizer_id: user.id,
        artist_id: selectedArtist,
        event_name: bookingForm.event_name,
        venue: bookingForm.venue || null,
        event_date: bookingForm.event_date ? new Date(bookingForm.event_date).toISOString() : null,
        offered_price: parseFloat(bookingForm.offered_price) || null,
        message: bookingForm.message || null,
        status: "pending",
      });
      if (error) throw error;
      toast({ title: "Booking request sent!", description: "The artist will be notified." });
      setBookingForm({ event_name: "", venue: "", event_date: "", offered_price: "", message: "" });
      setSelectedArtist(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" /> Hire an Artist
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Browse and book artists for your events</p>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search artists, cities..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No artists found</h3>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filtered.map((artist, i) => {
              const name = artist.stage_name || artist.full_name || "Artist";
              const initials = name.slice(0, 2).toUpperCase();
              const socialLinks = (artist.social_links || {}) as Record<string, string>;
              const videos = artist.video_urls || [];
              return (
                <motion.div key={artist.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Avatar className="h-16 w-16 mx-auto sm:mx-0">
                          {artist.avatar_url ? (
                            <AvatarImage src={artist.avatar_url} alt={name} />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                              {initials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 text-center sm:text-left">
                          <h3 className="text-lg sm:text-xl font-semibold">{name}</h3>
                          <p className="text-sm text-muted-foreground">{artist.artist_category || "Artist"}</p>
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                            {artist.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3.5 h-3.5" /> {artist.email}
                              </span>
                            )}
                            {artist.city && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" /> {artist.city}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-center sm:text-right w-full sm:w-auto mt-4 sm:mt-0">
                          {artist.booking_price && (
                            <div className="text-lg font-bold text-primary">
                              ₦{Number(artist.booking_price).toLocaleString()}
                            </div>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" className="mt-2 w-full sm:w-auto" onClick={() => setSelectedArtist(artist.id)}>Book Now</Button>
                            </DialogTrigger>
                            <DialogContent className="mx-4">
                              <DialogHeader>
                                <DialogTitle>Book {name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-2">
                                <div className="space-y-2">
                                  <Label>Event Name *</Label>
                                  <Input value={bookingForm.event_name} onChange={(e) => setBookingForm({ ...bookingForm, event_name: e.target.value })} placeholder="Your event name" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-2">
                                    <Label>Venue</Label>
                                    <Input value={bookingForm.venue} onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })} placeholder="Venue" />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="datetime-local" value={bookingForm.event_date} onChange={(e) => setBookingForm({ ...bookingForm, event_date: e.target.value })} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Offered Price</Label>
                                  <Input type="number" value={bookingForm.offered_price} onChange={(e) => setBookingForm({ ...bookingForm, offered_price: e.target.value })} placeholder="Amount" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Message</Label>
                                  <Textarea value={bookingForm.message} onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })} placeholder="Tell the artist about your event..." rows={3} />
                                </div>
                                <Button onClick={handleBooking} disabled={submitting || !bookingForm.event_name} className="w-full">
                                  {submitting ? "Sending..." : "Send Booking Request"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
                      {/* Basic Information */}
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSection(artist.id, 'basic')}
                          className="w-full justify-between p-0 h-auto font-medium mb-3 text-sm sm:text-base"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Basic Information
                          </div>
                          {expandedSections[artist.id]?.basic ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <AnimatePresence>
                          {expandedSections[artist.id]?.basic && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm pt-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Full Name:</span>
                                  <p className="font-medium sm:text-right">{artist.full_name || "-"}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Username:</span>
                                  <p className="font-medium sm:text-right">{artist.username || "-"}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Email:</span>
                                  <p className="font-medium sm:text-right break-all">{artist.email || "-"}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Phone:</span>
                                  <p className="font-medium sm:text-right">{artist.phone || "-"}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Location:</span>
                                  <p className="font-medium sm:text-right">{[artist.city, artist.country].filter(Boolean).join(", ") || "-"}</p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Separator />

                      {/* Artist Details */}
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSection(artist.id, 'details')}
                          className="w-full justify-between p-0 h-auto font-medium mb-3 text-sm sm:text-base"
                        >
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" /> Artist Details
                          </div>
                          {expandedSections[artist.id]?.details ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <AnimatePresence>
                          {expandedSections[artist.id]?.details && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm pt-2">
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Stage Name:</span>
                                  <p className="font-medium sm:text-right">{artist.stage_name || "-"}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Booking Price:</span>
                                  <p className="font-medium sm:text-right">{artist.booking_price ? `₦${Number(artist.booking_price).toLocaleString()}` : "-"}</p>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between">
                                  <span className="text-muted-foreground">Artist Category:</span>
                                  <p className="font-medium sm:text-right">{artist.artist_category || "-"}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Services:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {artist.services?.length ? artist.services.map((s: string) => (
                                      <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                                    )) : <span className="text-muted-foreground">-</span>}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Separator />

                      {/* Social Links */}
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSection(artist.id, 'social')}
                          className="w-full justify-between p-0 h-auto font-medium mb-3 text-sm sm:text-base"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4" /> Social Links
                          </div>
                          {expandedSections[artist.id]?.social ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <AnimatePresence>
                          {expandedSections[artist.id]?.social && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-sm pt-2">
                                {socialLinks.facebook && (
                                  <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                                    <Facebook className="w-4 h-4" /> Facebook
                                  </a>
                                )}
                                {socialLinks.instagram && (
                                  <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-pink-600 hover:underline">
                                    <Instagram className="w-4 h-4" /> Instagram
                                  </a>
                                )}
                                {socialLinks.tiktok && (
                                  <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-black hover:underline">
                                    <Video className="w-4 h-4" /> TikTok
                                  </a>
                                )}
                                {socialLinks.twitter && (
                                  <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-400 hover:underline">
                                    <Twitter className="w-4 h-4" /> Twitter
                                  </a>
                                )}
                                {!socialLinks.facebook && !socialLinks.instagram && !socialLinks.tiktok && !socialLinks.twitter && (
                                  <span className="text-muted-foreground">No social links provided</span>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Separator />

                      {/* Performance Videos */}
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSection(artist.id, 'videos')}
                          className="w-full justify-between p-0 h-auto font-medium mb-3 text-sm sm:text-base"
                        >
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4" /> Performance Videos
                          </div>
                          {expandedSections[artist.id]?.videos ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <AnimatePresence>
                          {expandedSections[artist.id]?.videos && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-2 pt-2">
                                {[0, 1, 2].map((index) => (
                                  <div key={index} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                                    <span className="text-muted-foreground sm:min-w-[80px]">Video {index + 1}:</span>
                                    {videos[index] ? (
                                      <a href={videos[index]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                        {videos[index]}
                                      </a>
                                    ) : (
                                      <span className="text-muted-foreground">Not provided</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <Separator />

                      {/* About */}
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => toggleSection(artist.id, 'about')}
                          className="w-full justify-between p-0 h-auto font-medium mb-3 text-sm sm:text-base"
                        >
                          <div className="flex items-center gap-2">
                            <Info className="w-4 h-4" /> About
                          </div>
                          {expandedSections[artist.id]?.about ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                        <AnimatePresence>
                          {expandedSections[artist.id]?.about && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-muted-foreground leading-relaxed pt-2">
                                {artist.bio || "No bio provided yet."}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default HireArtist;
