import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, Filter } from "lucide-react";

const mockOrders = [
  { id: "ORD-156", customer: "Arun Kumar", owner: "Priya's Collection", item: "Gold Necklace Set", amount: "₹1,155", status: "Waiting Confirmation", date: "2026-03-08" },
  { id: "ORD-155", customer: "Meera S", owner: "Rajan Tools", item: "Drill Machine", amount: "₹760", status: "Delivered", date: "2026-03-07" },
  { id: "ORD-154", customer: "Suresh P", owner: "Priya's Collection", item: "Bridal Saree", amount: "₹2,180", status: "Return Pending", date: "2026-03-06" },
  { id: "ORD-153", customer: "Deepa M", owner: "Kumar Electronics", item: "Speaker System", amount: "₹450", status: "In Transit", date: "2026-03-06" },
  { id: "ORD-152", customer: "Rajesh T", owner: "Furniture Hub", item: "Event Table Set", amount: "₹1,800", status: "Returned", date: "2026-03-05" },
  { id: "ORD-151", customer: "Anitha R", owner: "Priya's Collection", item: "Diamond Earrings", amount: "₹950", status: "Delivered", date: "2026-03-04" },
];

const statusColors: Record<string, string> = {
  "Waiting Confirmation": "bg-amber-100 text-amber-800",
  "Delivered": "bg-emerald-100 text-emerald-800",
  "Return Pending": "bg-orange-100 text-orange-800",
  "In Transit": "bg-blue-100 text-blue-800",
  "Returned": "bg-gray-100 text-gray-800",
};

const AdminOrders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = mockOrders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by Order ID or Customer..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Waiting Confirmation">Waiting Confirmation</SelectItem>
            <SelectItem value="In Transit">In Transit</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Return Pending">Return Pending</SelectItem>
            <SelectItem value="Returned">Returned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden md:table-cell">Owner</TableHead>
                <TableHead className="hidden lg:table-cell">Item</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-display font-medium">{o.id}</TableCell>
                  <TableCell className="font-body">{o.customer}</TableCell>
                  <TableCell className="hidden md:table-cell font-body text-muted-foreground">{o.owner}</TableCell>
                  <TableCell className="hidden lg:table-cell font-body text-muted-foreground">{o.item}</TableCell>
                  <TableCell className="font-display font-semibold">{o.amount}</TableCell>
                  <TableCell><Badge className={statusColors[o.status] || ""}>{o.status}</Badge></TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{o.date}</TableCell>
                  <TableCell><Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
