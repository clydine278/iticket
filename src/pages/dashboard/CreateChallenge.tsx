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
import { toast } from "@/hooks/use-toast";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

const CreateChallenge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const updateForm = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase.from("challenges").insert({
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
      });

      if (error) throw error;
      toast({ title: "Challenge created!", description: "Your challenge is now live." });
      navigate("/dashboard/challenges");
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
            <Trophy className="w-6 h-6 text-primary" /> Create Challenge
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Launch a new music challenge for fans to participate in.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Challenge Details</CardTitle>
              <CardDescription>Tell fans what this challenge is about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Challenge Title *</Label>
                <Input value={form.title} onChange={(e) => updateForm("title", e.target.value)} placeholder="e.g. Dance to My New Track" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => updateForm("description", e.target.value)} placeholder="What should participants do?" rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Rules</Label>
                <Textarea value={form.rules} onChange={(e) => updateForm("rules", e.target.value)} placeholder="Challenge rules and guidelines..." rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Prize</Label>
                <Input value={form.prize} onChange={(e) => updateForm("prize", e.target.value)} placeholder="e.g. $500 cash prize" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Song & Media</CardTitle>
              <CardDescription>Add the track for this challenge</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Song Title</Label>
                  <Input value={form.song_title} onChange={(e) => updateForm("song_title", e.target.value)} placeholder="Track name" />
                </div>
                <div className="space-y-2">
                  <Label>Song URL</Label>
                  <Input value={form.song_url} onChange={(e) => updateForm("song_url", e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <Input value={form.banner_url} onChange={(e) => updateForm("banner_url", e.target.value)} placeholder="https://..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="datetime-local" value={form.start_date} onChange={(e) => updateForm("start_date", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="datetime-local" value={form.end_date} onChange={(e) => updateForm("end_date", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Launch Challenge"}
          </Button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateChallenge;
