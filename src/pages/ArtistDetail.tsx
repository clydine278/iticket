import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const serviceTypes = ["Live Performance", "Hosting/MC", "Meet & Greet", "Brand Promotion"];

const ArtistDetail = () => {
  const navigate = useNavigate();
  const [selectedServices, setSelectedServices] = useState<string[]>(["Live Performance"]);
  const [agreed, setAgreed] = useState(false);
  const [view, setView] = useState<"info" | "booking" | "checkout">("info");

  const toggleService = (s: string) => {
    setSelectedServices((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Artist Hero */}
      <section className="bg-hero text-hero-foreground">
        <div className="container flex flex-col md:flex-row items-center gap-6 py-8">
          <div className="w-full md:w-1/2 h-48 md:h-64 rounded-xl bg-gradient-to-br from-primary/30 to-muted/20 overflow-hidden" />
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-2xl font-bold"
            >
              Cater Efe
            </motion.h1>
            <p className="text-hero-foreground/60 text-sm">Stand up Comedian</p>
            <p className="text-hero-foreground/60 text-sm">Average Booking Price ₦400,000 - ₦1,000,000</p>
            <div className="flex items-center gap-1 text-hero-foreground/60 text-sm mt-1">
              <MapPin className="w-3 h-3" /> Location: Abuja
            </div>
            <Button onClick={() => setView("booking")} className="mt-3 rounded-full px-8">
              Book Artist
            </Button>
          </div>
        </div>
      </section>

      {/* Portfolio */}
      {view === "info" && (
        <section className="container py-8">
          <p className="text-center text-muted-foreground text-sm mb-6">
            Add your best performance so entertainers can see
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gradient-to-br from-primary/20 to-muted rounded-lg" />
            ))}
          </div>
        </section>
      )}

      {/* Booking Form */}
      {view === "booking" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container py-8"
        >
          {/* Artist mini profile */}
          <div className="flex items-start gap-4 mb-6 pb-4 border-b border-border">
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/30 to-muted/20 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="font-bold text-sm">Cater Efe</h2>
              <p className="text-muted-foreground text-xs">Stand Up Comedian/ MC/ Advertiser</p>
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                <MapPin className="w-3 h-3" /> Location: Abuja
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Average Booking Price for this artist: <span className="font-bold text-foreground">₦500,000 - ₦1,000,000</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Event Info + Flyer */}
            <div>
              <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-muted rounded-lg mb-4" />

              <h3 className="font-bold text-sm mb-3">Events Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Event Name:</label>
                  <Input className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Event Type:</label>
                  <Input className="h-8 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Event Date:</label>
                    <Input type="date" className="h-8 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Event Time:</label>
                    <Input type="time" className="h-8 text-sm" />
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-sm mt-6 mb-3">Budget Offer</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground">Proposed Budget</label>
                  <Input className="h-8 text-sm" placeholder="Select" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Deposit Available</label>
                  <Input className="h-8 text-sm" placeholder="Select" />
                </div>
              </div>

              <h3 className="font-bold text-sm mt-6 mb-3">Audience Details</h3>
              <div className="mb-3">
                <label className="text-xs text-muted-foreground">Expected Audience Size</label>
                <Input className="h-8 text-sm" placeholder="Select" />
              </div>
              <div className="flex flex-wrap gap-4">
                {serviceTypes.map((s) => (
                  <label key={s} className="flex items-center gap-1.5 text-xs">
                    <Checkbox
                      checked={selectedServices.includes(s)}
                      onCheckedChange={() => toggleService(s)}
                    />
                    {s}
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Message + Contact */}
            <div>
              <h3 className="font-bold text-sm mb-3">Message to the Artist</h3>
              <Textarea
                placeholder="Hello, we would love to invite you..."
                className="min-h-[160px] text-sm"
              />

              <h3 className="font-bold text-sm mt-6 mb-3">Organisers Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <Input className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Company:</label>
                  <Input className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email:</label>
                  <Input type="email" className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Contact Line 1</label>
                  <Input className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Contact Line 2</label>
                  <Input className="h-8 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Social Media Link</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input className="h-8 text-sm" placeholder="Instagram" />
                    <Input className="h-8 text-sm" placeholder="Facebook" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-4 border-t border-border gap-4">
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
              I confirm this booking request is genuine and agree to iticket booking policy agreement
            </label>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setView("info")} className="rounded-full text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={() => setView("checkout")} className="rounded-full text-xs" disabled={!agreed}>
                Send Booking Request
              </Button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Checkout View */}
      {view === "checkout" && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container py-8"
        >
          {/* Artist mini profile */}
          <div className="flex items-start gap-4 mb-6 pb-4 border-b border-border">
            <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary/30 to-muted/20 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="font-bold text-sm">Cater Efe</h2>
              <p className="text-muted-foreground text-xs">Stand Up Comedian/ MC/ Advertiser</p>
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                <MapPin className="w-3 h-3" /> Location: Abuja
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Average Booking Price: <span className="font-bold text-foreground">$500 - $1,000</span></p>
          </div>

          <h2 className="font-bold text-lg text-center mb-6">Checkout</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Options */}
            <div>
              <h3 className="font-bold text-sm mb-2">Payment Options</h3>
              <p className="text-[10px] text-muted-foreground mb-4">
                We've reserved your ticket for you. Please check out within <span className="text-primary font-bold">10:00</span> to secure your tickets.
              </p>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="accent-primary" />
                  <div>
                    <p className="font-bold text-xs">Pay with Card</p>
                    <p className="text-[10px] text-muted-foreground">Pay with Mastercard, Visa, Verve or Bank Transfer.</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-primary">paystack</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer">
                  <input type="radio" name="payment" className="accent-primary" />
                  <div>
                    <p className="font-bold text-xs">Pay with Card</p>
                    <p className="text-[10px] text-muted-foreground">Pay with Mastercard, Visa, Verve or Bank Transfer.</p>
                  </div>
                  <span className="ml-auto text-xs font-bold text-accent-foreground">OPay</span>
                </label>
              </div>
              <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                <p className="text-[10px] text-primary">You must agree to all iticket terms and conditions, Refund policy, before completing this purchase</p>
              </div>
            </div>

            {/* Summary */}
            <div className="border border-border rounded-xl p-4">
              <h3 className="font-bold text-sm text-center mb-3">Summary</h3>
              <p className="font-bold text-xs text-center mb-3">Carter Efe Booking</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">50% deposit | Carter Efe Booking</span>
                  <span>₦5,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Balance</span>
                  <span>₦5,000</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="text-muted-foreground">Fee</span>
                  <span>0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₦50,000</span>
                </div>
                <Input placeholder="Enter Promo Code" className="h-8 text-xs" />
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>TOTAL</span>
                  <span>₦50,000</span>
                </div>
              </div>
              <Button className="w-full mt-4 rounded-full">Submit</Button>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-8 pt-4 border-t border-border gap-4">
            <label className="flex items-center gap-2 text-xs">
              <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(!!v)} />
              I confirm this booking request is genuine and agree to iticket booking policy agreement
            </label>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={() => setView("booking")} className="rounded-full text-xs">
                Cancel
              </Button>
              <Button size="sm" onClick={() => navigate("/")} className="rounded-full text-xs">
                Send Booking Request
              </Button>
            </div>
          </div>
        </motion.section>
      )}

      <Footer />
    </div>
  );
};

export default ArtistDetail;
