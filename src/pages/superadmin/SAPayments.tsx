import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Wallet, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const payStatusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-blue-100 text-blue-800",
  collected: "bg-emerald-100 text-emerald-800",
  refunded: "bg-gray-100 text-gray-800",
};

const SAPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    const [paymentsRes, settlementsRes] = await Promise.all([
      supabase.from("payments").select("id, amount, method, status, created_at, orders(order_number)").order("created_at", { ascending: false }),
      supabase.from("settlements").select("id, user_id, amount, status, created_at, settled_at").order("created_at", { ascending: false }),
    ]);
    const setts = settlementsRes.data || [];
    let nameMap: Record<string, string> = {};
    if (setts.length) {
      const ids = [...new Set(setts.map(s => s.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      nameMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
    }
    setPayments(paymentsRes.data || []);
    setSettlements(setts.map(s => ({ ...s, user_name: nameMap[s.user_id] || "—" })));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const markSettled = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("settlements")
      .update({ status: "settled" as any, settled_at: new Date().toISOString(), settled_by: session?.user?.id ?? null })
      .eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Settlement marked as settled" }); fetchData(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const totalPayments = payments.reduce((a, p) => a + Number(p.amount), 0);
  const pendingSettlement = settlements.filter(s => s.status === "pending").reduce((a, s) => a + Number(s.amount), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total Payments", value: `₹${totalPayments.toLocaleString("en-IN")}` },
          { label: "Pending Settlement", value: `₹${pendingSettlement.toLocaleString("en-IN")}` },
          { label: "Payment Records", value: payments.length.toString() },
        ].map(s => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
              <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Payments ({payments.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Order</TableHead><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{(p.orders as any)?.order_number || "—"}</TableCell>
                  <TableCell>₹{Number(p.amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell>{p.method === "cash_on_delivery" ? "COD" : "Prepaid"}</TableCell>
                  <TableCell><Badge className={payStatusColors[p.status]} variant="secondary">{p.status}</Badge></TableCell>
                  <TableCell>{new Date(p.created_at).toLocaleDateString("en-IN")}</TableCell>
                </TableRow>
              ))}
              {payments.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No payments yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Wallet className="h-5 w-5 text-accent" /> Settlements ({settlements.length})</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>User</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {settlements.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.user_name}</TableCell>
                  <TableCell>₹{Number(s.amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Badge variant="secondary">{s.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    {s.status === "pending" && <Button size="sm" onClick={() => markSettled(s.id)}>Mark settled</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {settlements.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No settlements yet</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAPayments;