import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, XCircle, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminOwners = () => {
  const [search, setSearch] = useState("");
  const [owners, setOwners] = useState<any[]>([]);
  const [pendingVendors, setPendingVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    // Get all users with owner role
    const { data: ownerRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "owner");

    const ownerIds = (ownerRoles || []).map(r => r.user_id);

    // Get all users with ANY role
    const { data: allRoles } = await supabase.from("user_roles").select("user_id, role");
    const usersWithRoles = new Set((allRoles || []).map(r => r.user_id));

    // Get all profiles
    const { data: allProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, mobile, created_at")
      .order("created_at", { ascending: false });

    // Pending vendors = users with NO role who have an owner_areas entry (registered via vendor signup)
    const { data: ownerAreasData } = await supabase
      .from("owner_areas")
      .select("owner_id");
    const ownerAreaUserIds = new Set((ownerAreasData || []).map(oa => oa.owner_id));

    const pending = (allProfiles || []).filter(p => !usersWithRoles.has(p.id) && ownerAreaUserIds.has(p.id));
    setPendingVendors(pending);

    // Active vendors
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, mobile, created_at")
        .in("id", ownerIds);

      const { data: items } = await supabase
        .from("items")
        .select("id, owner_id")
        .in("owner_id", ownerIds);

      const { data: ownerAreas } = await supabase
        .from("owner_areas")
        .select("owner_id, areas(name)")
        .in("owner_id", ownerIds);

      const ownerList = (profiles || []).map(p => {
        const itemCount = (items || []).filter(i => i.owner_id === p.id).length;
        const area = (ownerAreas || []).find(a => a.owner_id === p.id);
        return {
          id: p.id,
          name: p.full_name,
          mobile: p.mobile,
          items: itemCount,
          area: (area?.areas as any)?.name || "—",
          joined: new Date(p.created_at).toLocaleDateString("en-IN"),
        };
      });
      setOwners(ownerList);
    } else {
      setOwners([]);
    }

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveVendor = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "owner" });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Vendor approved", description: "The vendor can now login and list items." });
    fetchData();
  };

  const rejectVendor = async (userId: string) => {
    // Remove owner_areas entry and delete the auth user's profile
    await supabase.from("owner_areas").delete().eq("owner_id", userId);
    toast({ title: "Vendor rejected", description: "The vendor registration has been declined." });
    fetchData();
  };

  const filtered = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) || o.mobile.includes(search)
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Pending Vendor Approvals */}
      {pendingVendors.length > 0 && (
        <Card className="shadow-card border-amber-200">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2 text-amber-700">
              <Users className="h-5 w-5" /> Pending Vendor Approvals ({pendingVendors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead className="hidden md:table-cell">Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingVendors.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-display font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="font-body">{u.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => approveVendor(u.id)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => rejectVendor(u.id)}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
        <Input placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Active Vendors */}
      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Registered Vendors ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No vendors found</TableCell></TableRow>
              )}
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-display font-medium">{o.name}</TableCell>
                  <TableCell className="font-body">{o.mobile}</TableCell>
                  <TableCell className="hidden md:table-cell font-body text-muted-foreground">{o.area}</TableCell>
                  <TableCell className="font-display font-semibold">{o.items}</TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{o.joined}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOwners;
