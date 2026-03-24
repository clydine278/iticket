import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";

export function ProfileCompletionNotice() {
  const { user } = useAuth();
  const [incomplete, setIncomplete] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase.from("profiles").select("full_name, username, phone, city, country, bio").eq("id", user.id).single();
      if (!data) return;
      const missing = !data.full_name || !data.username || !data.phone || !data.city || !data.country;
      setIncomplete(missing);
    };
    check();
  }, [user]);

  if (!incomplete || dismissed) return null;

  return (
    <div className="relative rounded-xl border border-primary/30 bg-primary/5 p-3 sm:p-4 flex items-start gap-3 mb-5">
      <AlertTriangle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Complete your profile</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your profile is missing some information. A complete profile helps build trust with other users.{" "}
          <Link to="/dashboard/profile" className="text-primary underline underline-offset-2 font-medium">
            Update profile →
          </Link>
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="shrink-0 p-1 rounded-full hover:bg-muted transition-colors">
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}
