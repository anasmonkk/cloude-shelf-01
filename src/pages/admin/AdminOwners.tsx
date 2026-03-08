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

const mockOwners = [
  { id: 1, name: "Priya's Collection", mobile: "9876543210", area: "Thrissur East", items: 12, status: "Active", joined: "2026-01-15" },
  { id: 2, name: "Rajan Tools", mobile: "9876543211", area: "Thrissur East", items: 8, status: "Active", joined: "2026-01-20" },
  { id: 3, name: "Kumar Electronics", mobile: "9876543212", area: "Kochi Metro", items: 15, status: "Active", joined: "2026-02-01" },
  { id: 4, name: "Furniture Hub", mobile: "9876543213", area: "Palakkad Central", items: 6, status: "Blocked", joined: "2026-02-10" },
  { id: 5, name: "Meena Jewellers", mobile: "9876543214", area: "Thrissur West", items: 20, status: "Active", joined: "2026-02-20" },
];

const AdminOwners = () => {
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const filtered = mockOwners.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) || o.mobile.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search owners..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="font-display"><UserPlus className="h-4 w-4 mr-2" /> Add Owner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-display">Add New Owner</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Shop / Business Name</Label>
                <Input placeholder="Enter business name" />
              </div>
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <Input placeholder="10-digit mobile" maxLength={10} />
              </div>
              <div className="space-y-2">
                <Label>Area</Label>
                <Input placeholder="Assign area" />
              </div>
              <Button className="w-full font-display" onClick={() => toast({ title: "Owner added", description: "New owner account created." })}>
                Create Owner Account
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Registered Owners</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead className="hidden md:table-cell">Area</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-display font-medium">{o.name}</TableCell>
                  <TableCell className="font-body">{o.mobile}</TableCell>
                  <TableCell className="hidden md:table-cell font-body text-muted-foreground">{o.area}</TableCell>
                  <TableCell className="font-display font-semibold">{o.items}</TableCell>
                  <TableCell>
                    <Badge className={o.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                      {o.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{o.joined}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost"><Eye className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost">
                        {o.status === "Active" ? <Ban className="h-4 w-4 text-destructive" /> : <CheckCircle className="h-4 w-4 text-emerald-600" />}
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

export default AdminOwners;
