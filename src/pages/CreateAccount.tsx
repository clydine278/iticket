import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { User, Users, Briefcase, Check, Eye, EyeOff, Video, Facebook, Instagram, Twitter, ChevronDown, ChevronUp, ImageIcon, Loader2, X } from "lucide-react";
import { countries } from "@/lib/countries";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useR2Upload } from "@/hooks/use-r2-upload";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import concertImg from "@/assets/concert-crowd.jpg";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.51a8.27 8.27 0 0 0 4.76 1.5v-3.4a4.85 4.85 0 0 1-1-.08z"/>
  </svg>
);

const accountTypes = [
  { id: "personal", icon: User, title: "Personal / Individual", desc: "Get a personal account, ticket discounts and credits" },
  { id: "artist", icon: Users, title: "Artist", desc: "Register as an artist, so we help show off you for booking." },
  { id: "organizer", icon: Briefcase, title: "Organizer's Account", desc: "Get a personal account, ticket discounts and credits" },
];

const artistCategories = [
  "Singer", "Rapper", "Drummer", "Keyboardist", "Guitarist", "Bassist",
  "DJ", "Producer", "Dancer", "Comedian", "Model", "MC/Host",
  "Saxophonist", "Trumpeter", "Violinist", "Spoken Word", "Poet", "Other",
];

const steps = ["Account type", "About you", "Email Confirmation"];

const socialPlatforms = ["Facebook", "Instagram", "Tiktok", "Twitter"];
const serviceTypes = ["Live Performance", "Hosting/MC", "Meet & Greet", "Brand Promotion"];

const fadeSlide = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.3 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.05 } },
};

const itemFade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const CreateAccount = () => {
  const navigate = useNavigate();
  const { upload: uploadAvatarFile } = useR2Upload();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState("personal");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(["Live Performance"]);
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "", username: "", email: "", phone: "",
    country: "", city: "", dob: "", password: "", password2: "",
    fullName: "", stageName: "", aboutYou: "", artistCategory: "",
    socialFacebook: "", socialInstagram: "", socialTiktok: "", socialTwitter: "",
    videoUrl1: "", videoUrl2: "", videoUrl3: "",
    avatarUrl: "",
  });
  const [expandedSocials, setExpandedSocials] = useState<Record<string, boolean>>({});
  const [expandedVideos, setExpandedVideos] = useState<Record<string, boolean>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Profile photos must be 5MB or less.");
      e.target.value = "";
      return;
    }

    setAvatarUploading(true);
    setAvatarProgress(10);

    try {
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onprogress = (event) => {
          if (!event.lengthComputable || event.total <= 0) return;
          const nextProgress = Math.min(95, Math.max(10, Math.round((event.loaded / event.total) * 100)));
          setAvatarProgress(nextProgress);
        };

        reader.onerror = () => reject(new Error("Unable to read the selected photo."));
        reader.onload = () => resolve(String(reader.result || ""));
        reader.readAsDataURL(file);
      });

      setAvatarFile(file);
      updateField("avatarUrl", previewUrl);
      setAvatarProgress(100);
    } catch (error: any) {
      toast.error(error.message || "Unable to prepare the selected photo.");
    } finally {
      setAvatarUploading(false);
      window.setTimeout(() => setAvatarProgress(0), 400);
      e.target.value = "";
    }
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarProgress(0);
    updateField("avatarUrl", "");
  };

  const handleSignUp = async () => {
    if (formData.password !== formData.password2) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.email || !formData.password) {
      toast.error("Email and password are required");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          account_type: selectedType,
          full_name: formData.fullName || formData.firstName,
          username: formData.username,
          stage_name: formData.stageName,
          phone: formData.phone,
          city: formData.city,
          country: formData.country,
        },
      },
    });
    if (error) {
      setLoading(false);
      toast.error(error.message);
    } else {
      const socialLinks: Record<string, string> = {};
      if (formData.socialFacebook) socialLinks.facebook = formData.socialFacebook;
      if (formData.socialInstagram) socialLinks.instagram = formData.socialInstagram;
      if (formData.socialTiktok) socialLinks.tiktok = formData.socialTiktok;
      if (formData.socialTwitter) socialLinks.twitter = formData.socialTwitter;

      const videoUrls = [formData.videoUrl1, formData.videoUrl2, formData.videoUrl3].filter(Boolean);

      let uploadedAvatarUrl: string | null = null;
      if (avatarFile && data.session) {
        try {
          uploadedAvatarUrl = await uploadAvatarFile(avatarFile, {
            folder: "avatars",
            maxSizeMB: 5,
            acceptedTypes: ["image/"],
          });
        } catch {
          uploadedAvatarUrl = null;
        }
      }

      const newUser = data.user;
      if (newUser) {
        await supabase.from("profiles").update({
          social_links: socialLinks,
          video_urls: videoUrls,
          avatar_url: uploadedAvatarUrl,
          full_name: formData.fullName || formData.firstName || null,
          artist_category: selectedType === "artist" ? formData.artistCategory || null : null,
        } as any).eq("id", newUser.id);
      }
      setLoading(false);
      toast.success(
        avatarFile && !uploadedAvatarUrl
          ? "Account created! Add your photo from Profile Settings after you sign in."
          : "Account created successfully!"
      );
      navigate("/dashboard");
    }
  };

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const renderPhotoPicker = () => (
    <motion.div variants={itemFade} className="space-y-2">
      <label className="text-xs text-muted-foreground mb-1 block">Profile Photo</label>
      <input id="account-avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarSelection} />

      {formData.avatarUrl ? (
        <div className="w-[140px] space-y-2">
          <div className="relative overflow-hidden rounded-full border border-border bg-muted/30" style={{ aspectRatio: "1 / 1" }}>
            <img src={formData.avatarUrl} alt="Selected profile preview" className="h-full w-full object-cover" />
            {avatarUploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-foreground/60 px-4">
                <Loader2 className="h-7 w-7 animate-spin text-background" />
                <div className="w-full max-w-[100px] space-y-1">
                  <Progress value={avatarProgress} className="h-2" />
                  <span className="block text-center text-[10px] text-background">{avatarProgress}% processing...</span>
                </div>
              </div>
            )}
          </div>

          {!avatarUploading && (
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="secondary" className="flex-1" onClick={() => document.getElementById("account-avatar-upload")?.click()}>
                Change
              </Button>
              <Button type="button" size="icon" variant="destructive" onClick={clearAvatar}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => document.getElementById("account-avatar-upload")?.click()}
          disabled={avatarUploading}
          className="flex w-[140px] flex-col items-center justify-center gap-2 rounded-full border-2 border-dashed border-border bg-muted/30 px-4 py-6 text-muted-foreground transition-colors hover:bg-muted/50"
          style={{ aspectRatio: "1 / 1" }}
        >
          {avatarUploading ? (
            <div className="flex w-full flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <div className="w-full space-y-1">
                <Progress value={avatarProgress} className="h-2" />
                <span className="block text-center text-[10px]">{avatarProgress}% processing...</span>
              </div>
            </div>
          ) : (
            <>
              <ImageIcon className="h-7 w-7" />
              <span className="text-xs font-medium">Add a photo</span>
            </>
          )}
        </button>
      )}
    </motion.div>
  );

  const renderPersonalForm = () => (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
      {renderPhotoPicker()}
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">First name</label>
          <Input placeholder="First name" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Username</label>
          <Input placeholder="Username" value={formData.username} onChange={(e) => updateField("username", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>
      <motion.div variants={itemFade}>
        <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
        <Input placeholder="Email Address" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="h-10 text-sm border-border/50" />
      </motion.div>
      <motion.div variants={itemFade}>
        <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
        <Input placeholder="Phone Number" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-10 text-sm border-border/50" />
      </motion.div>
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Country</label>
          <Select value={formData.country} onValueChange={(v) => updateField("country", v)}>
            <SelectTrigger className="h-10 text-sm border-border/50">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">City</label>
          <Input placeholder="City" value={formData.city} onChange={(e) => updateField("city", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>
      <motion.div variants={itemFade}>
        <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
        <Input type="date" value={formData.dob} onChange={(e) => updateField("dob", e.target.value)} className="h-10 text-sm border-border/50" />
      </motion.div>
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Password</label>
          <Input placeholder="Password" type={showPw ? "text" : "password"} value={formData.password} onChange={(e) => updateField("password", e.target.value)} className="h-10 text-sm pr-9 border-border/50" />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Retype Password</label>
          <Input placeholder="Retype Password" type={showPw2 ? "text" : "password"} value={formData.password2} onChange={(e) => updateField("password2", e.target.value)} className="h-10 text-sm pr-9 border-border/50" />
          <button onClick={() => setShowPw2(!showPw2)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
            {showPw2 ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderArtistForm = () => (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
      {/* Header with account type badge and photo */}
      <motion.div variants={itemFade} className="mb-2">
        <span className="text-xs underline text-foreground">Artist Account</span>
      </motion.div>
      {renderPhotoPicker()}

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
          <Input placeholder="Full Name" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Stage Name</label>
          <Input placeholder="Stage Name" value={formData.stageName} onChange={(e) => updateField("stageName", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Username</label>
          <Input placeholder="Username" value={formData.username} onChange={(e) => updateField("username", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>

      <motion.div variants={itemFade}>
        <label className="text-xs text-muted-foreground mb-1 block">Artist Category</label>
        <Select value={formData.artistCategory} onValueChange={(v) => updateField("artistCategory", v)}>
          <SelectTrigger className="h-10 text-sm border-border/50">
            <SelectValue placeholder="Select your category" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {artistCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
          <Input placeholder="Email Address" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
          <Input placeholder="Phone Number" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">City</label>
          <Input placeholder="City" value={formData.city} onChange={(e) => updateField("city", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>

      {/* Connect Socials */}
      <motion.div variants={itemFade}>
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Connect Socials</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="space-y-2">
          {[
            { key: "socialFacebook", label: "Facebook", icon: <Facebook className="w-4 h-4" />, placeholder: "https://facebook.com/yourpage" },
            { key: "socialInstagram", label: "Instagram", icon: <Instagram className="w-4 h-4" />, placeholder: "https://instagram.com/yourhandle" },
            { key: "socialTiktok", label: "TikTok", icon: <TikTokIcon />, placeholder: "https://tiktok.com/@yourhandle" },
            { key: "socialTwitter", label: "Twitter", icon: <Twitter className="w-4 h-4" />, placeholder: "https://twitter.com/yourhandle" },
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
                {formData[social.key as keyof typeof formData] && <Check className="w-3 h-3 text-green-500" />}
                {expandedSocials[social.key] ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {expandedSocials[social.key] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <Input
                      value={formData[social.key as keyof typeof formData]}
                      onChange={(e) => updateField(social.key, e.target.value)}
                      placeholder={social.placeholder}
                      className="h-9 text-xs mt-1.5 border-border/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Add Video URLs */}
      <motion.div variants={itemFade}>
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Performance Videos</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="space-y-2">
          {[
            { key: "videoUrl1", label: "Video 1" },
            { key: "videoUrl2", label: "Video 2" },
            { key: "videoUrl3", label: "Video 3" },
          ].map((vid) => (
            <div key={vid.key}>
              <button
                type="button"
                onClick={() => setExpandedVideos(prev => ({ ...prev, [vid.key]: !prev[vid.key] }))}
                className={`w-full flex items-center gap-2 border rounded-lg px-3 py-2 text-xs transition-all ${
                  expandedVideos[vid.key] ? "border-primary/50 bg-accent/30" : "border-border/50 hover:border-primary/30"
                }`}
              >
                <Video className="w-4 h-4 text-primary" />
                <span className="flex-1 text-left">{vid.label}</span>
                {formData[vid.key as keyof typeof formData] && <Check className="w-3 h-3 text-green-500" />}
                {expandedVideos[vid.key] ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {expandedVideos[vid.key] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <Input
                      value={formData[vid.key as keyof typeof formData]}
                      onChange={(e) => updateField(vid.key, e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or TikTok/Instagram link"
                      className="h-9 text-xs mt-1.5 border-border/50"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Booking Price & Services */}
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Booking Price</label>
          <select className="w-full h-10 text-sm border border-border/50 rounded-md bg-background px-3">
            <option>Select range</option>
            <option>₦50,000 - ₦200,000</option>
            <option>₦200,000 - ₦500,000</option>
            <option>₦500,000 - ₦1,000,000</option>
            <option>₦1,000,000+</option>
          </select>
        </div>
        <div className="space-y-2 pt-1">
          {serviceTypes.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <Checkbox
                checked={selectedServices.includes(s)}
                onCheckedChange={() => toggleService(s)}
                className="h-3.5 w-3.5"
              />
              <span className="text-xs">{s}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Password */}
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Password</label>
          <Input placeholder="Password" type={showPw ? "text" : "password"} value={formData.password} onChange={(e) => updateField("password", e.target.value)} className="h-10 text-sm pr-9 border-border/50" />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Retype Password</label>
          <Input placeholder="Retype Password" type={showPw2 ? "text" : "password"} value={formData.password2} onChange={(e) => updateField("password2", e.target.value)} className="h-10 text-sm pr-9 border-border/50" />
          <button onClick={() => setShowPw2(!showPw2)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
            {showPw2 ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

  const renderOrganizerForm = () => (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
      {/* Header with account type badge and photo */}
      <motion.div variants={itemFade} className="mb-2">
        <span className="text-xs underline text-foreground">Organiser's Account</span>
      </motion.div>
      {renderPhotoPicker()}

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
          <Input placeholder="Full Name" value={formData.fullName} onChange={(e) => updateField("fullName", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Stage Name</label>
          <Input placeholder="Stage Name" value={formData.stageName} onChange={(e) => updateField("stageName", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Username</label>
          <Input placeholder="Username" value={formData.username} onChange={(e) => updateField("username", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
          <Input placeholder="Email Address" type="email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
          <Input placeholder="Phone Number" type="tel" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">City</label>
          <Input placeholder="City" value={formData.city} onChange={(e) => updateField("city", e.target.value)} className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>

      {/* Connect Socials */}
      <motion.div variants={itemFade}>
        <div className="flex items-center gap-2 my-4">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">Connect Socials</span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <div className="grid grid-cols-2 sm:flex gap-2">
          {socialPlatforms.map((p) => (
            <button key={p} className="flex-1 border border-border/50 rounded-full py-1.5 text-[10px] text-primary/60 hover:border-primary/50 transition-colors">
              {p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* About You & Password */}
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">About You</label>
          <Textarea placeholder="About you" value={formData.aboutYou} onChange={(e) => updateField("aboutYou", e.target.value)} className="text-sm border-border/50 min-h-[100px]" />
        </div>
        <div className="space-y-3">
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <Input placeholder="Password" type={showPw ? "text" : "password"} value={formData.password} onChange={(e) => updateField("password", e.target.value)} className="h-10 text-sm pr-9 border-border/50" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Retype Password</label>
            <Input placeholder="Retype Password" type={showPw2 ? "text" : "password"} value={formData.password2} onChange={(e) => updateField("password2", e.target.value)} className="h-10 text-sm pr-9 border-border/50" />
            <button onClick={() => setShowPw2(!showPw2)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
              {showPw2 ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left side - Form */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-1 bg-primary" />
          <div className="flex-1 px-4 sm:px-6 md:px-12 lg:px-20 py-6 sm:py-10 overflow-y-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold mb-1">Create an Account</h1>
              <p className="text-muted-foreground text-xs sm:text-sm mb-6 sm:mb-8">
                Its free to create an account and get started with Iticket.{" "}
                <a href="/login" className="text-primary font-medium hover:underline">Already have an account? Sign in</a>
              </p>
            </motion.div>

            {/* Steps */}
            <div className="flex items-center gap-1 sm:gap-2 mb-6 sm:mb-8 flex-wrap">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[9px] sm:text-[10px] shrink-0 ${
                    i <= step ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : ""}
                  </div>
                  <span className={`text-[10px] sm:text-xs whitespace-nowrap ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{s}</span>
                  {i < steps.length - 1 && <div className={`w-4 sm:w-10 h-px shrink-0 ${i < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" {...fadeSlide}>
                  <h3 className="font-bold text-sm mb-4">Choose an account type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                    {accountTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedType(type.id)}
                        className={`border rounded-xl p-3 sm:p-4 text-center transition-all ${
                          selectedType === type.id
                            ? "border-primary bg-accent"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <type.icon className={`w-6 h-6 mx-auto mb-2 ${selectedType === type.id ? "text-primary" : "text-muted-foreground"}`} />
                        <p className="font-bold text-xs mb-1">{type.title}</p>
                        <p className="text-muted-foreground text-[10px] leading-relaxed">{type.desc}</p>
                        <div className={`w-4 h-4 rounded-full border mx-auto mt-3 flex items-center justify-center ${
                          selectedType === type.id ? "border-primary bg-primary" : "border-border"
                        }`}>
                          {selectedType === type.id && <Check className="w-3 h-3 text-primary-foreground" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" {...fadeSlide}>
                  <h3 className="font-bold text-sm mb-4">Tell us about yourself</h3>
                  {selectedType === "personal" && renderPersonalForm()}
                  {selectedType === "artist" && renderArtistForm()}
                  {selectedType === "organizer" && renderOrganizerForm()}
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" {...fadeSlide} className="text-center py-16">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="font-bold text-lg mb-2">Check your email</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    We've sent a confirmation link to your email address. Please click the link to verify your account.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 mt-8 pb-6">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-full">
                  Cancel
                </Button>
              )}
              <Button
                disabled={loading}
                onClick={() => {
                  if (step === 0) setStep(1);
                  else if (step === 1) handleSignUp();
                  else navigate("/");
                }}
                className="flex-1 rounded-full"
              >
                {loading ? "Creating account..." : step === 1 ? "Create Account" : step === 2 ? "Go to Home" : "Continue"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Concert image (hidden on mobile) */}
        <div className="hidden lg:block w-[400px] xl:w-[480px] relative shrink-0">
          <img
            src={concertImg}
            alt="Concert crowd"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
