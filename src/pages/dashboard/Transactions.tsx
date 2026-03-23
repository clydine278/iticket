import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Receipt, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setTransactions(data || []);
          setLoading(false);
        });
    }
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-xl font-bold mb-4">Transactions</h1>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : transactions.length === 0 ? (
          <Card className="border-border/40">
            <CardContent className="p-8 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-sm mb-1">No transactions yet</p>
              <p className="text-xs text-muted-foreground">Your financial activity will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <Card key={t.id} className="border-border/40">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      t.type === "credit" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-rose-100 dark:bg-rose-900/30"
                    }`}>
                      {t.type === "credit" ? (
                        <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.description || t.type}</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className={`font-bold text-sm ${t.type === "credit" ? "text-emerald-600" : "text-rose-600"}`}>
                    {t.type === "credit" ? "+" : "-"}₦{Number(t.amount).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Transactions;
