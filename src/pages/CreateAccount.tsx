import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Users, Briefcase, Check, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const accountTypes = [
  { id: "personal", icon: User, title: "Personal /Individual", desc: "Get a personal account, ticket discounts and credits" },
  { id: "artist", icon: Users, title: "Artist/ Entertainer", desc: "Register as an artist, so we help show off you for booking." },
  { id: "organizer", icon: Briefcase, title: "Organizer's Account", desc: "Get a personal account, ticket discounts and credits" },
];

const steps = ["Account type", "About you", "Email Confirmation"];

const CreateAccount = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState("personal");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Orange top bar */}
      <div className="h-1 bg-primary" />

      <div className="container max-w-lg py-10 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl font-bold mb-1">Create an Account</h1>
          <p className="text-muted-foreground text-sm mb-6">Its free to create an account and get started with Iticket</p>
        </motion.div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                i <= step ? "bg-primary text-primary-foreground" : "border border-border text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3 h-3" /> : ""}
              </div>
              <span className={`text-[10px] ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{s}</span>
              {i < steps.length - 1 && <div className={`w-8 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h3 className="font-bold text-sm mb-4">Choose an account type</h3>
              <div className="grid grid-cols-3 gap-3 mb-8">
                {accountTypes.map((type) => (
                  <button
                    key={type.id}
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
                    <div className={`w-4 h-4 rounded-full border mx-auto mt-3 ${
                      selectedType === type.id ? "border-primary bg-primary" : "border-border"
                    }`}>
                      {selectedType === type.id && <Check className="w-3 h-3 text-primary-foreground m-auto mt-0.5" />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <h3 className="font-bold text-sm mb-4">Tell us about yourself</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">First name</label>
                    <Input placeholder="First name" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Username</label>
                    <Input placeholder="Username" className="h-9 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email Address</label>
                  <Input placeholder="Email Address" type="email" className="h-9 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Phone Number</label>
                  <Input placeholder="Phone Number" type="tel" className="h-9 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Country</label>
                    <Input placeholder="Country" className="h-9 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">City</label>
                    <Input placeholder="City" className="h-9 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Date of Birth</label>
                  <Input type="date" className="h-9 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="text-xs text-muted-foreground">Password</label>
                    <Input placeholder="Password" type={showPw ? "text" : "password"} className="h-9 text-sm pr-9" />
                    <button onClick={() => setShowPw(!showPw)} className="absolute right-2.5 bottom-2 text-muted-foreground">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div className="relative">
                    <label className="text-xs text-muted-foreground">Retype Password</label>
                    <Input placeholder="Retype Password" type={showPw2 ? "text" : "password"} className="h-9 text-sm pr-9" />
                    <button onClick={() => setShowPw2(!showPw2)} className="absolute right-2.5 bottom-2 text-muted-foreground">
                      {showPw2 ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="text-center py-10"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-bold text-lg mb-2">Check your email</h3>
              <p className="text-muted-foreground text-sm">We've sent a confirmation link to your email address. Please click the link to verify your account.</p>
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
  );
};

export default CreateAccount;
