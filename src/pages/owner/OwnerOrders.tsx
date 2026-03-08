import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingBag } from "lucide-react";

const OwnerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("orders")
        .select("*, items(name)")
        .eq("owner_id", session.user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "delivered": return "default";
      case "pending": return "secondary";
      case "cancelled": case "returned": return "destructive";
      default: return "outline";
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-foreground">Orders</h2>
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-body">No orders yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <Card key={o.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display font-medium text-foreground">{o.items?.name || "Item"}</p>
                    <p className="text-sm text-muted-foreground font-body">{o.order_number} · ₹{o.total_amount}</p>
                    <p className="text-xs text-muted-foreground font-body">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={getStatusVariant(o.status)}>
                    {o.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerOrders;
