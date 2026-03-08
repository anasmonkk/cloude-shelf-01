import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    pending_approval: "bg-amber-100 text-amber-800",
    rejected: "bg-red-100 text-red-800",
    inactive: "bg-gray-100 text-gray-800",
  };
  return map[s] || "";
};

const statusLabel = (s: string) => {
  const map: Record<string, string> = {
    active: "Active", pending_approval: "Pending", rejected: "Rejected", inactive: "Inactive",
  };
  return map[s] || s;
};

const AdminItems = () => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase
      .from("items")
      .select("id, name, owner_price, status, category_id, owner_id, categories(name, commission_rate), profiles:owner_id(full_name)")
      .order("created_at", { ascending: false });

    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const updateStatus = async (id: string, status: "active" | "rejected") => {
    const { error } = await supabase.from("items").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Item ${status === "active" ? "approved" : "rejected"}.` });
      fetchItems();
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.profiles as any)?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search items or vendors..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">All Items ({filtered.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead className="hidden md:table-cell">Owner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="hidden md:table-cell">Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No items found</TableCell></TableRow>
              )}
              {filtered.map((item) => {
                const commission = item.categories ? (Number(item.owner_price) * Number(item.categories.commission_rate) / 100) : 0;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-display font-medium">{item.name}</TableCell>
                    <TableCell className="hidden md:table-cell font-body text-muted-foreground">{(item.profiles as any)?.full_name || "—"}</TableCell>
                    <TableCell><Badge variant="secondary">{(item.categories as any)?.name || "—"}</Badge></TableCell>
                    <TableCell className="font-display font-semibold">₹{Number(item.owner_price).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="hidden md:table-cell font-display text-accent font-semibold">₹{commission.toLocaleString("en-IN")}</TableCell>
                    <TableCell><Badge className={statusColor(item.status)}>{statusLabel(item.status)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.status === "pending_approval" && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(item.id, "active")}>
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => updateStatus(item.id, "rejected")}>
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminItems;
