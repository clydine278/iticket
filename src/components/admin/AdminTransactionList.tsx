import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Hash, CreditCard } from "lucide-react";

interface Props {
  orders: any[];
}

function OrderStatusBadge({ status }: { status: string }) {
  const cls = status === "completed"
    ? "bg-primary/10 text-primary"
    : "bg-muted text-muted-foreground";
  return <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{status}</span>;
}

export function AdminTransactionList({ orders }: Props) {
  if (orders.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-16 text-center">
          <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground font-medium">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display">All Transactions</CardTitle>
      </CardHeader>
      <CardContent className="p-0 sm:p-4 sm:pt-0">
        {/* Mobile list */}
        <div className="sm:hidden divide-y divide-border/40">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Order #{o.id.slice(0, 8)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">Qty: {o.quantity}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{o.payment_method || "—"}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-sm">₦{Number(o.total_amount).toLocaleString()}</p>
                <OrderStatusBadge status={o.status} />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Order ID</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Quantity</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Payment</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border/20 hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="font-mono text-xs">{o.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{o.quantity}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span className="text-sm">{o.payment_method || "—"}</span>
                    </div>
                  </td>
                  <td className="p-3 font-bold text-sm">₦{Number(o.total_amount).toLocaleString()}</td>
                  <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="p-3 text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
