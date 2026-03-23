import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { motion } from "framer-motion";

const tickets = [
  {
    id: 1,
    name: "Standard/General Ticket $50",
    price: "$50",
    perks: [
      "🎵 Access to the main concert area (standing or regular seating)",
      "🎫 Digital ticket (QR code entry)",
      "⚫ Doors open at regular time",
    ],
  },
  {
    id: 2,
    name: "Gold VIP Ticket $90",
    price: "$90",
    perks: [
      "✨ Priority entry (skip general lines)",
      "🎪 Reserved seating area closer to the stage",
      "🎁 Exclusive tour wristband or small merch item included",
      "📸 Access to a 'photo wall' for fan selfies",
    ],
  },
  {
    id: 3,
    name: "Silver V.I.P Ticket $120",
    price: "$120",
    perks: [
      "✨ Priority entry (skip general lines)",
      "🎪 Reserved seating area closer to the stage",
      "🎁 Exclusive tour wristband or small merch item included",
      "📸 Access to a 'photo wall' for fan selfies",
    ],
  },
  {
    id: 4,
    name: "Diamond (VVIP / All-Access) $150",
    price: "$150",
    perks: [
      "✨ Priority entry (skip general lines)",
      "🎪 Reserved seating area closer to the stage",
      "🎁 Exclusive tour wristband or small merch item included",
      "📸 Access to a 'photo wall' for fan selfies",
    ],
  },
];

const TicketSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="relative px-4 pt-4">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate(-1)}
          className="z-10"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <ArrowLeft className="w-4 h-4 text-primary-foreground" />
          </div>
        </motion.button>
      </div>

      {/* Ticket images - stacked cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, type: "spring", damping: 20 }}
        className="relative h-72 flex items-center justify-center mb-2"
      >
        <div className="relative w-40 h-56">
          {/* Background cards */}
          <div className="absolute -left-8 top-4 w-36 h-48 bg-muted rounded-lg -rotate-12 opacity-60" />
          <div className="absolute -right-8 top-4 w-36 h-48 bg-muted rounded-lg rotate-12 opacity-60" />
          {/* Main card */}
          <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center border border-border">
            <Plus className="w-10 h-10 text-muted-foreground" />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="px-4 mb-2"
      >
        <p className="text-muted-foreground text-xs">Sunday 27th October 2025</p>
        <div className="flex justify-between items-center">
          <h1 className="text-foreground text-xl font-bold">Wizkid At United Kingdom</h1>
          <span className="text-primary font-bold text-lg">$50</span>
        </div>
      </motion.div>

      {/* Ticket tiers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-4 flex-1"
      >
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          {tickets.map((ticket, index) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="flex items-center justify-between px-4 py-4 border-b border-border last:border-b-0"
            >
              <div className="flex-1 pr-3">
                <h3 className="text-foreground text-sm font-bold">{ticket.name}</h3>
                <div className="mt-1 space-y-0.5">
                  {ticket.perks.map((perk, i) => (
                    <p key={i} className="text-muted-foreground text-[10px]">{perk}</p>
                  ))}
                </div>
              </div>
              <button className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 transition-transform active:scale-90">
                <ArrowRight className="w-5 h-5 text-primary-foreground" />
              </button>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TicketSelection;
