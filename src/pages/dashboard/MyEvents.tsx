import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, MapPin, Calendar, Users, Plus, Pencil, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyEvents = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("events")
      .select("*, ticket_types(id, name, price, quantity, sold)")
      .eq("organizer_id", user.id)
      .order("created_at", { ascending: false });
    setEvents(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleDelete = async (eventId: string) => {
    // Delete ticket types first, then event
    await supabase.from("ticket_types").delete().eq("event_id", eventId);
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Event deleted", description: "Your event has been removed." });
    fetchEvents();
  };

  const totalSold = (event: any) => event.ticket_types?.reduce((sum: number, t: any) => sum + (t.sold || 0), 0) || 0;
  const totalCapacity = (event: any) => event.ticket_types?.reduce((sum: number, t: any) => sum + t.quantity, 0) || event.capacity || 0;

  const getStatus = (event: any) => {
    const now = new Date();
    const end = event.end_date ? new Date(event.end_date) : new Date(event.date);
    if (end < now) return "ended";
    return event.status;
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CalendarPlus className="w-6 h-6 text-primary" /> My Events
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your events and track ticket sales</p>
          </div>
          <Button asChild>
            <Link to="/dashboard/create-event"><Plus className="w-4 h-4 mr-2" /> Create Event</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarPlus className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No events yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Create your first event to get started</p>
              <Button asChild className="mt-4">
                <Link to="/dashboard/create-event">Create Event</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.map((event, i) => {
              const status = getStatus(event);
              return (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-base truncate">{event.title}</h3>
                            <Badge
                              variant={status === "published" ? "default" : status === "ended" ? "destructive" : "secondary"}
                              className="text-xs capitalize"
                            >
                              {status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{format(new Date(event.date), "MMM d, yyyy")}</span>
                            {event.venue && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.venue}</span>}
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{totalSold(event)} / {totalCapacity(event)} sold</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${totalCapacity(event) > 0 ? (totalSold(event) / totalCapacity(event)) * 100 : 0}%` }}
                            />
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/dashboard/edit-event/${event.id}`)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete event?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently delete "{event.title}" and all its ticket types. This cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
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

export default MyEvents;
