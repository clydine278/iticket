import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Music, Search, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((artist, i) => {
              const name = artist.stage_name || artist.full_name || "Artist";
              const initials = name.slice(0, 2).toUpperCase();
              return (
                <motion.div key={artist.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardContent className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{name}</h3>
                          {artist.city && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{artist.city}
                            </span>
                          )}
                        </div>
                      </div>
                      {artist.bio && <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{artist.bio}</p>}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {artist.services?.map((s: string) => (
                          <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                        ))}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
                        {artist.booking_price && (
                          <span className="text-sm font-bold text-primary flex items-center gap-1">
                            <DollarSign className="w-3.5 h-3.5" />{artist.booking_price}
                          </span>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedArtist(artist.id)}>Book Now</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Book {name}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-2">
                              <div className="space-y-2">
                                <Label>Event Name *</Label>
                                <Input value={bookingForm.event_name} onChange={(e) => setBookingForm({ ...bookingForm, event_name: e.target.value })} placeholder="Your event name" />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
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
