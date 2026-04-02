import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { CalendarPlus, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";

interface TicketTier {
  name: string;
  price: string;
  quantity: string;
  description: string;
}

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    venue: "",
    city: "",
    date: "",
    end_date: "",
    capacity: "",
    category: "concert",
    banner_url: "",
    status: "draft",
  });
  const [tickets, setTickets] = useState<TicketTier[]>([
    { name: "General Admission", price: "0", quantity: "100", description: "" },
  ]);

  const updateForm = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const addTicket = () => setTickets((t) => [...t, { name: "", price: "0", quantity: "50", description: "" }]);
  const removeTicket = (i: number) => setTickets((t) => t.filter((_, idx) => idx !== i));
  const updateTicket = (i: number, key: keyof TicketTier, value: string) =>
    setTickets((t) => t.map((ticket, idx) => (idx === i ? { ...ticket, [key]: value } : ticket)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { data: event, error } = await supabase
        .from("events")
        .insert({
          title: form.title,
          description: form.description,
          venue: form.venue,
          city: form.city,
          date: new Date(form.date).toISOString(),
          end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
          capacity: parseInt(form.capacity) || 0,
          category: form.category,
          banner_url: form.banner_url || null,
          status: form.status,
          organizer_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Insert ticket types
      const ticketInserts = tickets
        .filter((t) => t.name.trim())
        .map((t) => ({
          event_id: event.id,
          name: t.name,
          price: parseFloat(t.price) || 0,
          quantity: parseInt(t.quantity) || 0,
          description: t.description || null,
        }));

      if (ticketInserts.length > 0) {
        const { error: ticketError } = await supabase.from("ticket_types").insert(ticketInserts);
        if (ticketError) throw ticketError;
      }

      toast({ title: "Event created!", description: "Your event has been submitted successfully." });
      navigate("/dashboard/events");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalendarPlus className="w-6 h-6 text-primary" /> Create Event
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Fill in the details to submit your event for listing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
              <CardDescription>Basic information about your event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Event Title *</Label>
                <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="e.g. Summer Music Festival" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="Describe your event..." rows={4} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Venue *</Label>
                  <Input value={form.venue} onChange={(e) => updateForm("venue", e.target.value)} placeholder="Venue name" required />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="City" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date & Time *</Label>
                  <Input type="datetime-local" value={form.date} onChange={(e) => updateForm("date", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>End Date & Time</Label>
                  <Input type="datetime-local" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={(v) => updateForm("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concert">Concert</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="party">Party</SelectItem>
                      <SelectItem value="conference">Conference</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" value={form.capacity} onChange={(e) => updateForm("capacity", e.target.value)} placeholder="0" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <Input value={form.banner_url} onChange={(e) => updateForm("banner_url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => updateForm("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ticket Tiers</CardTitle>
              <CardDescription>Set up your ticket pricing and availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tickets.map((ticket, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Tier {i + 1}</span>
                    {tickets.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTicket(i)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input placeholder="Ticket name" value={ticket.name} onChange={(e) => updateTicket(i, "name", e.target.value)} />
                    <Input type="number" placeholder="Price" value={ticket.price} onChange={(e) => updateTicket(i, "price", e.target.value)} />
                    <Input type="number" placeholder="Quantity" value={ticket.quantity} onChange={(e) => updateTicket(i, "quantity", e.target.value)} />
                  </div>
                  <Input placeholder="Description (optional)" value={ticket.description} onChange={(e) => updateTicket(i, "description", e.target.value)} />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addTicket} className="w-full">
                <Plus className="w-4 h-4 mr-2" /> Add Ticket Tier
              </Button>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Submitting..." : "Create Event"}
          </Button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateEvent;
