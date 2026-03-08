import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe, MapPin, Plus, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SALocations = () => {
  const [states, setStates] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newState, setNewState] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [selectedStateId, setSelectedStateId] = useState("");
  const [stateDialogOpen, setStateDialogOpen] = useState(false);
  const [districtDialogOpen, setDistrictDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    const [statesRes, districtsRes] = await Promise.all([
      supabase.from("states").select("id, name").order("name"),
      supabase.from("districts").select("id, name, state_id, states(name)").order("name"),
    ]);
    setStates(statesRes.data || []);
    setDistricts(districtsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addState = async () => {
    if (!newState.trim()) return;
    const { error } = await supabase.from("states").insert({ name: newState.trim() });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "State added" });
    setNewState("");
    setStateDialogOpen(false);
    fetchData();
  };

  const addDistrict = async () => {
    if (!newDistrict.trim() || !selectedStateId) return;
    const { error } = await supabase.from("districts").insert({ name: newDistrict.trim(), state_id: selectedStateId });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "District added" });
    setNewDistrict("");
    setSelectedStateId("");
    setDistrictDialogOpen(false);
    fetchData();
  };

  const deleteState = async (id: string) => {
    const { error } = await supabase.from("states").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "State deleted" });
    fetchData();
  };

  const deleteDistrict = async (id: string) => {
    const { error } = await supabase.from("districts").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "District deleted" });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* States */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> States ({states.length})</CardTitle>
          <Dialog open={stateDialogOpen} onOpenChange={setStateDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add State</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add State</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>State Name</Label><Input value={newState} onChange={e => setNewState(e.target.value)} placeholder="e.g. Kerala" /></div>
                <Button className="w-full" onClick={addState}>Add State</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>State Name</TableHead><TableHead className="w-20">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {states.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-display font-medium">{s.name}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => deleteState(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
              {states.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No states added</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Districts */}
      <Card className="shadow-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-lg flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Districts ({districts.length})</CardTitle>
          <Dialog open={districtDialogOpen} onOpenChange={setDistrictDialogOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add District</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add District</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={selectedStateId} onValueChange={setSelectedStateId}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>{states.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>District Name</Label><Input value={newDistrict} onChange={e => setNewDistrict(e.target.value)} placeholder="e.g. Thrissur" /></div>
                <Button className="w-full" onClick={addDistrict}>Add District</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader><TableRow><TableHead>District</TableHead><TableHead>State</TableHead><TableHead className="w-20">Action</TableHead></TableRow></TableHeader>
            <TableBody>
              {districts.map(d => (
                <TableRow key={d.id}>
                  <TableCell className="font-display font-medium">{d.name}</TableCell>
                  <TableCell className="font-body text-muted-foreground">{(d.states as any)?.name || "—"}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" onClick={() => deleteDistrict(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                </TableRow>
              ))}
              {districts.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No districts added</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SALocations;
