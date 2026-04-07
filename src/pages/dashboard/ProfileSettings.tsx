import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Globe, Music, Briefcase, Save, Sparkles, Facebook, Instagram, Twitter, Video, ChevronDown, ChevronUp, Check, Camera } from "lucide-react";
import { countries } from "@/lib/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useR2Upload } from "@/hooks/use-r2-upload";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.51a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.08z"/>
  </svg>
);

const ProfileSettings = () => {
  const { user } = useAuth();
  const { upload: uploadAvatar, uploading: avatarUploading, progress: avatarProgress } = useR2Upload();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSocials, setExpandedSocials] = useState<Record<string, boolean>>({});
  const [expandedVideos, setExpandedVideos] = useState<Record<string, boolean>>({});

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
    const updates: TablesUpdate<"profiles"> = {
      full_name: profile.full_name || null,
      username: profile.username || null,
      phone: profile.phone || null,
      city: profile.city || null,
      country: profile.country || null,
      bio: profile.bio || null,
      booking_price: profile.booking_price || null,
      social_links: profile.social_links || {},
      video_urls: profile.video_urls || [],
      avatar_url: profile.avatar_url || null,
      artist_category: profile.artist_category || null,
      stage_name: profile.account_type === "artist" ? profile.stage_name || null : undefined,
      services: profile.account_type === "artist" || profile.account_type === "organizer"
        ? (profile.services?.length ? profile.services : null)
        : undefined,
    };
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

  const updateSocial = (platform: string, value: string) =>
    setProfile((p: any) => ({
      ...p,
      social_links: { ...(p.social_links || {}), [platform]: value },
    }));

  const updateVideo = (index: number, value: string) =>
    setProfile((p: any) => {
      const urls = [...(p.video_urls || ["", "", ""])];
      urls[index] = value;
      return { ...p, video_urls: urls };
    });

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadAvatar(file, { folder: "avatars", maxSizeMB: 5, acceptedTypes: ["image/"] });
      if (url) update("avatar_url", url);
    } catch (err: any) {
      toast.error(err.message);
    }

    e.target.value = "";
  };

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
  const socialLinks = profile?.social_links || {};
  const videoUrls = profile?.video_urls || [];

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Profile Settings</h1>

        {/* Profile Header Card */}
        <Card className="border-border/40 overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />
          <CardContent className="p-5 -mt-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="relative pb-4">
                {profile?.avatar_url ? (
                  <div className="h-20 w-20 rounded-full ring-4 ring-background shadow-lg overflow-hidden relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-background text-xs">Change</div>
                  </div>
                ) : (
                  <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                )}
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
                <button
                  type="button"
                  disabled={avatarUploading}
                  onClick={() => document.getElementById('avatar-upload')?.click()}
                  className="absolute -bottom-1 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[10px] font-medium text-foreground shadow-sm transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
                >
                  <Camera className="w-3 h-3 text-primary" />
                  {avatarUploading ? "Uploading..." : profile?.avatar_url ? "Change photo" : "Add a photo"}
                </button>
                {avatarUploading && (
                  <div className="mt-6 w-28 space-y-1">
                    <Progress value={avatarProgress} className="h-1.5" />
                    <span className="block text-center text-[10px] text-muted-foreground">{avatarProgress}% uploading...</span>
                  </div>
                )}
              </div>
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
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" /> Country
                </label>
                <Select value={profile?.country || ""} onValueChange={(v) => update("country", v)}>
                  <SelectTrigger className="h-10 text-sm">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {countries.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artist-specific fields */}
        {accountType === "artist" && (
          <>
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
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Artist Category
                  </label>
                  <Select value={profile?.artist_category || ""} onValueChange={(v) => update("artist_category", v)}>
                    <SelectTrigger className="h-10 text-sm">
                      <SelectValue placeholder="Select your category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {["Singer", "Rapper", "Drummer", "Keyboardist", "Guitarist", "Bassist", "DJ", "Producer", "Dancer", "Comedian", "Model", "MC/Host", "Saxophonist", "Trumpeter", "Violinist", "Spoken Word", "Poet", "Other"].map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            {/* Social Links */}
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" /> Social Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { key: "facebook", label: "Facebook", icon: <Facebook className="w-4 h-4" />, placeholder: "https://facebook.com/yourpage" },
                  { key: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, placeholder: "https://instagram.com/yourhandle" },
                  { key: "tiktok", label: "TikTok", icon: <TikTokIcon />, placeholder: "https://tiktok.com/@yourhandle" },
                  { key: "twitter", label: "Twitter", icon: <Twitter className="w-4 h-4" />, placeholder: "https://twitter.com/yourhandle" },
                ].map((social) => (
                  <div key={social.key}>
                    <button
                      type="button"
                      onClick={() => setExpandedSocials(prev => ({ ...prev, [social.key]: !prev[social.key] }))}
                      className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-xs transition-all ${
                        expandedSocials[social.key] ? "border-primary/50 bg-accent/30" : "border-border/50 hover:border-primary/30"
                      }`}
                    >
                      <span className="text-primary">{social.icon}</span>
                      <span className="flex-1 text-left">{social.label}</span>
                      {socialLinks[social.key] && <Check className="w-3 h-3 text-primary" />}
                      {expandedSocials[social.key] ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                    </button>
                    <AnimatePresence>
                      {expandedSocials[social.key] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <Input
                            value={socialLinks[social.key] || ""}
                            onChange={(e) => updateSocial(social.key, e.target.value)}
                            placeholder={social.placeholder}
                            className="h-9 text-xs mt-1.5 border-border/50"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Video URLs */}
            <Card className="border-border/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-display flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" /> Performance Videos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <button
                      type="button"
                      onClick={() => setExpandedVideos(prev => ({ ...prev, [i]: !prev[i] }))}
                      className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-xs transition-all ${
                        expandedVideos[i] ? "border-primary/50 bg-accent/30" : "border-border/50 hover:border-primary/30"
                      }`}
                    >
                      <Video className="w-4 h-4 text-primary" />
                      <span className="flex-1 text-left">Video {i + 1}</span>
                      {videoUrls[i] && <Check className="w-3 h-3 text-primary" />}
                      {expandedVideos[i] ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
                    </button>
                    <AnimatePresence>
                      {expandedVideos[i] && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <Input
                            value={videoUrls[i] || ""}
                            onChange={(e) => updateVideo(i, e.target.value)}
                            placeholder="https://youtube.com/watch?v=... or TikTok/Instagram link"
                            className="h-9 text-xs mt-1.5 border-border/50"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
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
