import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingBag, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const OwnerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
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

  useEffect(() => { fetchOrders(); }, []);

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status: status as any }).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: status === "confirmed" ? "Order accepted" : "Order cancelled" });
      fetchOrders();
    }
  };

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
          {orders.map((o: any) => {
            const isCODPending = o.payment_method === "cash_on_delivery" && o.status === "pending";
            return (
              <Card key={o.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-medium text-foreground">{o.items?.name || "Item"}</p>
                      <p className="text-sm text-muted-foreground font-body">{o.order_number} · ₹{o.total_amount}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={o.payment_method === "prepaid" ? "default" : "secondary"} className="text-xs">
                          {o.payment_method === "prepaid" ? "Prepaid" : "COD"}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-body">{new Date(o.created_at).toLocaleDateString()}</span>
                      </div>
                      {o.delivery_address && (
                        <p className="text-xs text-muted-foreground mt-1">📍 {o.delivery_address}</p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusVariant(o.status)}>
                        {o.status.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                      </Badge>
                      {isCODPending && (
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => updateOrderStatus(o.id, "confirmed")}>
                            <CheckCircle className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Accept
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => updateOrderStatus(o.id, "cancelled")}>
                            <XCircle className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      )}
                      {o.payment_method === "prepaid" && o.status === "pending" && (
                        <span className="text-xs text-amber-600 font-body">Awaiting payment verification</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OwnerOrders;
