import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Top 5 categories from the provided list
const categories = ["Singer", "Comedian", "Dancer", "DJ", "Producer"];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const priceRanges = [
  { label: "₦10,000 - ₦50,000", min: 10000, max: 50000 },
  { label: "₦50,000 - ₦100,000", min: 50000, max: 100000 },
  { label: "₦100,000 - ₦200,000", min: 100000, max: 200000 },
  { label: "₦200,000 - ₦500,000", min: 200000, max: 500000 },
  { label: "₦500,000 - ₦1,000,000", min: 500000, max: 1000000 },
];

const BookArtist = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ label: string; min: number; max: number } | null>(null);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();


const handleArtistClick = (artistId: string) => {
  console.log("Navigating to artist:", artistId); // DEBUG
  
  if (!artistId) {
    console.error("No artist ID provided!");
    return;
  }

  if (!user) {
    // Not signed in - go to public artist detail page on landing
    navigate(`/artist/${artistId}`);
    return;
  }
  // Signed in - go to dashboard artist detail
  navigate(`/dashboard/artist/${artistId}`);
};

  useEffect(() => {
    const fetchArtists = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_type", "artist")
        .eq("artist_fee_paid", true);
      setArtists(data || []);
      setLoading(false);
    };
    fetchArtists();
  }, []);

  const filtered = artists.filter((a) => {
    const matchesSearch =
      (a.stage_name || a.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.city || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.services || []).some((s: string) => s.toLowerCase().includes(search.toLowerCase()));
    
    const matchesCategory = 
      selectedCategory === "All" || 
      (a.artist_category === selectedCategory) ||
      (a.services || []).some((s: string) => s.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    const matchesState = !selectedState || 
      (a.city && a.city.toLowerCase().includes(selectedState.toLowerCase()));
    
    const matchesPrice = !selectedPriceRange || 
      (a.booking_price && a.booking_price >= selectedPriceRange.min && a.booking_price <= selectedPriceRange.max);
    
    return matchesSearch && matchesCategory && matchesState && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <section className="container py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold mb-2"
          >
            Book An Entertainer
          </motion.h1>
          <p className="text-gray-400 text-sm">
            Discover and request bookings for the best talent in the industry.
          </p>
        </div>

        {/* Filters Row - Price Range and User */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3 ml-auto relative">
            {/* Price Range Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowPriceDropdown(!showPriceDropdown);
                  setShowStateDropdown(false);
                }}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
              >
                {selectedPriceRange ? selectedPriceRange.label : "Price Range"}
                <ChevronDown className={`w-3 h-3 transition-transform ${showPriceDropdown ? "rotate-180" : ""}`} />
              </button>
              
              {showPriceDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl max-h-60 overflow-y-auto z-50 min-w-[180px]">
                  <button
                    onClick={() => {
                      setSelectedPriceRange(null);
                      setShowPriceDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-800 transition-colors"
                  >
                    All Prices
                  </button>
                  {priceRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => {
                        setSelectedPriceRange(range);
                        setShowPriceDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-800 transition-colors ${
                        selectedPriceRange?.label === range.label ? "text-orange-500 bg-gray-800/50" : "text-gray-400"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-xs">👤</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 text-sm rounded-full bg-[#1a1a1a] border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
              selectedCategory === "All"
                ? "bg-orange-500 text-white"
                : "bg-[#1a1a1a] text-gray-400 hover:bg-gray-800"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* State Filter Dropdown */}
        <div className="flex justify-center mb-10 relative">
          <button
            onClick={() => {
              setShowStateDropdown(!showStateDropdown);
              setShowPriceDropdown(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a1a1a] text-gray-400 text-xs hover:bg-gray-800 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5" />
            {selectedState || "Filter by State"}
            <ChevronDown className={`w-3 h-3 transition-transform ${showStateDropdown ? "rotate-180" : ""}`} />
          </button>
          
          {showStateDropdown && (
            <div className="absolute top-full mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl max-h-60 overflow-y-auto z-50 min-w-[200px]">
              <button
                onClick={() => {
                  setSelectedState(null);
                  setShowStateDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-gray-400 hover:bg-gray-800 transition-colors"
              >
                All States
              </button>
              {nigerianStates.map((state) => (
                <button
                  key={state}
                  onClick={() => {
                    setSelectedState(state);
                    setShowStateDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-800 transition-colors ${
                    selectedState === state ? "text-orange-500 bg-gray-800/50" : "text-gray-400"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Artists Grid */}
{/* Artists Grid */}
{loading ? (
  <div className="flex justify-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
  </div>
) : filtered.length === 0 ? (
  <div className="text-center py-12 text-gray-500 text-sm">No artists found</div>
) : (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
  >
    {filtered.map((artist) => (
      <motion.div key={artist.id} variants={fadeUp}>
        <button
          type="button"
          onClick={() => {
            console.log("Clicked artist:", artist.id, artist);
            handleArtistClick(artist.id);
          }}
          className="w-full bg-none border border-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center hover:border-gray-600 transition-all duration-300 hover:scale-[1.02]"
        >
          {/* Circular Avatar - Smaller on mobile */}
          <div className="w-32 h-32 xs:w-40 xs:h-40 sm:w-48 sm:h-48 mx-auto mb-2 sm:mb-3 rounded-full overflow-hidden bg-gray-800">
            {artist.avatar_url ? (
              <img
                src={artist.avatar_url}
                alt={artist.stage_name || artist.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-gray-700 flex items-center justify-center">
                <span className="font-bold text-base xs:text-lg sm:text-xl text-orange-400">
                  {(artist.stage_name || artist.full_name || "AR").slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Artist Name - Smaller text on mobile */}
          <h3 className="font-bold text-xs sm:text-sm mb-0.5 truncate px-1">
            {artist.stage_name || artist.full_name || "Artist"}
          </h3>

          {/* Category - Hidden on very small screens, shown on xs+ */}
          <p className="text-gray-500 text-[10px] xs:text-xs mb-1 sm:mb-3 hidden xs:block">
            {(artist as any).artist_category || artist.services?.[0] || "Artist"}
          </p>

          {/* Location - Simplified on mobile */}
          <div className="flex items-center justify-center gap-1 mb-1 sm:mb-3">
            <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 flex-shrink-0" />
            <span className="text-gray-400 text-[10px] xs:text-xs truncate max-w-[80px] xs:max-w-[100px] sm:max-w-none">
              {artist.city || artist.country 
                ? [artist.city, artist.country].filter(Boolean).join(", ").substring(0, 12) + ([artist.city, artist.country].filter(Boolean).join(", ").length > 12 ? "..." : "")
                : "N/A"
              }
            </span>
          </div>

          {/* Price Tag - Smaller on mobile */}
          <div className="inline-flex items-center bg-gray-800 rounded px-2 sm:rounded-md py-0.5 sm:py-1">
            <span className="text-[10px] xs:text-xs font-semibold text-white">
              ₦{Number(artist.booking_price || 0).toLocaleString()}
            </span>
          </div>
        </button>
      </motion.div>
    ))}
  </motion.div>
)}
      </section>

      <Footer />
    </div>
  );
};

export default BookArtist;