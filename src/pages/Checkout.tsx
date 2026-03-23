import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";

const ticketTypes = [
  { id: 1, name: "Asake Concert 2025 (Regular Ticket)", desc: "This ticket gives you access to the stadium for a standing space...", price: 5000, qty: 0 },
  { id: 2, name: "Asake Concert 2025 (Table for 4)", desc: "This ticket gives you access to the stadium for a standing space...", price: 16000, qty: 0 },
  { id: 3, name: "Asake Concert 2025 (VIP)", desc: "This ticket gives you access to the stadium for a standing space...", price: 50000, qty: 0 },
  { id: 4, name: "Asake Concert 2025 (VVIP)", desc: "This ticket gives you access to the stadium for a standing space...", price: 100000, qty: 0 },
];

const steps = ["Ticket", "Contact Information", "Payment"];

const Checkout = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [tickets, setTickets] = useState(ticketTypes);
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
  const [paymentMethod, setPaymentMethod] = useState("paystack");

  const updateQty = (id: number, delta: number) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, qty: Math.max(0, t.qty + delta) } : t))
    );
  };

  const subtotal = tickets.reduce((sum, t) => sum + t.price * t.qty, 0);
  const total = subtotal;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Event Banner */}
      <section className="bg-hero text-hero-foreground">
        <div className="container flex flex-col md:flex-row items-center gap-4 py-6">
          <div className="w-full md:w-1/2 h-36 rounded-xl bg-gradient-to-br from-primary/30 to-muted/20" />
          <div className="flex-1">
            <h1 className="font-display text-xl font-bold mb-2">Asake Concert 2025</h1>
            <div className="space-y-1 text-xs text-hero-foreground/70">
              <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> 12 February, 2026</div>
              <div className="flex items-center gap-2"><Clock className="w-3 h-3" /> 10pm - Till Dawn</div>
              <div className="flex items-center gap-2"><MapPin className="w-3 h-3" /> Lekki Toll Badagary, Lagos State...</div>
            </div>
            <Button className="mt-3 rounded-full text-xs">Ticket Completion</Button>
          </div>
        </div>
      </section>

      <div className="container py-6">
        <h2 className="font-bold text-sm mb-1">Check out</h2>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6">
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

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div>
                  <h3 className="font-bold text-sm mb-3">Choose Ticket Type</h3>
                  <div className="space-y-4">
                    {tickets.map((t) => (
                      <div key={t.id} className="border-b border-border pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-xs">{t.name}</p>
                            <p className="text-muted-foreground text-[10px]">{t.desc}</p>
                            <p className="text-muted-foreground text-[10px]">Note: you can't access some places with this ticket</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQty(t.id, -1)} className="w-5 h-5 border border-border rounded text-xs">-</button>
                            <span className="text-xs w-4 text-center">{t.qty}</span>
                            <button onClick={() => updateQty(t.id, 1)} className="w-5 h-5 border border-border rounded text-xs">+</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h3 className="font-bold text-sm mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Full Name</label>
                      <Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Email Address</label>
                      <Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="h-9 text-sm" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Phone Number</label>
                      <Input type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="h-9 text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h3 className="font-bold text-sm mb-2">Payment Options</h3>
                  <p className="text-[10px] text-muted-foreground mb-4">
                    We've reserved your ticket for you. Please check out within <span className="text-primary font-bold">10:00</span> to secure your tickets.
                  </p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer">
                      <input type="radio" name="payment" checked={paymentMethod === "paystack"} onChange={() => setPaymentMethod("paystack")} className="accent-primary" />
                      <div>
                        <p className="font-bold text-xs">Pay with Card</p>
                        <p className="text-[10px] text-muted-foreground">Pay with Mastercard, Visa, Verve or Bank Transfer.</p>
                      </div>
                      <span className="ml-auto text-xs font-bold text-primary">paystack</span>
                    </label>
                    <label className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer">
                      <input type="radio" name="payment" checked={paymentMethod === "opay"} onChange={() => setPaymentMethod("opay")} className="accent-primary" />
                      <div>
                        <p className="font-bold text-xs">Pay with Card</p>
                        <p className="text-[10px] text-muted-foreground">Pay with Mastercard, Visa, Verve or Bank Transfer.</p>
                      </div>
                      <span className="ml-auto text-xs font-bold text-green-500">OPay</span>
                    </label>
                  </div>
                  <div className="mt-4 p-3 bg-accent/50 rounded-lg">
                    <p className="text-[10px] text-primary">You must agree to all ticket terms and conditions, Refund policy, Before completing this purchase</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Right panel - Summary */}
          <div className="border border-border rounded-xl p-4">
            <h3 className="font-bold text-sm text-center mb-3">Summary</h3>
            <p className="font-bold text-xs text-center mb-3">Asake Concert 2025</p>
            <div className="space-y-2 text-xs">
              {tickets.filter((t) => t.qty > 0).map((t) => (
                <div key={t.id} className="flex justify-between">
                  <span className="text-muted-foreground">{t.qty}x {t.name}</span>
                  <span>₦{(t.price * t.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="text-muted-foreground">Fee</span>
                <span>0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₦{subtotal.toLocaleString()}</span>
              </div>
              <Input placeholder="Enter Promo Code" className="h-8 text-xs" />
              <div className="border-t border-border pt-2 flex justify-between font-bold">
                <span>TOTAL</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
            <Button
              onClick={() => {
                if (step < 2) setStep(step + 1);
                else navigate("/");
              }}
              className="w-full mt-4 rounded-full"
            >
              {step < 2 ? "Continue" : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
