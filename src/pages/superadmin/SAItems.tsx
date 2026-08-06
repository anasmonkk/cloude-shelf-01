import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Package, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const statusColors: Record<string, string> = {
  pending_approval: "bg-amber-100 text-amber-800",
  active: "bg-emerald-100 text-emerald-800",
  inactive: "bg-gray-100 text-gray-800",
  rejected: "bg-red-100 text-red-800",
};
const statusLabel = (s: string) => ({ pending_approval: "Pending", active: "Active", inactive: "Inactive", rejected: "Rejected" }[s] || s);

const SAItems = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase
      .from("items")
      .select("id, name, owner_price, status, created_at, owner_id, categories(name), areas(name)")
      .order("created_at", { ascending: false });
    const rows = data || [];
    const ownerIds = [...new Set(rows.map(r => r.owner_id))];
    let nameMap: Record<string, string> = {};
    if (ownerIds.length) {
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ownerIds);
      nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
    }
    setItems(rows.map(r => ({ ...r, vendor_name: nameMap[r.owner_id] || "—" })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("items").update({ status: status as any }).eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Item ${statusLabel(status).toLowerCase()}` }); fetchData(); }
  };

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchSearch = !q || i.name?.toLowerCase().includes(q) || i.vendor_name?.toLowerCase().includes(q);
    return matchSearch && (statusFilter === "all" || i.status === statusFilter);
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> All Items ({filtered.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search item or vendor" value={search} onChange={e => setSearch(e.target.value)} />
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
              <TableHead>Item</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(i => (
              <TableRow key={i.id}>
                <TableCell className="font-medium">{i.name}</TableCell>
                <TableCell>{i.vendor_name}</TableCell>
                <TableCell>{(i.categories as any)?.name || "—"}</TableCell>
                <TableCell>{(i.areas as any)?.name || "—"}</TableCell>
                <TableCell>₹{Number(i.owner_price).toLocaleString("en-IN")}</TableCell>
                <TableCell><Badge className={statusColors[i.status]} variant="secondary">{statusLabel(i.status)}</Badge></TableCell>
                <TableCell className="text-right space-x-2 whitespace-nowrap">
                  {i.status !== "active" && <Button size="sm" onClick={() => setStatus(i.id, "active")}>Approve</Button>}
                  {i.status !== "rejected" && <Button size="sm" variant="outline" onClick={() => setStatus(i.id, "rejected")}>Reject</Button>}
                  {i.status === "active" && <Button size="sm" variant="ghost" onClick={() => setStatus(i.id, "inactive")}>Deactivate</Button>}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No items found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SAItems;