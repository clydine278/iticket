import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Check, Search } from "lucide-react";
import { toast } from "sonner";

export const AdminArtistFeeSettings = () => {
  const [feeAmount, setFeeAmount] = useState("1000");
  const [saving, setSaving] = useState(false);
  const [artists, setArtists] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchFee();
    fetchArtists();
  }, []);

  const fetchFee = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "artist_fee_amount")
      .single();
    if (data) setFeeAmount(data.value);
  };

  const fetchArtists = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, stage_name, email, artist_fee_paid")
      .eq("account_type", "artist")
      .order("created_at", { ascending: false });
    setArtists(data || []);
  };

  const saveFee = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("app_settings")
      .update({ value: feeAmount, updated_at: new Date().toISOString() })
      .eq("key", "artist_fee_amount");
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Fee amount updated!");
  };

  const togglePaid = async (artistId: string, currentlyPaid: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ artist_fee_paid: !currentlyPaid })
      .eq("id", artistId);
    if (error) toast.error(error.message);
    else {
      toast.success(`Artist fee ${!currentlyPaid ? "marked as paid" : "marked as unpaid"}`);
      fetchArtists();
    }
  };

  const filtered = artists.filter(
    (a) =>
      (a.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.stage_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Artist Registration Fee</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Fee Amount (₦)</label>
            <Input
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              className="h-9 text-sm"
              type="number"
            />
          </div>
          <Button onClick={saveFee} disabled={saving} size="sm" className="gap-1.5">
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Artist Fee Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search artists..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-xs pl-8"
            />
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                <div>
                  <span className="font-medium">{a.stage_name || a.full_name || "—"}</span>
                  <span className="text-muted-foreground ml-2">{a.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={a.artist_fee_paid ? "default" : "destructive"} className="text-[10px]">
                    {a.artist_fee_paid ? "Paid" : "Unpaid"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-[10px] px-2"
                    onClick={() => togglePaid(a.id, a.artist_fee_paid)}
                  >
                    {a.artist_fee_paid ? "Mark Unpaid" : "Mark Paid"}
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-muted-foreground text-xs text-center py-4">No artists found</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
