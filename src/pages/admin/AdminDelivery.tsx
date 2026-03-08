import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminDelivery = () => {
  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaff = async () => {
      const { data: deliveryRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "delivery");

      if (!deliveryRoles || deliveryRoles.length === 0) {
        setLoading(false);
        return;
      }

      const staffIds = deliveryRoles.map(r => r.user_id);

      const [profilesRes, areasRes, ordersRes, walletsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, mobile").in("id", staffIds),
        supabase.from("delivery_staff_areas").select("staff_id, areas(name)").in("staff_id", staffIds),
        supabase.from("orders").select("id, delivery_staff_id").in("delivery_staff_id", staffIds),
        supabase.from("wallets").select("user_id, balance").in("user_id", staffIds),
      ]);

      const staffList = (profilesRes.data || []).map(p => {
        const area = (areasRes.data || []).find(a => a.staff_id === p.id);
        const deliveries = (ordersRes.data || []).filter(o => o.delivery_staff_id === p.id).length;
        const wallet = (walletsRes.data || []).find(w => w.user_id === p.id);
        return {
          id: p.id,
          name: p.full_name,
          mobile: p.mobile,
          area: (area?.areas as any)?.name || "—",
          deliveries,
          wallet: wallet ? `₹${Number(wallet.balance).toLocaleString("en-IN")}` : "₹0",
        };
      });

      setStaff(staffList);
      setLoading(false);
    };
    fetchStaff();
  }, []);

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search delivery staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Delivery Staff ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead className="hidden md:table-cell">Wallet</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No delivery staff found</TableCell></TableRow>
              )}
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-display font-medium">{s.name}</TableCell>
                  <TableCell className="font-body">{s.mobile}</TableCell>
                  <TableCell className="hidden md:table-cell font-body text-muted-foreground">{s.area}</TableCell>
                  <TableCell className="font-display font-semibold">{s.deliveries}</TableCell>
                  <TableCell className="hidden md:table-cell font-display font-semibold text-accent">{s.wallet}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDelivery;
