import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, MapPin, Clock } from "lucide-react";

interface Props {
  events: any[];
}

function StatusBadge({ status }: { status: string }) {
  const cls = status === "published"
    ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{status}</span>;
}

export function AdminEventList({ events }: Props) {
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
              <StatusBadge status={e.status} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
