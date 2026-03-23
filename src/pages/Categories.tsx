import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

const categories = ["Music", "Comedy", "Acting", "Fashion"];

const celebrities = [
  { id: 1, name: "Rema", color: "bg-purple-500" },
  { id: 2, name: "Burna Boy", color: "bg-stone-600" },
  { id: 3, name: "Olamide", color: "bg-blue-400" },
  { id: 4, name: "Wizkid", color: "bg-stone-800" },
  { id: 5, name: "Fireboy", color: "bg-yellow-600" },
  { id: 6, name: "Davido", color: "bg-red-500" },
  { id: 7, name: "Ayra Starr", color: "bg-orange-400" },
  { id: 8, name: "Asake", color: "bg-stone-700" },
  { id: 9, name: "Tems", color: "bg-green-700" },
  { id: 10, name: "Lil Nas X", color: "bg-indigo-500" },
  { id: 11, name: "Ckay", color: "bg-stone-500" },
  { id: 12, name: "Kizz Daniel", color: "bg-blue-400" },
];

const Categories = () => {
  const navigate = useNavigate();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCelebs, setSelectedCelebs] = useState<number[]>([]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCeleb = (id: number) => {
    setSelectedCelebs((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-4 py-6">
      <Input
        placeholder="Search"
        className="h-12 bg-foreground text-background placeholder:text-muted-foreground rounded-lg mb-6"
      />

      <p className="text-muted-foreground text-sm mb-3">Pick your most preferred category</p>

      {/* Category chips - 3 rows */}
      <div className="space-y-2 mb-8">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={`${row}-${cat}`}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(cat)
                    ? "bg-primary text-primary-foreground"
                    : "bg-foreground text-background"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Celebrity grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {celebrities.map((celeb) => (
          <button
            key={celeb.id}
            onClick={() => toggleCeleb(celeb.id)}
            className="relative"
          >
            <div
              className={`w-full aspect-square rounded-full ${celeb.color} flex items-center justify-center text-foreground text-xs font-semibold`}
            >
              {celeb.name}
            </div>
            {selectedCelebs.includes(celeb.id) && (
              <div className="absolute top-0 left-0 w-full aspect-square rounded-full bg-primary/60 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={() => navigate("/celebrity/wizkid")}
        className="w-full h-12 rounded-full text-base font-semibold"
      >
        Continue
      </Button>
    </div>
  );
};

export default Categories;
