import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, XCircle, ExternalLink, Clock, Video, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const AdminChallengeApprovals = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("challenge_entries")
        .select(`
          id,
          video_url,
          status,
          created_at,
          user_id,
          challenges (
            title
          )
        `)
        // THIS IS THE FIX: Matches the exact status we set during upload
        .eq("status", "pending_approval") 
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (err: any) {
      console.error("Error fetching approvals:", err);
      toast.error("Failed to load pending approvals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleAction = async (entryId: string, newStatus: "approved" | "rejected") => {
    setProcessingId(entryId);
    try {
      const { error } = await supabase
        .from("challenge_entries")
        .update({ status: newStatus })
        .eq("id", entryId);

      if (error) throw error;

      toast.success(`Entry has been ${newStatus}!`);
      // Remove the item from the UI immediately without reloading everything
      setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p>Loading pending entries...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-border/60 rounded-xl bg-background/50">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500/50" />
        <h3 className="font-semibold text-lg text-foreground">All caught up!</h3>
        <p className="text-muted-foreground text-sm mt-1">There are no challenge entries waiting for approval.</p>
        <Button onClick={fetchPendingApprovals} variant="outline" className="mt-4">
          Refresh List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" /> Pending Approvals
            <Badge variant="secondary" className="ml-2 bg-amber-500/10 text-amber-600 border-amber-500/20">
              {entries.length} waiting
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">Review and approve user video submissions.</p>
        </div>
        <Button onClick={fetchPendingApprovals} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AnimatePresence>
          {entries.map((entry) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="overflow-hidden border-amber-500/20 bg-amber-500/5">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-foreground line-clamp-1">
                        {entry.challenges?.title || "Unknown Challenge"}
                      </h3>
                      <p className="text-xs text-muted-foreground font-mono mt-1">
                        User ID: {entry.user_id.substring(0, 8)}...
                      </p>
                    </div>
                    <Badge className="bg-amber-500 text-white hover:bg-amber-600 border-0">
                      Pending
                    </Badge>
                  </div>

                  <div className="bg-background/80 rounded-lg p-3 border border-border/50 flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Video className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm font-medium truncate text-muted-foreground">
                        {entry.video_url}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="shrink-0 w-8 h-8 hover:bg-primary/10 hover:text-primary"
                      asChild
                    >
                      <a href={entry.video_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => handleAction(entry.id, "rejected")}
                      disabled={processingId === entry.id}
                    >
                      {processingId === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><XCircle className="w-4 h-4 mr-2" /> Reject</>}
                    </Button>
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleAction(entry.id, "approved")}
                      disabled={processingId === entry.id}
                    >
                      {processingId === entry.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Approve</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};