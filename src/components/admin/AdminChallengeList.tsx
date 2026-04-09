import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Trophy, Plus, Loader2, Edit2, Trash2, Eye, EyeOff,
  Music, DollarSign, Calendar
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Challenge {
  id: string;
  title: string;
  description: string;
  banner_url: string | null;
  song_title: string | null;
  entry_fee: number;
  status: "active" | "inactive" | "completed";
  created_at: string;
  end_date: string | null;
}

export const AdminChallengeList = ({ onRefresh }: { onRefresh: () => void }) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    song_title: "",
    entry_fee: 0,
    banner_url: "",
    end_date: "",
    status: "active" as const
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    const { data } = await supabase
      .from("challenges")
      .select("*")
      .order("created_at", { ascending: false });
    setChallenges(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const payload = {
        ...formData,
        entry_fee: Number(formData.entry_fee) || 0
      };

      if (editingChallenge) {
        const { error } = await supabase
          .from("challenges")
          .update(payload)
          .eq("id", editingChallenge.id);
        if (error) throw error;
        toast({ title: "Challenge updated successfully" });
      } else {
        const { error } = await supabase.from("challenges").insert(payload);
        if (error) throw error;
        toast({ title: "Challenge created successfully" });
      }
      
      setFormData({
        title: "",
        description: "",
        song_title: "",
        entry_fee: 0,
        banner_url: "",
        end_date: "",
        status: "active"
      });
      setEditingChallenge(null);
      fetchChallenges();
      onRefresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all entries too.")) return;
    
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Challenge deleted" });
      fetchChallenges();
    }
  };

  const toggleStatus = async (challenge: Challenge) => {
    const newStatus = challenge.status === "active" ? "inactive" : "active";
    const { error } = await supabase
      .from("challenges")
      .update({ status: newStatus })
      .eq("id", challenge.id);
      
    if (!error) {
      toast({ title: `Challenge ${newStatus === "active" ? "activated" : "deactivated"}` });
      fetchChallenges();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Challenge Management</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingChallenge ? "Edit Challenge" : "Create New Challenge"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Afrobeats Dance Challenge 2024"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea 
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe the challenge rules and requirements..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Song Title
                  </Label>
                  <Input 
                    value={formData.song_title}
                    onChange={e => setFormData({...formData, song_title: e.target.value})}
                    placeholder="e.g., Calm Down - Rema"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Entry Fee (₦)
                  </Label>
                  <Input 
                    type="number"
                    min="0"
                    value={formData.entry_fee}
                    onChange={e => setFormData({...formData, entry_fee: Number(e.target.value)})}
                    placeholder="0 for free"
                  />
                  <p className="text-xs text-muted-foreground">Set 0 for free entry</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Banner Image URL</Label>
                <Input 
                  value={formData.banner_url}
                  onChange={e => setFormData({...formData, banner_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End Date
                </Label>
                <Input 
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingChallenge ? "Update Challenge" : "Create Challenge"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {challenges.map((challenge) => (
          <Card key={challenge.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4 flex-1">
                  <div className="w-24 h-24 rounded-lg bg-muted overflow-hidden shrink-0">
                    {challenge.banner_url ? (
                      <img src={challenge.banner_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{challenge.title}</h3>
                      <Badge variant={challenge.status === "active" ? "default" : "secondary"}>
                        {challenge.status}
                      </Badge>
                      {!challenge.entry_fee ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">FREE</Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          ₦{challenge.entry_fee}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {challenge.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {challenge.song_title || "No song specified"}
                      </span>
                      <span>Created {new Date(challenge.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleStatus(challenge)}
                  >
                    {challenge.status === "active" ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setEditingChallenge(challenge);
                      setFormData({
                        title: challenge.title,
                        description: challenge.description || "",
                        song_title: challenge.song_title || "",
                        entry_fee: challenge.entry_fee || 0,
                        banner_url: challenge.banner_url || "",
                        end_date: challenge.end_date || "",
                        status: challenge.status
                      });
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(challenge.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};