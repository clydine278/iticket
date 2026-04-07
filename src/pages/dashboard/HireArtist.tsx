import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, MapPin, Music } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Top categories
const categories = ["All", "Singer", "Comedian", "Dancer", "DJ", "Producer", "Rapper", "Drummer"];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "₦10k - ₦50k", min: 10000, max: 50000 },
  { label: "₦50k - ₦100k", min: 50000, max: 100000 },
  { label: "₦100k - ₦200k", min: 100000, max: 200000 },
  { label: "₦200k - ₦500k", min: 200000, max: 500000 },
  { label: "₦500k+", min: 500000, max: Infinity },
];

const HireArtist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showPriceDropdown, setShowPriceDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("account_type", "artist")
        .eq("artist_fee_paid", true)
        .order("created_at", { ascending: false });
      
      if (error) {
        toast({ title: "Error loading artists", description: error.message, variant: "destructive" });
      }
      setArtists(data || []);
      setLoading(false);
    };
    fetchArtists();
  }, []);

  const handleArtistClick = (artistId: string) => {
    if (!artistId) return;
    navigate(`/dashboard/artist/${artistId}`);
  };

  const filtered = artists.filter((a) => {
    const matchesSearch =
      (a.stage_name || a.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.city || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" || 
      a.artist_category === selectedCategory ||
      (a.services || []).some((s: string) => s.toLowerCase().includes(selectedCategory.toLowerCase()));
    
    const matchesState = !selectedState || 
      (a.city && a.city.toLowerCase().includes(selectedState.toLowerCase()));
    
    const matchesPrice = 
      selectedPriceRange.min === 0 || 
      (a.booking_price && a.booking_price >= selectedPriceRange.min && a.booking_price <= selectedPriceRange.max);
    
    return matchesSearch && matchesCategory && matchesState && matchesPrice;
  });

  return (
    <DashboardLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-6 max-w-6xl mx-auto"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" /> Hire an Artist
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Discover and book talented artists for your events
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex items-center justify-end gap-4">
          {/* Price Range Dropdown */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowPriceDropdown(!showPriceDropdown);
                setShowStateDropdown(false);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors px-3 py-1.5 rounded-full bg-muted/50"
            >
              {selectedPriceRange.label}
              <ChevronDown className={`w-3 h-3 transition-transform ${showPriceDropdown ? "rotate-180" : ""}`} />
            </button>
            
            {showPriceDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl max-h-60 overflow-y-auto z-50 min-w-[140px] shadow-xl">
                {priceRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => {
                      setSelectedPriceRange(range);
                      setShowPriceDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-800 transition-colors ${
                      selectedPriceRange.label === range.label ? "text-orange-500 bg-gray-800/50" : "text-gray-400"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            placeholder="Search artists by name, city, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 h-12 text-sm rounded-full bg-muted/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-gray-600"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-orange-500 text-white"
                  : "bg-muted/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* State Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => {
                setShowStateDropdown(!showStateDropdown);
                setShowPriceDropdown(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-gray-400 text-xs hover:bg-gray-800 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {selectedState || "Filter by State"}
              <ChevronDown className={`w-3 h-3 transition-transform ${showStateDropdown ? "rotate-180" : ""}`} />
            </button>
            
            {showStateDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-gray-800 rounded-xl max-h-60 overflow-y-auto z-50 min-w-[180px] shadow-xl">
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
          
          {selectedState && (
            <button
              onClick={() => setSelectedState(null)}
              className="text-xs text-gray-500 hover:text-white underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-xs text-muted-foreground">
          {filtered.length} artist{filtered.length !== 1 ? 's' : ''} found
        </div>

        {/* Artists Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm bg-muted/30 rounded-2xl border border-dashed border-gray-800">
            <Music className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p>No artists found matching your criteria</p>
            <button 
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSelectedState(null);
                setSelectedPriceRange(priceRanges[0]);
              }}
              className="mt-2 text-orange-500 hover:underline text-xs"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map((artist) => (
              <motion.div key={artist.id} variants={fadeUp}>
                <button
                  type="button"
                  onClick={() => handleArtistClick(artist.id)}
                  className="w-full bg-none border border-gray-800 rounded-2xl p-4 text-center hover:border-gray-600 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg group"
                >
                  {/* Circular Avatar */}
                  <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-3 rounded-full overflow-hidden bg-gray-800 ring-2 ring-transparent group-hover:ring-orange-500/30 transition-all">
                    {artist.avatar_url ? (
                      <img
                        src={artist.avatar_url}
                        alt={artist.stage_name || artist.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-gray-700 flex items-center justify-center">
                        <span className="font-bold text-xl text-orange-400">
                          {(artist.stage_name || artist.full_name || "AR").slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Artist Name */}
                  <h3 className="font-bold text-sm mb-0.5 truncate px-1 text-white group-hover:text-orange-400 transition-colors">
                    {artist.stage_name || artist.full_name || "Artist"}
                  </h3>

                  {/* Category */}
                  <p className="text-gray-500 text-xs mb-2">
                    {artist.artist_category || artist.services?.[0] || "Artist"}
                  </p>

                  {/* Location */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <MapPin className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-400 text-xs truncate max-w-[100px]">
                      {artist.city || artist.country 
                        ? [artist.city, artist.country].filter(Boolean).join(", ")
                        : "Location N/A"
                      }
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="inline-flex items-center bg-gray-800 rounded-lg px-3 py-1">
                    <span className="text-xs font-semibold text-white">
                      {artist.booking_price 
                        ? `₦${Number(artist.booking_price).toLocaleString()}`
                        : "Contact for price"
                      }
                    </span>
                  </div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default HireArtist;