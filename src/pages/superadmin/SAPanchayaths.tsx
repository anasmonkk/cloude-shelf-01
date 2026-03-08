import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SAPanchayaths = () => {
  const [panchayaths, setPanchayaths] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newWardCount, setNewWardCount] = useState("0");
  const [selectedDistrictId, setSelectedDistrictId] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    const [pRes, dRes] = await Promise.all([
      supabase.from("panchayaths").select("id, name, ward_count, district_id, districts(name)").order("name"),
      supabase.from("districts").select("id, name").order("name"),
    ]);
    setPanchayaths(pRes.data || []);
    setDistricts(dRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addPanchayath = async () => {
    if (!newName.trim() || !selectedDistrictId) return;
    const { error } = await supabase.from("panchayaths").insert({
      name: newName.trim(),
      district_id: selectedDistrictId,
      ward_count: parseInt(newWardCount) || 0,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Panchayath added" });
    setNewName(""); setNewWardCount("0"); setSelectedDistrictId("");
    setDialogOpen(false);
    fetchData();
  };

  const deletePanchayath = async (id: string) => {
    const { error } = await supabase.from("panchayaths").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Panchayath deleted" });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Panchayaths ({panchayaths.length})</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Panchayath</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Panchayath</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>District</Label>
                <Select value={selectedDistrictId} onValueChange={setSelectedDistrictId}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>{districts.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Panchayath Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Ayyanthole" /></div>
              <div className="space-y-2"><Label>Ward Count</Label><Input type="number" value={newWardCount} onChange={e => setNewWardCount(e.target.value)} placeholder="0" /></div>
              <Button className="w-full" onClick={addPanchayath}>Add Panchayath</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Panchayath</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Wards</TableHead>
              <TableHead className="w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {panchayaths.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-display font-medium">{p.name}</TableCell>
                <TableCell className="font-body text-muted-foreground">{(p.districts as any)?.name || "—"}</TableCell>
                <TableCell><Badge variant="secondary">{p.ward_count}</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deletePanchayath(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
            {panchayaths.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No panchayaths added</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SAPanchayaths;
