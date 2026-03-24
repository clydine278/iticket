import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, MapPin, Clock, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  events: any[];
  onRefresh?: () => void;
}

function StatusBadge({ status, endDate }: { status: string; endDate?: string }) {
  const now = new Date();
  const end = endDate ? new Date(endDate) : null;
  const isEnded = end && end < now;
  const displayStatus = isEnded ? "ended" : status;

  const cls = displayStatus === "published"
    ? "bg-primary/10 text-primary"
    : displayStatus === "ended"
    ? "bg-destructive/10 text-destructive"
    : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{displayStatus}</span>;
}

export function AdminEventList({ events, onRefresh }: Props) {
  const handleDelete = async (eventId: string) => {
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    if (error) { toast.error(error.message); return; }
    toast.success("Event deleted");
    onRefresh?.();
  };

  if (events.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-16 text-center">
          <CalendarPlus className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No events created yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display">All Events</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-4 sm:pt-0">
        <div className="divide-y divide-border/40 sm:divide-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-3">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-3 p-4 sm:p-4 sm:rounded-xl sm:border sm:border-border/40 hover:bg-muted/20 transition-colors"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="font-medium text-sm truncate">{e.title}</p>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="text-xs truncate">{e.venue || "No venue"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="text-xs">{new Date(e.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={e.status} endDate={e.end_date || e.date} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete event?</AlertDialogTitle>
                      <AlertDialogDescription>This will permanently delete "{e.title}". This cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(e.id)} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
