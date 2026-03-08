import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Percent, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SACommission = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    const { data } = await supabase.from("categories").select("id, name, commission_rate").order("name");
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addCategory = async () => {
    if (!newName.trim() || !newRate) return;
    const { error } = await supabase.from("categories").insert({ name: newName.trim(), commission_rate: parseFloat(newRate) });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Category added" });
    setNewName(""); setNewRate("");
    setDialogOpen(false);
    fetchData();
  };

  const updateRate = async (id: string) => {
    const { error } = await supabase.from("categories").update({ commission_rate: parseFloat(editRate) }).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Commission updated" });
    setEditingId(null);
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-lg flex items-center gap-2"><Percent className="h-5 w-5 text-primary" /> Commission Rates ({categories.length})</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Category</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Category Name</Label><Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Electronics" /></div>
              <div className="space-y-2"><Label>Commission Rate (%)</Label><Input type="number" value={newRate} onChange={e => setNewRate(e.target.value)} placeholder="e.g. 10" /></div>
              <Button className="w-full" onClick={addCategory}>Add Category</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Commission Rate</TableHead>
              <TableHead className="w-32">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-display font-medium">{c.name}</TableCell>
                <TableCell>
                  {editingId === c.id ? (
                    <Input type="number" value={editRate} onChange={e => setEditRate(e.target.value)} className="w-24" />
                  ) : (
                    <Badge variant="secondary" className="font-display font-semibold">{c.commission_rate}%</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {editingId === c.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => updateRate(c.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => { setEditingId(c.id); setEditRate(c.commission_rate.toString()); }}>Edit</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No categories added</TableCell></TableRow>}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SACommission;
