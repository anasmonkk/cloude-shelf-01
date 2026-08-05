import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2, CheckCircle, XCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminDelivery = () => {
  const [search, setSearch] = useState("");
  const [staff, setStaff] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    // Get delivery role users
    const { data: deliveryRoles } = await supabase.from("user_roles").select("user_id").eq("role", "delivery");
    const deliveryIds = (deliveryRoles || []).map(r => r.user_id);

    // Get all roles to find pending users
    const { data: allRoles } = await supabase.from("user_roles").select("user_id");
    const usersWithRoles = new Set((allRoles || []).map(r => r.user_id));

    // Pending: delivery applications only (users who signed up on the delivery portal)
    const { data: applications } = await supabase
      .from("vendor_applications")
      .select("id, user_id, full_name, mobile, created_at")
      .eq("status", "pending")
      .eq("requested_role", "delivery")
      .order("created_at", { ascending: false });

    const pending = (applications || [])
      .filter(a => !usersWithRoles.has(a.user_id))
      .map(a => ({
        id: a.user_id,
        application_id: a.id,
        full_name: a.full_name,
        mobile: a.mobile,
        created_at: a.created_at,
      }));
    setPendingUsers(pending);

    // Active delivery staff
    if (deliveryIds.length > 0) {
      const [profilesRes, areasRes, ordersRes, walletsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, mobile, date_of_birth").in("id", deliveryIds),
        supabase.from("delivery_staff_areas").select("staff_id, areas(name)").in("staff_id", deliveryIds),
        supabase.from("orders").select("id, delivery_staff_id").in("delivery_staff_id", deliveryIds),
        supabase.from("wallets").select("user_id, balance").in("user_id", deliveryIds),
      ]);

      const staffList = (profilesRes.data || []).map(p => {
        const area = (areasRes.data || []).find(a => a.staff_id === p.id);
        const deliveries = (ordersRes.data || []).filter(o => o.delivery_staff_id === p.id).length;
        const wallet = (walletsRes.data || []).find(w => w.user_id === p.id);
        return {
          id: p.id, name: p.full_name, mobile: p.mobile,
          dob: p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString("en-IN") : "—",
          area: (area?.areas as any)?.name || "—",
          deliveries,
          wallet: wallet ? `₹${Number(wallet.balance).toLocaleString("en-IN")}` : "₹0",
        };
      });
      setStaff(staffList);
    } else {
      setStaff([]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveDelivery = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "delivery" });
    if (error && !error.message.includes("duplicate")) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    await supabase
      .from("vendor_applications")
      .update({ status: "approved" })
      .eq("user_id", userId)
      .eq("requested_role", "delivery");
    toast({ title: "Delivery staff approved" });
    fetchData();
  };

  const removeDelivery = async (userId: string) => {
    await supabase.from("delivery_staff_areas").delete().eq("staff_id", userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "delivery");
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Delivery staff removed" });
    fetchData();
  };

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card className="shadow-card border-amber-200">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2 text-amber-700">
              <Users className="h-5 w-5" /> Pending Delivery Approvals ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>DOB</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-display font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="font-body">{u.mobile}</TableCell>
                    <TableCell className="text-sm">{u.date_of_birth ? new Date(u.date_of_birth).toLocaleDateString("en-IN") : "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => approveDelivery(u.id)}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search delivery staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Active Staff */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Delivery Staff ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead className="hidden md:table-cell">Wallet</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No delivery staff found</TableCell></TableRow>
              )}
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-display font-medium">{s.name}</TableCell>
                  <TableCell className="font-body">{s.mobile}</TableCell>
                  <TableCell className="text-sm">{s.dob}</TableCell>
                  <TableCell className="hidden md:table-cell font-body text-muted-foreground">{s.area}</TableCell>
                  <TableCell className="font-display font-semibold">{s.deliveries}</TableCell>
                  <TableCell className="hidden md:table-cell font-display font-semibold text-accent">{s.wallet}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => removeDelivery(s.id)}>
                      <XCircle className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
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
