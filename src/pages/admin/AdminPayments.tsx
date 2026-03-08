import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CreditCard, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

const mockPayments = [
  { id: "PAY-089", order: "ORD-156", customer: "Arun Kumar", amount: "₹1,155", method: "UPI", status: "Completed", date: "2026-03-08" },
  { id: "PAY-088", order: "ORD-155", customer: "Meera S", amount: "₹760", method: "Cash", status: "Completed", date: "2026-03-07" },
  { id: "PAY-087", order: "ORD-154", customer: "Suresh P", amount: "₹2,180", method: "UPI", status: "Refund Pending", date: "2026-03-06" },
  { id: "PAY-086", order: "ORD-153", customer: "Deepa M", amount: "₹450", method: "UPI", status: "Completed", date: "2026-03-06" },
];

const AdminPayments = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: "₹48,200", icon: CreditCard, change: "+18%", up: true },
          { label: "Platform Commission", value: "₹7,230", icon: TrendingUp, change: "+22%", up: true },
          { label: "Owner Payouts", value: "₹36,400", icon: ArrowUpRight, change: "+15%", up: true },
          { label: "Refunds", value: "₹4,570", icon: ArrowDownRight, change: "-8%", up: false },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-5 w-5 text-primary" />
                <span className={`text-xs font-medium ${s.up ? "text-emerald-600" : "text-destructive"}`}>{s.change}</span>
              </div>
              <p className="text-lg font-display font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Recent Payments</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ID</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="hidden md:table-cell">Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="hidden md:table-cell">Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-display font-medium">{p.id}</TableCell>
                  <TableCell className="font-body text-primary">{p.order}</TableCell>
                  <TableCell className="hidden md:table-cell font-body">{p.customer}</TableCell>
                  <TableCell className="font-display font-semibold">{p.amount}</TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="secondary">{p.method}</Badge></TableCell>
                  <TableCell>
                    <Badge className={p.status === "Completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{p.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
