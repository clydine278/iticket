import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Users, Briefcase, Check, Eye, EyeOff, Camera, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import concertImg from "@/assets/concert-crowd.jpg";

const accountTypes = [
  { id: "personal", icon: User, title: "Personal / Individual", desc: "Get a personal account, ticket discounts and credits" },
  { id: "artist", icon: Users, title: "Artist / Entertainer", desc: "Register as an artist, so we help show off you for booking." },
  { id: "organizer", icon: Briefcase, title: "Organizer's Account", desc: "Get a personal account, ticket discounts and credits" },
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
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState("personal");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>(["Live Performance"]);

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const renderPersonalForm = () => (
    <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">First name</label>
          <Input placeholder="First name" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Username</label>
          <Input placeholder="Username" className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>
      <motion.div variants={itemFade}>
        <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
        <Input placeholder="Email Address" type="email" className="h-10 text-sm border-border/50" />
      </motion.div>
      <motion.div variants={itemFade}>
        <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
        <Input placeholder="Phone Number" type="tel" className="h-10 text-sm border-border/50" />
      </motion.div>
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Country</label>
          <Input placeholder="Country" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">City</label>
          <Input placeholder="City" className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>
      <motion.div variants={itemFade}>
        <label className="text-xs text-muted-foreground mb-1 block">Date of Birth</label>
        <Input type="date" className="h-10 text-sm border-border/50" />
      </motion.div>
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Password</label>
          <Input placeholder="Password" type={showPw ? "text" : "password"} className="h-10 text-sm pr-9 border-border/50" />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Retype Password</label>
          <Input placeholder="Retype Password" type={showPw2 ? "text" : "password"} className="h-10 text-sm pr-9 border-border/50" />
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
      <motion.div variants={itemFade} className="flex items-center justify-between mb-2">
        <span className="text-xs underline text-foreground">Artist Account</span>
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
          <div className="text-center">
            <Camera className="w-4 h-4 mx-auto text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">Add Photo</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
          <Input placeholder="Full Name" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Stage Name</label>
          <Input placeholder="Stage Name" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Username</label>
          <Input placeholder="Username" className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
          <Input placeholder="Email Address" type="email" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
          <Input placeholder="Phone Number" type="tel" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">City</label>
          <Input placeholder="City" className="h-10 text-sm border-border/50" />
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

      {/* Add Video slots */}
      <motion.div variants={itemFade} className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square rounded-xl bg-muted/50 border border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted transition-colors">
            <Video className="w-6 h-6 text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground">Add Video</span>
            <span className="text-[8px] text-muted-foreground">1:1 ratio recommended</span>
          </div>
        ))}
      </motion.div>

      {/* Booking Price & Services */}
      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Booking Price</label>
          <select className="w-full h-10 text-sm border border-border/50 rounded-md bg-background px-3">
            <option>Select range</option>
            <option>$100 - $500</option>
            <option>$500 - $1,000</option>
            <option>$1,000 - $5,000</option>
            <option>$5,000+</option>
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
          <Input placeholder="Password" type={showPw ? "text" : "password"} className="h-10 text-sm pr-9 border-border/50" />
          <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
            {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <div className="relative">
          <label className="text-xs text-muted-foreground mb-1 block">Retype Password</label>
          <Input placeholder="Retype Password" type={showPw2 ? "text" : "password"} className="h-10 text-sm pr-9 border-border/50" />
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
      <motion.div variants={itemFade} className="flex items-center justify-between mb-2">
        <span className="text-xs underline text-foreground">Organiser's Account</span>
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
          <div className="text-center">
            <Camera className="w-4 h-4 mx-auto text-muted-foreground" />
            <span className="text-[8px] text-muted-foreground">Add Photo</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
          <Input placeholder="Full Name" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Stage Name</label>
          <Input placeholder="Stage Name" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Username</label>
          <Input placeholder="Username" className="h-10 text-sm border-border/50" />
        </div>
      </motion.div>

      <motion.div variants={itemFade} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
          <Input placeholder="Email Address" type="email" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
          <Input placeholder="Phone Number" type="tel" className="h-10 text-sm border-border/50" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">City</label>
          <Input placeholder="City" className="h-10 text-sm border-border/50" />
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
      <motion.div variants={itemFade} className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">About You</label>
          <Textarea placeholder="About you" className="text-sm border-border/50 min-h-[100px]" />
        </div>
        <div className="space-y-3">
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Password</label>
            <Input placeholder="Password" type={showPw ? "text" : "password"} className="h-10 text-sm pr-9 border-border/50" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <div className="relative">
            <label className="text-xs text-muted-foreground mb-1 block">Retype Password</label>
            <Input placeholder="Retype Password" type={showPw2 ? "text" : "password"} className="h-10 text-sm pr-9 border-border/50" />
            <button onClick={() => setShowPw2(!showPw2)} className="absolute right-2.5 bottom-2.5 text-muted-foreground">
              {showPw2 ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="h-1 bg-primary" />
        <div className="flex-1 px-6 md:px-12 lg:px-20 py-10 overflow-y-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Create an Account</h1>
            <p className="text-muted-foreground text-sm mb-8">Its free to create an account and get started with Iticket</p>
          </motion.div>

          {/* Steps */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  i <= step ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
                }`}>
                  {i < step ? <Check className="w-3 h-3" /> : ""}
                </div>
                <span className={`text-xs ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{s}</span>
                {i < steps.length - 1 && <div className={`w-10 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" {...fadeSlide}>
                <h3 className="font-bold text-sm mb-4">Choose an account type</h3>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {accountTypes.map((type) => (
                    <motion.button
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedType(type.id)}
                      className={`border rounded-xl p-4 text-center transition-all ${
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

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-full">
                Cancel
              </Button>
            )}
            <Button
              onClick={() => {
                if (step < 2) setStep(step + 1);
                else navigate("/");
              }}
              className="flex-1 rounded-full"
            >
              Continue
            </Button>
          </div>
        </div>
      </div>

      {/* Right side - Concert image (hidden on mobile) */}
      <div className="hidden lg:block w-[400px] xl:w-[480px] relative">
        <img
          src={concertImg}
          alt="Concert crowd"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default CreateAccount;
