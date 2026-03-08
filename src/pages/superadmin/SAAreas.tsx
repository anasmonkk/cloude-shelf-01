import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SAAreas = () => {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase
      .from("areas")
      .select("id, name, area_panchayaths(panchayath_id, panchayaths(name))")
      .order("name");
    setAreas(data || []);
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
              <TableHead className="w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {areas.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-display font-medium">{a.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {(a.area_panchayaths || []).map((ap: any) => (
                      <Badge key={ap.panchayath_id} variant="secondary" className="text-xs">{ap.panchayaths?.name}</Badge>
                    ))}
                    {(!a.area_panchayaths || a.area_panchayaths.length === 0) && <span className="text-xs text-muted-foreground">None</span>}
                  </div>
                </TableCell>
                <TableCell><Button size="sm" variant="ghost" onClick={() => deleteArea(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
              </TableRow>
            ))}
            {areas.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No areas added</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SAAreas;
