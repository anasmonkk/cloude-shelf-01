import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminOwners = () => {
  const [search, setSearch] = useState("");
  const [owners, setOwners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwners = async () => {
      // Get all users with owner role
      const { data: ownerRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "owner");

      if (!ownerRoles || ownerRoles.length === 0) {
        setLoading(false);
        return;
      }

      const ownerIds = ownerRoles.map(r => r.user_id);

      // Get profiles, items count, and areas for each owner
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
      setLoading(false);
    };
    fetchOwners();
  }, []);

  const filtered = owners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) || o.mobile.includes(search)
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search owners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Registered Owners ({filtered.length})</CardTitle></CardHeader>
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
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No owners found</TableCell></TableRow>
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
