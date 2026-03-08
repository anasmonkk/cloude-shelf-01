import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, UserPlus, Eye, Ban, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const mockStaff = [
  { id: 1, name: "Arun V", mobile: "9876543220", area: "Thrissur East", deliveries: 45, wallet: "₹2,340", status: "Active" },
  { id: 2, name: "Biju K", mobile: "9876543221", area: "Thrissur West", deliveries: 32, wallet: "₹1,890", status: "Active" },
  { id: 3, name: "Deepak M", mobile: "9876543222", area: "Kochi Metro", deliveries: 58, wallet: "₹3,120", status: "Active" },
  { id: 4, name: "Faisal N", mobile: "9876543223", area: "Palakkad Central", deliveries: 12, wallet: "₹640", status: "Blocked" },
];

const AdminDelivery = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filtered = mockStaff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.mobile.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search delivery staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="font-display"><UserPlus className="h-4 w-4 mr-2" /> Add Staff</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add Delivery Staff</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Full Name</Label><Input placeholder="Enter name" /></div>
              <div className="space-y-2"><Label>Mobile Number</Label><Input placeholder="10-digit mobile" maxLength={10} /></div>
              <div className="space-y-2"><Label>Assigned Area</Label><Input placeholder="Select area" /></div>
              <Button className="w-full font-display" onClick={() => toast({ title: "Staff added", description: "Delivery staff account created." })}>
                Create Staff Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Delivery Staff</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead>Deliveries</TableHead>
                <TableHead className="hidden md:table-cell">Wallet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-display font-medium">{s.name}</TableCell>
                  <TableCell className="font-body">{s.mobile}</TableCell>
                  <TableCell className="hidden md:table-cell font-body text-muted-foreground">{s.area}</TableCell>
                  <TableCell className="font-display font-semibold">{s.deliveries}</TableCell>
                  <TableCell className="hidden md:table-cell font-display font-semibold text-accent">{s.wallet}</TableCell>
                  <TableCell>
                    <Badge className={s.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>{s.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost">
                        {s.status === "Active" ? <Ban className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
                      </Button>
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

export default AdminDelivery;
