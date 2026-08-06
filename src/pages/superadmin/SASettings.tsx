import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Percent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SASettings = () => {
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [totals, setTotals] = useState({ orders: 0, items: 0, categories: 0 });
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfig = async () => {
      const [{ data }, ordersRes, itemsRes, catsRes] = await Promise.all([
        supabase.from("delivery_config").select("id, fixed_charge").limit(1).maybeSingle(),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("items").select("id", { count: "exact", head: true }),
        supabase.from("categories").select("id", { count: "exact", head: true }),
      ]);
      if (data) setDeliveryCharge(data.fixed_charge.toString());
      setTotals({ orders: ordersRes.count || 0, items: itemsRes.count || 0, categories: catsRes.count || 0 });
      setLoading(false);
    };
    fetchConfig();
  }, []);

  const saveCharge = async () => {
    setSaving(true);
    // Upsert delivery config
    const { data: existing } = await supabase.from("delivery_config").select("id").limit(1).maybeSingle();
    let error;
    if (existing) {
      ({ error } = await supabase.from("delivery_config").update({ fixed_charge: parseFloat(deliveryCharge), updated_at: new Date().toISOString() }).eq("id", existing.id));
    } else {
      ({ error } = await supabase.from("delivery_config").insert({ fixed_charge: parseFloat(deliveryCharge) }));
    }
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    else { toast({ title: "Saved", description: "Delivery charge updated." }); }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-lg space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Orders", value: totals.orders },
          { label: "Items", value: totals.items },
          { label: "Categories", value: totals.categories },
        ].map(t => (
          <Card key={t.label} className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-body">{t.label}</p>
              <p className="text-xl font-display font-bold text-foreground">{t.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2"><Settings className="h-5 w-5 text-primary" /> Platform Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Fixed Delivery Charge (₹)</Label>
            <Input type="number" value={deliveryCharge} onChange={e => setDeliveryCharge(e.target.value)} placeholder="e.g. 50" />
            <p className="text-xs text-muted-foreground">This charge is added to every order.</p>
          </div>
          <Button onClick={saveCharge} disabled={saving} className="w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Settings
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link to="/superadmin/commission"><Percent className="h-4 w-4 mr-2" /> Manage categories & commission</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SASettings;
