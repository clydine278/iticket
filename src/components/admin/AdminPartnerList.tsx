import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Handshake } from "lucide-react";

export const AdminPartnerList = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchPartners = async () => {
    const { data } = await supabase.from("partners").select("*").order("created_at", { ascending: false });
    setPartners(data || []);
  };

  useEffect(() => { fetchPartners(); }, []);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error("Partner name is required"); return; }
    setAdding(true);
    const { error } = await supabase.from("partners").insert({ name: name.trim(), logo_url: logoUrl.trim() || null, website_url: websiteUrl.trim() || null });
    if (error) { toast.error("Failed to add partner"); } else { toast.success("Partner added"); setName(""); setLogoUrl(""); setWebsiteUrl(""); fetchPartners(); }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("partners").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); } else { toast.success("Partner removed"); fetchPartners(); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Handshake className="w-5 h-5 text-primary" />
        <h2 className="font-display font-bold text-lg">Partners</h2>
      </div>

      {/* Add form */}
      <div className="border border-border rounded-xl p-4 space-y-3">
        <p className="text-sm font-medium">Add New Partner</p>
        <Input placeholder="Partner name *" value={name} onChange={(e) => setName(e.target.value)} className="h-9 text-sm" />
        <Input placeholder="Logo URL (optional)" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="h-9 text-sm" />
        <Input placeholder="Website URL (optional)" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="h-9 text-sm" />
        <Button size="sm" onClick={handleAdd} disabled={adding} className="gap-1.5">
          <Plus className="w-4 h-4" /> {adding ? "Adding..." : "Add Partner"}
        </Button>
      </div>

      {/* List */}
      {partners.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-6">No partners added yet</p>
      ) : (
        <div className="space-y-2">
          {partners.map((p) => (
            <div key={p.id} className="flex items-center gap-3 border border-border rounded-lg p-3">
              {p.logo_url ? (
                <img src={p.logo_url} alt={p.name} className="w-10 h-10 rounded-lg object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-xs text-primary">{p.name?.slice(0, 2).toUpperCase()}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.name}</p>
                {p.website_url && <p className="text-muted-foreground text-[10px] truncate">{p.website_url}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
