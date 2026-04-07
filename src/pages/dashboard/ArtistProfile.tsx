import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Mail, Phone, Globe, Sparkles, Music, Facebook, Instagram, Twitter, Video, Camera } from "lucide-react";
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
  };

  const socialLinks = (artist?.social_links || {}) as Record<string, string>;
  const services = artist?.services || [];
  const videos = artist?.video_urls || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {loading ? (
          <div className="min-h-[320px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="min-h-[320px] rounded-3xl border border-destructive/30 bg-destructive/5 p-8 text-destructive">
            <h2 className="text-xl font-semibold">Unable to load artist</h2>
            <p className="mt-2 text-sm">{error}</p>
          </div>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
              <Card className="border-border/70 bg-background p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      {artist?.avatar_url ? (
                        <img src={artist.avatar_url} alt={artist.stage_name || artist.full_name || "Artist"} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                          {(artist?.stage_name || artist?.full_name || "AR").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <p className="text-sm text-muted-foreground">Artist Profile</p>
                      <h1 className="text-3xl font-semibold">{artist?.stage_name || artist?.full_name || "Unknown Artist"}</h1>
                      <p className="mt-1 text-sm text-muted-foreground">{artist?.artist_category || "Artist"}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {artist?.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5" /> {artist.email}
                          </span>
                        )}
                        {artist?.city && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {artist.city}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Button size="sm">Change photo</Button>
                    <div className="rounded-2xl border border-border p-3">
                      <p className="text-xs text-muted-foreground">Booking price</p>
                      <p className="text-xl font-semibold">{artist?.booking_price ? `₦${Number(artist.booking_price).toLocaleString()}` : "Not set"}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <Card className="border-border/70 bg-background p-6">
                  <CardHeader>
                    <CardTitle className="text-base">Book {artist?.stage_name || artist?.full_name || "this artist"}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Event Name</label>
                      <Input
                        value={bookingForm.event_name}
                        onChange={(e) => setBookingForm({ ...bookingForm, event_name: e.target.value })}
                        placeholder="My private concert"
                        className="h-10"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Venue</label>
                        <Input
                          value={bookingForm.venue}
                          onChange={(e) => setBookingForm({ ...bookingForm, venue: e.target.value })}
                          placeholder="Venue name"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Event Date</label>
                        <Input
                          type="date"
                          value={bookingForm.event_date}
                          onChange={(e) => setBookingForm({ ...bookingForm, event_date: e.target.value })}
                          className="h-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Offered Price</label>
                      <Input
                        type="number"
                        value={bookingForm.offered_price}
                        onChange={(e) => setBookingForm({ ...bookingForm, offered_price: e.target.value })}
                        placeholder="10000"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-muted-foreground">Message</label>
                      <Textarea
                        value={bookingForm.message}
                        onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                        placeholder="Tell the artist about your event"
                        className="min-h-[120px]"
                      />
                    </div>
                    <Button onClick={handleBooking} disabled={submitting} className="w-full rounded-full">
                      {submitting ? "Sending request..." : "Send Booking Request"}
                    </Button>
                  </CardContent>
                </Card>
                <Card className="border-border/70 bg-background p-6">
                  <CardHeader>
                    <CardTitle className="text-base">About this artist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Review the artist details and booking requirements before sending your request.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-6">
                <Card className="border-border/70 bg-background p-6">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p>{artist.full_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Username</p>
                      <p>{artist.username || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p>{artist.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p>{artist.phone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p>{[artist.city, artist.country].filter(Boolean).join(", ") || "-"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-background p-6">
                  <CardHeader>
                    <CardTitle>Artist Details</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Stage Name</p>
                      <p>{artist.stage_name || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Booking Price</p>
                      <p>{artist.booking_price ? `₦${Number(artist.booking_price).toLocaleString()}` : "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Artist Category</p>
                      <p>{artist.artist_category || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Services</p>
                      <p>{services.length ? services.join(", ") : "-"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-background p-6">
                  <CardHeader>
                    <CardTitle>Social Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: "Facebook", key: "facebook", icon: <Facebook className="w-4 h-4" /> },
                      { label: "Instagram", key: "instagram", icon: <Instagram className="w-4 h-4" /> },
                      { label: "TikTok", key: "tiktok", icon: <Video className="w-4 h-4" /> },
                      { label: "Twitter", key: "twitter", icon: <Twitter className="w-4 h-4" /> },
                    ].map((social) => (
                      <div key={social.key} className="flex items-center gap-2 text-sm text-muted-foreground">
                        {social.icon}
                        <span>{social.label}:</span>
                        <span className="text-foreground">{socialLinks[social.key] || "Not provided"}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-border/70 bg-background p-6">
                  <CardHeader>
                    <CardTitle>Performance Videos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="rounded-2xl border border-border/60 p-4">
                        <p className="text-xs text-muted-foreground">Video {index + 1}</p>
                        <p className="mt-2 text-sm text-foreground">
                          {videos[index] ? (
                            <a href={videos[index]} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                              {videos[index]}
                            </a>
                          ) : (
                            "No video provided"
                          )}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-background p-6">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {artist.bio || "No bio yet. The artist can add a description from their profile settings."}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ArtistProfile;
