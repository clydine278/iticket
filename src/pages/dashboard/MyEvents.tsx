import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarPlus, MapPin, Calendar, Users, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("*, ticket_types(id, name, price, quantity, sold)")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, [user]);

  const totalSold = (event: any) => event.ticket_types?.reduce((sum: number, t: any) => sum + (t.sold || 0), 0) || 0;
  const totalCapacity = (event: any) => event.ticket_types?.reduce((sum: number, t: any) => sum + t.quantity, 0) || event.capacity || 0;

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
            {events.map((event, i) => (
              <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base truncate">{event.title}</h3>
                          <Badge variant={event.status === "published" ? "default" : "secondary"} className="text-xs capitalize">
                            {event.status}
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default MyEvents;
