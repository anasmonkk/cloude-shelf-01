import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminSettlements = () => {
  const [settlements, setSettlements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettlements = async () => {
    const { data } = await supabase
      .from("settlements")
      .select("id, amount, status, created_at, user_id, settled_at, profiles:user_id(full_name)")
      .order("created_at", { ascending: false });

    setSettlements(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSettlements(); }, []);

  const handleSettle = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("settlements")
      .update({ status: "settled" as any, settled_at: new Date().toISOString(), settled_by: user?.id })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settled", description: "Settlement marked as completed." });
      fetchSettlements();
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Settlements ({settlements.length})</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {settlements.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No settlements found</TableCell></TableRow>
              )}
              {settlements.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell className="font-display font-medium">{s.profiles?.full_name || "Unknown"}</TableCell>
                  <TableCell className="font-display font-semibold text-accent">₹{Number(s.amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell>
                    <Badge className={s.status === "settled" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                      {s.status === "settled" ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                      {s.status === "settled" ? "Settled" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{new Date(s.created_at).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    {s.status === "pending" && (
                      <Button size="sm" onClick={() => handleSettle(s.id)} className="font-display">Settle</Button>
                    )}
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

export default AdminSettlements;
