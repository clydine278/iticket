import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Sparkles, DollarSign, Loader2, Save, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export const AdminArtistFeeSettings = () => {
  const { user } = useAuth();
  const [artistFee, setArtistFee] = useState<number>(10000);
  const [challengeEntryFee, setChallengeEntryFee] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // Fetch both fees from platform_settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("platform_settings")
        .select("artist_fee, challenge_entry_fee")
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error("Settings fetch error:", settingsError);
      }

      if (settingsData) {
        setArtistFee(settingsData.artist_fee || 10000);
        setChallengeEntryFee(settingsData.challenge_entry_fee || 0);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching settings:", err);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update both fees via edge function (bypasses RLS)
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-actions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.session?.access_token}`,
          },
          body: JSON.stringify({
            action: "update_fees",
            artistFee: artistFee,
            challengeEntryFee: challengeEntryFee,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update fees");

      toast({ 
        title: "Settings saved!",
        description: `Artist: ₦${artistFee.toLocaleString()}, Challenge: ₦${challengeEntryFee.toLocaleString()}`
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Fee Settings</h2>
      
      {/* Artist Verification Fee */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Artist Verification Fee
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Amount (₦)</Label>
            <Input 
              type="number"
              min="0"
              step="100"
              value={artistFee}
              onChange={(e) => setArtistFee(Number(e.target.value))}
              placeholder="10000"
            />
            <p className="text-sm text-muted-foreground">
              Fee artists pay to get verified badge
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Challenge Entry Fee */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="w-5 h-5 text-amber-500" />
            Challenge Entry Fee
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Standard Entry Fee (₦)</Label>
            <Input 
              type="number"
              min="0"
              step="100"
              value={challengeEntryFee}
              onChange={(e) => setChallengeEntryFee(Number(e.target.value))}
              placeholder="0 for free"
            />
            <p className="text-sm text-muted-foreground">
              {challengeEntryFee === 0 
                ? "All challenges are FREE to enter" 
                : `All challenges require ₦${challengeEntryFee.toLocaleString()} to join`}
            </p>
          </div>
          
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Current Challenge Setting</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {challengeEntryFee === 0 ? (
                    <span className="text-green-600 font-medium">Free entry for all challenges</span>
                  ) : (
                    <span>Entry fee: <span className="font-bold text-amber-600">₦{challengeEntryFee.toLocaleString()}</span></span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        disabled={saving}
        className="w-full gap-2"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save All Settings
      </Button>
    </div>
  );
};