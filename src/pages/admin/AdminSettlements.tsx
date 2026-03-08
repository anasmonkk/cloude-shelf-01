import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ownerSettlements = [
  { id: "SET-045", name: "Priya's Collection", amount: "₹4,500", orders: 8, status: "Pending" },
  { id: "SET-044", name: "Rajan Tools", amount: "₹1,200", orders: 3, status: "Pending" },
  { id: "SET-043", name: "Kumar Electronics", amount: "₹2,800", orders: 5, status: "Settled" },
  { id: "SET-042", name: "Meena Jewellers", amount: "₹3,600", orders: 6, status: "Settled" },
];

const deliverySettlements = [
  { id: "DSET-022", name: "Arun V", amount: "₹640", trips: 12, status: "Pending" },
  { id: "DSET-021", name: "Biju K", amount: "₹480", trips: 9, status: "Pending" },
  { id: "DSET-020", name: "Deepak M", amount: "₹720", trips: 14, status: "Settled" },
];

const AdminSettlements = () => {
  const { toast } = useToast();

  const handleSettle = (id: string) => {
    toast({ title: "Settlement processed", description: `${id} has been marked as settled.` });
  };

  return (
    <Tabs defaultValue="owners" className="space-y-4">
      <TabsList>
        <TabsTrigger value="owners" className="font-display">Owner Settlements</TabsTrigger>
        <TabsTrigger value="delivery" className="font-display">Delivery Settlements</TabsTrigger>
      </TabsList>

      <TabsContent value="owners">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Owner Settlements</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ownerSettlements.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-display font-medium">{s.id}</TableCell>
                    <TableCell className="font-body">{s.name}</TableCell>
                    <TableCell className="font-display">{s.orders}</TableCell>
                    <TableCell className="font-display font-semibold text-accent">{s.amount}</TableCell>
                    <TableCell>
                      <Badge className={s.status === "Settled" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {s.status === "Settled" ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.status === "Pending" && (
                        <Button size="sm" onClick={() => handleSettle(s.id)} className="font-display">Settle</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="delivery">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Delivery Staff Settlements</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Trips</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliverySettlements.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-display font-medium">{s.id}</TableCell>
                    <TableCell className="font-body">{s.name}</TableCell>
                    <TableCell className="font-display">{s.trips}</TableCell>
                    <TableCell className="font-display font-semibold text-accent">{s.amount}</TableCell>
                    <TableCell>
                      <Badge className={s.status === "Settled" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {s.status === "Settled" ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {s.status === "Pending" && (
                        <Button size="sm" onClick={() => handleSettle(s.id)} className="font-display">Settle</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AdminSettlements;
