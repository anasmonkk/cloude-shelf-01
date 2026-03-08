import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Plus, Trash2, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SAAreas = () => {
  const [areas, setAreas] = useState<any[]>([]);
  const [panchayaths, setPanchayaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    const [aRes, pRes] = await Promise.all([
      supabase.from("areas").select("id, name, area_panchayaths(id, panchayath_id, panchayaths(name))").order("name"),
      supabase.from("panchayaths").select("id, name, districts(name)").order("name"),
    ]);
    setAreas(aRes.data || []);
    setPanchayaths(pRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addArea = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from("areas").insert({ name: newName.trim() });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Area added" });
    setNewName("");
    setDialogOpen(false);
    fetchData();
  };

  const deleteArea = async (id: string) => {
    const { error } = await supabase.from("areas").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Area deleted" });
    fetchData();
  };

  const addPanchayathToArea = async (areaId: string, panchayathId: string) => {
    const { error } = await supabase.from("area_panchayaths").insert({ area_id: areaId, panchayath_id: panchayathId });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Panchayath added to area" });
    fetchData();
  };

  const removePanchayathFromArea = async (linkId: string) => {
    const { error } = await supabase.from("area_panchayaths").delete().eq("id", linkId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Panchayath removed" });
    fetchData();
  };

  const getAvailablePanchayaths = (area: any) => {
    const assignedIds = (area.area_panchayaths || []).map((ap: any) => ap.panchayath_id);
    return panchayaths.filter(p => !assignedIds.includes(p.id));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Areas ({areas.length})</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Area</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Area</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Area Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Thrissur East" /></div>
              <Button className="w-full" onClick={addArea}>Add Area</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Area Name</TableHead>
              <TableHead>Panchayaths</TableHead>
              <TableHead className="w-48">Add Panchayath</TableHead>
              <TableHead className="w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map(a => {
              const available = getAvailablePanchayaths(a);
              return (
                <TableRow key={a.id}>
                  <TableCell className="font-display font-medium">{a.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(a.area_panchayaths || []).map((ap: any) => (
                        <Badge key={ap.panchayath_id} variant="secondary" className="text-xs flex items-center gap-1">
                          {ap.panchayaths?.name}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removePanchayathFromArea(ap.id)} />
                        </Badge>
                      ))}
                      {(!a.area_panchayaths || a.area_panchayaths.length === 0) && <span className="text-xs text-muted-foreground">None</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select onValueChange={(val) => addPanchayathToArea(a.id, val)} value="">
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select panchayath" />
                      </SelectTrigger>
                      <SelectContent>
                        {available.map(p => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">
                            {p.name} {(p.districts as any)?.name ? `(${(p.districts as any).name})` : ""}
                          </SelectItem>
                        ))}
                        {available.length === 0 && <div className="px-2 py-1 text-xs text-muted-foreground">All assigned</div>}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => deleteArea(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              );
            })}
            {areas.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No areas added</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SAAreas;
