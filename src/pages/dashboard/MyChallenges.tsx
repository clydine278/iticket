import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Trophy, Plus, Music, Users, Edit, Image as ImageIcon, Heart, Eye, Trash2, Save, ExternalLink, CheckCircle2, Clock, Sparkles, XCircle, PartyPopper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";

const MyChallenges = () => {
  const { user } = useAuth();
  const accountType = user?.user_metadata?.account_type || "personal";
  
  const [challenges, setChallenges] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- EDIT DIALOG STATE (Creators) ---
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", rules: "", prize: "", song_title: "", song_url: "", banner_url: "", start_date: "", end_date: "",
  });

  // --- NOTIFICATION STATE (Fans) ---
  const [notifyQueue, setNotifyQueue] = useState<any[]>([]);

  const fetchChallenges = async () => {
    if (!user) return;
    if (accountType === "artist" || accountType === "organizer") {
      const { data } = await supabase
        .from("challenges")
        .select("*, challenge_entries(id)")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      setChallenges(data || []);
    } else {
      const { data } = await supabase
        .from("challenge_entries")
        .select("*, challenges(id, title, prize, status, end_date, banner_url)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      setEntries(data || []);

      // Queue up any Winner or Rejected notifications that haven't been seen
      if (data) {
        const unnotified = data.filter(e => (e.status === "winner" || e.status === "rejected") && !(e as any).notified);
        setNotifyQueue(unnotified);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchChallenges();
  }, [user, accountType]);

  const isCreator = accountType === "artist" || accountType === "organizer";

  // --- FAN NOTIFICATION LOGIC ---
  const currentNotification = notifyQueue[0];
  
  const handleAcknowledgeNotification = async () => {
    if (!currentNotification) return;

    try {
      // 1. Update the database so they never see it again
      await supabase
        .from("challenge_entries")
        .update({ status: currentNotification.status } as any)
        .eq("id", currentNotification.id);
      
      // 2. Remove it from the queue (shows the next one if they have multiple)
      setNotifyQueue(prev => prev.slice(1));
    } catch (err) {
      console.error("Failed to acknowledge notification", err);
    }
  };

  // --- CREATOR EDIT & DELETE LOGIC ---
  const openEditModal = (challenge: any) => {
    const formatForInput = (isoString: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : "";
    setForm({
      title: challenge.title || "", description: challenge.description || "", rules: challenge.rules || "", prize: challenge.prize || "", song_title: challenge.song_title || "", song_url: challenge.song_url || "", banner_url: challenge.banner_url || "", start_date: formatForInput(challenge.start_date), end_date: formatForInput(challenge.end_date),
    });
    setEditingChallenge(challenge);
  };

  const updateForm = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge) return;
    setSaving(true);
    const payload = {
      title: form.title, description: form.description || null, rules: form.rules || null, prize: form.prize || null, song_title: form.song_title || null, song_url: form.song_url || null, banner_url: form.banner_url || null, start_date: form.start_date ? new Date(form.start_date).toISOString() : null, end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    };
    try {
      const { error } = await supabase.from("challenges").update(payload).eq("id", editingChallenge.id);
      if (error) throw error;
      toast({ title: "Challenge Updated!", description: "Changes have been saved successfully." });
      setEditingChallenge(null);
      fetchChallenges();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingChallenge) return;
    if (!window.confirm("Are you sure you want to completely delete this challenge? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const { error } = await supabase.from("challenges").delete().eq("id", editingChallenge.id);
      if (error) throw error;
      toast({ title: "Challenge Deleted", description: "The challenge has been removed." });
      setEditingChallenge(null);
      fetchChallenges();
    } catch (err: any) {
      toast({ title: "Error deleting", description: err.message, variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  // --- UI HELPER ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "winner": return <Badge className="bg-yellow-500 text-white border-0 shadow-sm"><Trophy className="w-3 h-3 mr-1" /> Winner</Badge>;
      case "in_review": return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20"><Sparkles className="w-3 h-3 mr-1" /> In Review</Badge>;
      case "approved": return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Approved</Badge>;
      case "rejected": return <Badge className="bg-red-500/10 text-red-600 border-red-500/20"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case "pending_approval": return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20"><Clock className="w-3 h-3 mr-1" /> Pending Approval</Badge>;
      default: return <Badge className="bg-muted text-muted-foreground">Submitted</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-background z-10 sticky top-0 py-4 border-b border-border/40">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 tracking-tight">
              <Trophy className="w-6 h-6 text-primary" /> 
              {isCreator ? "My Challenges" : "Challenges I Joined"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isCreator ? "Manage and edit your live music challenges." : "Track your challenge entries and submission status."}
            </p>
          </div>
          {isCreator && (
            <Button asChild className="shrink-0 shadow-sm h-9 text-xs">
              <Link to="/dashboard/create-challenge"><Plus className="w-4 h-4 mr-1.5" /> Create Challenge</Link>
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : isCreator ? (
          /* ---------------- CREATOR VIEW ---------------- */
          challenges.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No challenges yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Launch a challenge to engage your fans and grow your audience.</p>
              <Button asChild className="mt-6" size="sm">
                <Link to="/dashboard/create-challenge">Create Your First Challenge</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {challenges.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden hover:shadow-md hover:border-primary/20 transition-all duration-300 group border-border/50">
                    <div className="flex flex-col sm:flex-row h-full">
                      <div className="w-full sm:w-32 h-28 sm:h-auto relative bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                        {c.banner_url ? (
                          <img src={c.banner_url} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-center min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{c.title}</h3>
                          <Badge variant={c.status === "active" ? "default" : "secondary"} className="hidden sm:inline-flex text-[9px] uppercase tracking-wider shrink-0">{c.status}</Badge>
                        </div>
                        <div className="flex items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground flex-wrap">
                          {c.song_title && <span className="flex items-center gap-1 font-medium text-foreground/80"><Music className="w-3 h-3 text-primary/70" />{c.song_title}</span>}
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.challenge_entries?.length || 0} Entries</span>
                          {c.prize && <span className="text-yellow-600 dark:text-yellow-500 font-medium bg-yellow-500/10 px-1.5 py-0.5 rounded text-[10px]">{c.prize}</span>}
                        </div>
                      </div>
                      <div className="p-3 sm:p-4 bg-muted/10 sm:border-l border-t sm:border-t-0 border-border/50 flex sm:flex-col items-center justify-center sm:w-28 shrink-0">
                        <Button variant="outline" size="sm" className="w-full h-8 text-xs shadow-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors" onClick={() => openEditModal(c)}>
                          <Edit className="w-3 h-3 mr-1.5" /> Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          /* ---------------- FAN VIEW ---------------- */
          entries.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed border-border/50">
              <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-lg">No entries yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Find your favorite artists and participate in their challenges.</p>
              <Button asChild className="mt-6" size="sm">
                <Link to="/dashboard/browse-challenges">Browse Challenges</Link>
              </Button>
            </div>
          ) : (
            <Card className="border-border/40 shadow-sm overflow-hidden bg-card/50">
              <div className="divide-y divide-border/40">
                <AnimatePresence mode="popLayout">
                  {entries.map((entry, i) => (
                    <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      
                      {/* Thumbnail */}
                      <div className="w-16 h-16 sm:w-14 sm:h-14 rounded-lg shrink-0 overflow-hidden bg-muted flex items-center justify-center border border-border/50 relative">
                        {entry.challenges?.banner_url ? (
                          <img src={entry.challenges.banner_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Trophy className="w-5 h-5 text-muted-foreground/40" />
                        )}
                        {/* Overlay if rejected */}
                        {entry.status === 'rejected' && <div className="absolute inset-0 bg-black/40 grayscale" />}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold text-sm truncate ${entry.status === 'rejected' ? 'text-muted-foreground line-through decoration-muted-foreground/50' : 'text-foreground'}`}>
                            {entry.challenges?.title || "Unknown Challenge"}
                          </h4>
                          {getStatusBadge(entry.status)}
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {entry.views || 0}</span>
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {entry.likes || 0}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 mt-2 sm:mt-0 border-t sm:border-0 border-border/40">
                        {entry.video_url && (
                          <Button variant="secondary" size="sm" className="h-8 text-xs shrink-0" asChild>
                            <a href={entry.video_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3 h-3 mr-1.5" /> View Video
                            </a>
                          </Button>
                        )}
                      </div>

                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          )
        )}
      </motion.div>

      {/* --- FAN POPUP NOTIFICATION MODAL --- */}
      <Dialog open={!!currentNotification} onOpenChange={handleAcknowledgeNotification}>
        <DialogContent className={`sm:max-w-md border-2 ${currentNotification?.status === 'winner' ? 'border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-background' : 'border-red-500/20'}`}>
          <DialogHeader className="flex flex-col items-center text-center pt-4">
            {currentNotification?.status === 'winner' ? (
              <>
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mb-2">
                  <PartyPopper className="w-8 h-8 text-yellow-600" />
                </div>
                <DialogTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">Congratulations!</DialogTitle>
                <DialogDescription className="text-base mt-2 text-foreground">
                  You are the grand winner of the <strong>{currentNotification?.challenges?.title}</strong> challenge! Message support on whatsapp 08146686952 to claim your price 
                </DialogDescription>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
                <DialogTitle className="text-xl font-bold">Challenge Update</DialogTitle>
                <DialogDescription className="text-base mt-2">
                  Unfortunately, your entry for <strong>{currentNotification?.challenges?.title}</strong> was not selected this time. Keep creating and try again!
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          <DialogFooter className="sm:justify-center mt-6 pb-2">
            <Button 
              onClick={handleAcknowledgeNotification}
              className={`w-full sm:w-auto min-w-[120px] ${currentNotification?.status === 'winner' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}
            >
              {currentNotification?.status === 'winner' ? 'Claim Victory' : 'Got it'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* --- CREATOR EDIT CHALLENGE DIALOG --- */}
      <Dialog open={!!editingChallenge} onOpenChange={(open) => !open && setEditingChallenge(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl flex items-center gap-2"><Edit className="w-5 h-5 text-primary"/> Edit Challenge</DialogTitle>
            <DialogDescription>Make changes to your challenge or completely remove it.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">Challenge Title *</Label><Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} required /></div>
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">Banner Image</Label><div className="h-32 rounded-lg overflow-hidden border border-border/50"><ImageUpload value={form.banner_url} onChange={(url) => updateForm("banner_url", url)} folder="challenge-banners" /></div></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">Song Title</Label><Input value={form.song_title} onChange={(e) => updateForm("song_title", e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">Grand Prize</Label><Input value={form.prize} onChange={(e) => updateForm("prize", e.target.value)} placeholder="e.g. $500 Cash" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">Start Date</Label><Input type="datetime-local" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} /></div>
                <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">End Date</Label><Input type="datetime-local" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">Description</Label><Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} rows={3} className="resize-none" /></div>
              <div className="space-y-1.5"><Label className="text-xs uppercase text-muted-foreground font-semibold">Rules</Label><Textarea value={form.rules} onChange={(e) => updateForm("rules", e.target.value)} rows={2} className="resize-none" /></div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4 border-t border-border/50">
              <Button type="button" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={handleDelete} disabled={deleting || saving}>
                <Trash2 className="w-4 h-4 mr-2" /> {deleting ? "Deleting..." : "Delete Challenge"}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setEditingChallenge(null)} disabled={saving}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}</Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default MyChallenges;