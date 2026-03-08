import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, CheckCircle, XCircle } from "lucide-react";

const mockItems = [
  { id: 1, name: "Gold Necklace Set", owner: "Priya's Collection", category: "Ornaments", price: "₹800", commission: "₹160", status: "Active" },
  { id: 2, name: "Drill Machine", owner: "Rajan Tools", category: "Tools", price: "₹500", commission: "₹50", status: "Active" },
  { id: 3, name: "Bridal Saree", owner: "Priya's Collection", category: "Dress", price: "₹1,500", commission: "₹225", status: "Pending Approval" },
  { id: 4, name: "Speaker System", owner: "Kumar Electronics", category: "Electronics", price: "₹300", commission: "₹30", status: "Active" },
  { id: 5, name: "Event Table Set", owner: "Furniture Hub", category: "Furniture", price: "₹1,200", commission: "₹144", status: "Pending Approval" },
  { id: 6, name: "Diamond Earrings", owner: "Meena Jewellers", category: "Ornaments", price: "₹650", commission: "₹130", status: "Active" },
];

const AdminItems = () => {
  const [search, setSearch] = useState("");

  const filtered = mockItems.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) || i.owner.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search items or owners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">All Items</CardTitle></CardHeader>
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
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-display font-medium">{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell font-body text-muted-foreground">{item.owner}</TableCell>
                  <TableCell><Badge variant="secondary">{item.category}</Badge></TableCell>
                  <TableCell className="font-display font-semibold">{item.price}</TableCell>
                  <TableCell className="hidden md:table-cell font-display text-accent font-semibold">{item.commission}</TableCell>
                  <TableCell>
                    <Badge className={item.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      {item.status === "Pending Approval" && (
                        <>
                          <Button size="sm" variant="ghost"><CheckCircle className="h-4 w-4 text-emerald-600" /></Button>
                          <Button size="sm" variant="ghost"><XCircle className="h-4 w-4 text-destructive" /></Button>
                        </>
                      )}
                    </div>
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

export default AdminItems;
