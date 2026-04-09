import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Trophy, Trash2, Save, Plus, Image as ImageIcon, Music, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";
import { format } from "date-fns";

const CreateChallenge = () => {
  const { id } = useParams(); // If there's an ID, we are in Edit Mode
  const isEditing = !!id;
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    rules: "",
    prize: "",
    song_title: "",
    song_url: "",
    banner_url: "",
    start_date: "",
    end_date: "",
  });

  // Fetch existing challenge data if in Edit Mode
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!id || !user) return;
      try {
        const { data, error } = await supabase
          .from("challenges")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        // Security check: Only the creator can edit
        if (data.creator_id !== user.id) {
          toast({ title: "Unauthorized", description: "You cannot edit this challenge.", variant: "destructive" });
          navigate("/dashboard/challenges");
          return;
        }

        // Format dates for the datetime-local input
        const formatForInput = (isoString: string) => isoString ? new Date(isoString).toISOString().slice(0, 16) : "";

        setForm({
          title: data.title || "",
          description: data.description || "",
          rules: data.rules || "",
          prize: data.prize || "",
          song_title: data.song_title || "",
          song_url: data.song_url || "",
          banner_url: data.banner_url || "",
          start_date: formatForInput(data.start_date),
          end_date: formatForInput(data.end_date),
        });
      } catch (err: any) {
        toast({ title: "Error loading challenge", description: err.message, variant: "destructive" });
      } finally {
        setFetching(false);
      }
    };

    fetchChallenge();
  }, [id, user, navigate]);

  const updateForm = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      rules: form.rules || null,
      prize: form.prize || null,
      song_title: form.song_title || null,
      song_url: form.song_url || null,
      banner_url: form.banner_url || null,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      creator_id: user.id,
      status: "active",
    };

    try {
      if (isEditing) {
        const { error } = await supabase.from("challenges").update(payload).eq("id", id);
        if (error) throw error;
        toast({ title: "Challenge Updated!", description: "Your changes have been saved." });
      } else {
        const { error } = await supabase.from("challenges").insert(payload);
        if (error) throw error;
        toast({ title: "Challenge Created!", description: "Your challenge is now live." });
      }
      navigate("/dashboard/challenges");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to completely delete this challenge? This cannot be undone.")) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase.from("challenges").delete().eq("id", id);
      if (error) throw error;
      
      toast({ title: "Challenge Deleted", description: "The challenge has been removed." });
      navigate("/dashboard/challenges");
    } catch (err: any) {
      toast({ title: "Error deleting", description: err.message, variant: "destructive" });
      setDeleting(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6 pb-12">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 tracking-tight">
              <Trophy className="w-7 h-7 text-primary" /> 
              {isEditing ? "Edit Challenge" : "Create Challenge"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isEditing ? "Update your challenge details or delete it entirely." : "Launch a new music challenge for fans to participate in."}
            </p>
          </div>
          
          {isEditing && (
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting} className="shrink-0">
              <Trash2 className="w-4 h-4 mr-2" />
              {deleting ? "Deleting..." : "Delete Challenge"}
            </Button>
          )}
        </div>

        {/* Modern Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: Form Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            
            {/* General Info */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">General Information</CardTitle>
                <CardDescription>The core details of your challenge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Challenge Title *</Label>
                  <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="e.g. The Summer Dance-Off" className="text-lg font-medium" required />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Description</Label>
                  <Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="What is the goal of this challenge?" rows={3} className="resize-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Rules</Label>
                  <Textarea value={form.rules} onChange={(e) => updateForm("rules", e.target.value)} placeholder="1. Must use the official sound&#10;2. Must tag #SummerDanceOff" rows={3} className="resize-none" />
                </div>
              </CardContent>
            </Card>

            {/* Media & Rewards */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Media & Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Banner Image</Label>
                  <ImageUpload
                    value={form.banner_url}
                    onChange={(url) => updateForm("banner_url", url)}
                    folder="challenge-banners"
                    placeholder="Upload a high-quality cover image"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Song Title</Label>
                    <Input value={form.song_title} onChange={(e) => updateForm("song_title", e.target.value)} placeholder="e.g. Track Name ft. Artist" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Song URL</Label>
                    <Input value={form.song_url} onChange={(e) => updateForm("song_url", e.target.value)} placeholder="Spotify, Apple Music, or Audio URL" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Grand Prize</Label>
                  <Input value={form.prize} onChange={(e) => updateForm("prize", e.target.value)} placeholder="e.g. $500 Cash + VIP Tickets" className=" border-emerald-500/20   font-medium " />
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Start Date</Label>
                    <Input type="datetime-local" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">End Date</Label>
                    <Input type="datetime-local" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full h-12 text-lg shadow-md" disabled={loading}>
              {loading ? (
                <div className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</div>
              ) : isEditing ? (
                <><Save className="w-5 h-5 mr-2" /> Save Changes</>
              ) : (
                <><Plus className="w-5 h-5 mr-2" /> Launch Challenge</>
              )}
            </Button>
          </form>

          {/* RIGHT: Live Preview Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-2">
                Live Preview
              </Label>
              
              <Card className="overflow-hidden border-border/50 shadow-xl transition-all">
                {/* Image Area */}
                <div className="relative w-full h-48 bg-muted flex items-center justify-center overflow-hidden">
                  {form.banner_url ? (
                    <img src={form.banner_url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-muted-foreground/50 flex flex-col items-center gap-2">
                      <ImageIcon className="w-10 h-10" />
                      <span className="text-xs font-medium">No Cover Image</span>
                    </div>
                  )}
                  {form.prize && (
                    <Badge className="absolute top-3 right-3 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold border-none shadow-md">
                      Prize: {form.prize}
                    </Badge>
                  )}
                </div>

                {/* Content Area */}
                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-xl line-clamp-2 leading-tight">
                      {form.title || "Your Challenge Title"}
                    </h3>
                    {form.song_title && (
                      <p className="text-sm text-primary flex items-center gap-1.5 mt-2 font-medium">
                        <Music className="w-3.5 h-3.5" /> {form.song_title}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {form.description || "The description of your challenge will appear here. Make it exciting!"}
                  </p>

                  <div className="pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {form.start_date ? format(new Date(form.start_date), "MMM d") : "TBD"} 
                    {" - "} 
                    {form.end_date ? format(new Date(form.end_date), "MMM d, yyyy") : "TBD"}
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-700 dark:text-blue-400">
                <p className="font-semibold mb-1">Tip for Creators:</p>
                <p className="text-xs opacity-90">High-quality cover images and clear rules drastically increase fan participation.</p>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateChallenge;