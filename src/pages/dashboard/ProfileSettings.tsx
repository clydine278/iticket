import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Phone, MapPin, Globe, Music, Briefcase, Save, Sparkles } from "lucide-react";
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
    const updates: Record<string, any> = {
      full_name: profile.full_name,
      username: profile.username,
      phone: profile.phone,
      city: profile.city,
      country: profile.country,
      bio: profile.bio,
      booking_price: profile.booking_price,
    };
    if (profile.account_type === "artist") {
      updates.stage_name = profile.stage_name;
      updates.services = profile.services;
    }
    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user!.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile updated!");
  };

  const update = (field: string, value: any) =>
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

  const accountType = profile?.account_type || "personal";
  const initials = (profile?.full_name || profile?.username || "U").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Profile Settings</h1>

        {/* Profile Header Card */}
        <Card className="border-border/40 overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />
          <CardContent className="p-5 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{profile?.full_name || "—"}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {accountType === "artist" && <Sparkles className="w-3 h-3 mr-1" />}
                    {accountType === "organizer" && <Briefcase className="w-3 h-3 mr-1" />}
                    {accountType === "personal" && <User className="w-3 h-3 mr-1" />}
                    {accountType}
                  </Badge>
                  {profile?.email && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {profile.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" icon={<User className="w-3.5 h-3.5" />} value={profile?.full_name || ""} onChange={(v) => update("full_name", v)} />
              <Field label="Username" icon={<User className="w-3.5 h-3.5" />} value={profile?.username || ""} onChange={(v) => update("username", v)} />
              <Field label="Email" icon={<Mail className="w-3.5 h-3.5" />} value={profile?.email || ""} disabled />
              <Field label="Phone" icon={<Phone className="w-3.5 h-3.5" />} value={profile?.phone || ""} onChange={(v) => update("phone", v)} placeholder="+234..." />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="City" icon={<MapPin className="w-3.5 h-3.5" />} value={profile?.city || ""} onChange={(v) => update("city", v)} placeholder="Lagos" />
              <Field label="Country" icon={<Globe className="w-3.5 h-3.5" />} value={profile?.country || ""} onChange={(v) => update("country", v)} placeholder="Nigeria" />
            </div>
          </CardContent>
        </Card>

        {/* Artist-specific fields */}
        {accountType === "artist" && (
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Music className="w-4 h-4 text-primary" /> Artist Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Stage Name" icon={<Sparkles className="w-3.5 h-3.5" />} value={profile?.stage_name || ""} onChange={(v) => update("stage_name", v)} placeholder="Your stage name" />
                <Field label="Booking Price" icon={<Music className="w-3.5 h-3.5" />} value={profile?.booking_price || ""} onChange={(v) => update("booking_price", v)} placeholder="e.g. ₦500,000" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Services (comma-separated)</label>
                <Input
                  value={(profile?.services || []).join(", ")}
                  onChange={(e) => update("services", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  className="h-10 text-sm"
                  placeholder="Live Performance, DJ Set, MC"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Organizer-specific fields */}
        {accountType === "organizer" && (
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" /> Organizer Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Services (comma-separated)</label>
                <Input
                  value={(profile?.services || []).join(", ")}
                  onChange={(e) => update("services", e.target.value.split(",").map((s: string) => s.trim()).filter(Boolean))}
                  className="h-10 text-sm"
                  placeholder="Concerts, Weddings, Corporate Events"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bio */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-display">About</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={profile?.bio || ""}
              onChange={(e) => update("bio", e.target.value)}
              className="text-sm min-h-[100px]"
              placeholder="Tell us about yourself..."
            />
          </CardContent>
        </Card>

        <div className="flex justify-end pb-8">
          <Button onClick={handleSave} disabled={saving} className="rounded-xl gap-2 px-6">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

function Field({ label, icon, value, onChange, disabled, placeholder }: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
        {icon} {label}
      </label>
      <Input
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        disabled={disabled}
        className="h-10 text-sm"
        placeholder={placeholder}
      />
    </div>
  );
}

export default ProfileSettings;
