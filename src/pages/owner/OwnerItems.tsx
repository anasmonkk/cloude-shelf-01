import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Item {
  id: string;
  name: string;
  description: string | null;
  owner_price: number;
  status: string;
  image_urls: string[] | null;
  category_id: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  commission_rate: number;
}

const OwnerItems = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", owner_price: "", category_id: "", payment_type: "cash_on_delivery", image_url_1: "", image_url_2: "", image_url_3: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const [itemsRes, catRes] = await Promise.all([
      supabase.from("items").select("*").eq("owner_id", session.user.id).order("created_at", { ascending: false }),
      supabase.from("categories").select("*"),
    ]);

    setItems(itemsRes.data || []);
    setCategories(catRes.data || []);
    setLoading(false);
  };

  const handleSubmit = async () => {
    const urls = [form.image_url_1, form.image_url_2, form.image_url_3].filter(Boolean);
    if (urls.length < 3) {
      toast({ title: "Please provide at least 3 image URLs", variant: "destructive" });
      return;
    }
    if (!form.name || !form.category_id || !form.owner_price) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase.from("items").insert({
      name: form.name,
      description: form.description || null,
      owner_price: parseFloat(form.owner_price),
      category_id: form.category_id,
      owner_id: session.user.id,
      image_urls: urls,
      payment_type: form.payment_type,
    } as any);

    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to add item", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Item submitted for approval" });
      setForm({ name: "", description: "", owner_price: "", category_id: "", payment_type: "cash_on_delivery", image_url_1: "", image_url_2: "", image_url_3: "" });
      setDialogOpen(false);
      fetchData();
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending_approval": return "secondary";
      case "rejected": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-display font-semibold text-foreground">My Items</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name *</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category_id} onValueChange={v => setForm(f => ({ ...f, category_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Rental Price (₹) *</Label>
                <Input type="number" value={form.owner_price} onChange={e => setForm(f => ({ ...f, owner_price: e.target.value }))} />
              </div>
              <div>
                <Label>Payment Type *</Label>
                <Select value={form.payment_type} onValueChange={v => setForm(f => ({ ...f, payment_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select payment type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_on_delivery">Cash on Delivery</SelectItem>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image URL 1 *</Label>
                <Input value={form.image_url_1} onChange={e => setForm(f => ({ ...f, image_url_1: e.target.value }))} />
              </div>
              <div>
                <Label>Image URL 2 *</Label>
                <Input value={form.image_url_2} onChange={e => setForm(f => ({ ...f, image_url_2: e.target.value }))} />
              </div>
              <div>
                <Label>Image URL 3 *</Label>
                <Input value={form.image_url_3} onChange={e => setForm(f => ({ ...f, image_url_3: e.target.value }))} />
              </div>
              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Submit for Approval
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-body">No items yet. Add your first item!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-center gap-4">
                {item.image_urls?.[0] && (
                  <img src={item.image_urls[0]} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-sm text-muted-foreground font-body">₹{item.owner_price}</p>
                </div>
                <Badge variant={getStatusVariant(item.status)}>
                  {item.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerItems;
