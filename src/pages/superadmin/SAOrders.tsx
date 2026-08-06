import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  return_pending: "bg-orange-100 text-orange-800",
  returned: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

const statusLabel = (s: string) => ({
  pending: "Pending", confirmed: "Confirmed", in_transit: "In Transit",
  delivered: "Delivered", return_pending: "Return Pending", returned: "Returned", cancelled: "Cancelled",
}[s] || s);

const SAOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, owner_price, commission_amount, delivery_charge, payment_method, created_at, customer_id, owner_id, items(name)")
        .order("created_at", { ascending: false });
      const rows = data || [];
      const ids = [...new Set([...rows.map(r => r.customer_id), ...rows.map(r => r.owner_id)])];
      let nameMap: Record<string, string> = {};
      if (ids.length) {
        const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
        nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
      }
      setOrders(rows.map(r => ({
        ...r,
        customer_name: nameMap[r.customer_id] || "—",
        vendor_name: nameMap[r.owner_id] || "—",
      })));
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.order_number?.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q) || o.vendor_name?.toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || o.status === statusFilter);
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2"><ShoppingCart className="h-5 w-5 text-primary" /> All Orders ({filtered.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search order, customer or vendor" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {Object.keys(statusColors).map(s => <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-medium">{o.order_number}</TableCell>
                <TableCell>{(o.items as any)?.name || "—"}</TableCell>
                <TableCell>{o.customer_name}</TableCell>
                <TableCell>{o.vendor_name}</TableCell>
                <TableCell className="capitalize">{o.payment_method === "cash_on_delivery" ? "COD" : "Prepaid"}</TableCell>
                <TableCell>₹{Number(o.total_amount).toLocaleString("en-IN")}</TableCell>
                <TableCell><Badge className={statusColors[o.status]} variant="secondary">{statusLabel(o.status)}</Badge></TableCell>
                <TableCell>{new Date(o.created_at).toLocaleDateString("en-IN")}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-6">No orders found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SAOrders;