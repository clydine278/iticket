import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { toast } from "sonner";

const ProfileSettings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user!.id)
      .single();
    setProfile(data);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profile.full_name,
        username: profile.username,
        phone: profile.phone,
        city: profile.city,
        country: profile.country,
        bio: profile.bio,
        stage_name: profile.stage_name,
      })
      .eq("id", user!.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  };

  const update = (field: string, value: string) =>
    setProfile((p: any) => ({ ...p, [field]: value }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="font-display text-xl font-bold mb-4">Profile Settings</h1>
        <Card className="border-border/40">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{profile?.full_name || "—"}</p>
                <p className="text-[10px] text-muted-foreground capitalize">{profile?.account_type} Account</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                <Input value={profile?.full_name || ""} onChange={(e) => update("full_name", e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Username</label>
                <Input value={profile?.username || ""} onChange={(e) => update("username", e.target.value)} className="h-9 text-sm" />
              </div>
              {profile?.account_type === "artist" && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Stage Name</label>
                  <Input value={profile?.stage_name || ""} onChange={(e) => update("stage_name", e.target.value)} className="h-9 text-sm" />
                </div>
              )}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <Input value={profile?.phone || ""} onChange={(e) => update("phone", e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">City</label>
                <Input value={profile?.city || ""} onChange={(e) => update("city", e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Country</label>
                <Input value={profile?.country || ""} onChange={(e) => update("country", e.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Bio</label>
              <Textarea value={profile?.bio || ""} onChange={(e) => update("bio", e.target.value)} className="text-sm min-h-[80px]" />
            </div>

            <Button onClick={handleSave} disabled={saving} className="rounded-full text-xs px-6">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
