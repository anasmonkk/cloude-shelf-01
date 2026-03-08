import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, CheckCircle, XCircle, Loader2, Eye, CreditCard, MapPin } from "lucide-react";
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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const { toast } = useToast();

  const fetchItems = async () => {
    const { data } = await supabase
      .from("items")
      .select("id, name, owner_price, status, category_id, owner_id, description, image_urls, payment_type, area_id, created_at, categories(name, commission_rate), areas(name)")
      .order("created_at", { ascending: false });

    const ownerIds = [...new Set((data || []).map(i => i.owner_id))];
    let profileMap: Record<string, { name: string; mobile: string }> = {};
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, mobile")
        .in("id", ownerIds);
      profileMap = Object.fromEntries((profiles || []).map(p => [p.id, { name: p.full_name, mobile: p.mobile }]));
    }

    setItems((data || []).map(item => ({
      ...item,
      vendor_name: (profileMap[item.owner_id] as any)?.name || "—",
      vendor_mobile: (profileMap[item.owner_id] as any)?.mobile || "—",
    })));
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
      if (selectedItem?.id === id) setSelectedItem(null);
    }
  };

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.vendor_name?.toLowerCase().includes(search.toLowerCase())
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
                <TableHead className="hidden md:table-cell">Vendor</TableHead>
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
                    <TableCell className="hidden md:table-cell font-body text-muted-foreground">{item.vendor_name}</TableCell>
                    <TableCell><Badge variant="secondary">{(item.categories as any)?.name || "—"}</Badge></TableCell>
                    <TableCell className="font-display font-semibold">₹{Number(item.owner_price).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="hidden md:table-cell font-display text-accent font-semibold">₹{commission.toLocaleString("en-IN")}</TableCell>
                    <TableCell><Badge className={statusColor(item.status)}>{statusLabel(item.status)}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedItem(item)}>
                          <Eye className="h-4 w-4 text-primary" />
                        </Button>
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

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedItem && (() => {
            const commission = selectedItem.categories
              ? (Number(selectedItem.owner_price) * Number(selectedItem.categories.commission_rate) / 100)
              : 0;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">{selectedItem.name}</DialogTitle>
                </DialogHeader>

                {/* Images */}
                {selectedItem.image_urls?.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selectedItem.image_urls.map((url: string, i: number) => (
                      <img key={i} src={url} alt={`${selectedItem.name} ${i + 1}`} className="h-28 w-28 rounded-lg object-cover border border-border flex-shrink-0" />
                    ))}
                  </div>
                )}

                <div className="space-y-3 text-sm">
                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={statusColor(selectedItem.status)}>{statusLabel(selectedItem.status)}</Badge>
                  </div>

                  {/* Description */}
                  {selectedItem.description && (
                    <div>
                      <span className="text-muted-foreground">Description:</span>
                      <p className="mt-1 text-foreground">{selectedItem.description}</p>
                    </div>
                  )}

                  {/* Vendor */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Vendor:</span>
                      <p className="font-medium text-foreground">{selectedItem.vendor_name}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Mobile:</span>
                      <p className="font-medium text-foreground">{selectedItem.vendor_mobile}</p>
                    </div>
                  </div>

                  {/* Category & Area */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium text-foreground">{(selectedItem.categories as any)?.name || "—"}</p>
                    </div>
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">Area:</span>
                        <p className="font-medium text-foreground">{(selectedItem.areas as any)?.name || "—"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-3 gap-2 bg-muted/50 rounded-lg p-3">
                    <div>
                      <span className="text-muted-foreground text-xs">Rental Price</span>
                      <p className="font-display font-semibold text-foreground">₹{Number(selectedItem.owner_price).toLocaleString("en-IN")}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Commission ({selectedItem.categories?.commission_rate || 0}%)</span>
                      <p className="font-display font-semibold text-accent">₹{commission.toLocaleString("en-IN")}</p>
                    </div>
                    <div className="flex items-start gap-1">
                      <CreditCard className="h-3.5 w-3.5 text-muted-foreground mt-3.5" />
                      <div>
                        <span className="text-muted-foreground text-xs">Payment</span>
                        <p className="font-medium text-foreground">{selectedItem.payment_type === "prepaid" ? "Prepaid" : "COD"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-muted-foreground">
                    Listed on {new Date(selectedItem.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>

                  {/* Actions */}
                  {selectedItem.status === "pending_approval" && (
                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" onClick={() => updateStatus(selectedItem.id, "active")}>
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                      <Button variant="destructive" className="flex-1" onClick={() => updateStatus(selectedItem.id, "rejected")}>
                        <XCircle className="h-4 w-4 mr-1" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminItems;
