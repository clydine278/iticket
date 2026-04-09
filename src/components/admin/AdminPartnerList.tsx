import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Handshake, ExternalLink, Loader2, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export const AdminPartnerList = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setPartners(data || []);
    } catch (err: any) {
      console.error("Error fetching partners:", err);
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchPartners(); 
  }, []);

  const handleAdd = async () => {
    if (!name.trim()) { 
      toast.error("Partner name is required"); 
      return; 
    }
    
    setAdding(true);
    try {
      // Adding .select() forces Supabase to return the row, triggering an error if RLS blocks it
      const { error } = await supabase.from("partners").insert({ 
        name: name.trim(), 
        logo_url: logoUrl.trim() || null, 
        website_url: websiteUrl.trim() || null 
      }).select();

      if (error) throw error;

      toast.success("Partner added successfully! 🎉"); 
      setName(""); 
      setLogoUrl(""); 
      setWebsiteUrl(""); 
      fetchPartners(); 
    } catch (err: any) {
      console.error("Insert Error:", err);
      toast.error(err.message || "Failed to add partner. Check your database RLS policies."); 
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this partner?")) return;

    try {
      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;

      toast.success("Partner removed"); 
      setPartners(prev => prev.filter(p => p.id !== id));
    } catch (err: any) {
      console.error("Delete Error:", err);
      toast.error(err.message || "Failed to delete partner");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Handshake className="w-5 h-5 text-primary" /> Partners & Sponsors
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Manage the brands and organizations affiliated with the platform.</p>
        </div>
      </div>

      {/* Modernized Add Form */}
      <Card className="border-border/50 bg-card/50 shadow-sm overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Register New Partner</h3>
        </div>
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Name *</label>
              <Input placeholder="e.g. Spotify" value={name} onChange={(e) => setName(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logo URL (Optional)</label>
              <Input placeholder="https://..." value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Website (Optional)</label>
              <Input placeholder="https://..." value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="h-9" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleAdd} disabled={adding} className="w-full sm:w-auto min-w-[140px]">
              {adding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} 
              {adding ? "Adding..." : "Add Partner"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Partners List */}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : partners.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border/60 rounded-xl bg-background/50">
          <Handshake className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="font-semibold text-foreground">No partners yet</h3>
          <p className="text-muted-foreground text-sm mt-1">Add your first partner above to display them on the platform.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {partners.map((p, i) => (
              <motion.div 
                key={p.id} 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="flex items-center gap-3 border border-border/60 rounded-xl p-3 bg-card hover:shadow-sm transition-all group">
                  {/* Logo Area */}
                  <div className="w-12 h-12 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {p.logo_url ? (
                      <img src={p.logo_url} alt={p.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Info Area */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-foreground">{p.name}</p>
                    {p.website_url ? (
                      <a href={p.website_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1 mt-0.5 truncate">
                        {p.website_url.replace(/^https?:\/\//, '')} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <p className="text-[10px] text-muted-foreground mt-0.5">No website provided</p>
                    )}
                  </div>

                  {/* Actions */}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(p.id)} 
                    className="text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Partner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};