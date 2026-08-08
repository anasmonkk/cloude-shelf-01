import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  staffId: string | null;
  staffName?: string;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

const DeliveryLocationsDialog = ({ staffId, staffName, onOpenChange, onSaved }: Props) => {
  const [panchayaths, setPanchayaths] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (!staffId) return;
    setLoading(true);
    (async () => {
      const [panRes, wardRes, mineRes] = await Promise.all([
        supabase.from("panchayaths").select("id, name, districts(name)").order("name"),
        supabase.from("wards").select("id, ward_number, panchayath_id").order("ward_number"),
        supabase.from("delivery_staff_wards").select("ward_id").eq("staff_id", staffId),
      ]);
      setPanchayaths(panRes.data || []);
      setWards(wardRes.data || []);
      setSelected(new Set((mineRes.data || []).map((r: any) => r.ward_id)));
      setLoading(false);
    })();
  }, [staffId]);

  const toggleWard = (wardId: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(wardId) ? next.delete(wardId) : next.add(wardId);
      return next;
    });
  };

  const togglePanchayath = (panchayathId: string, allSelected: boolean) => {
    const ids = wards.filter(w => w.panchayath_id === panchayathId).map(w => w.id);
    setSelected(prev => {
      const next = new Set(prev);
      ids.forEach(id => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const save = async () => {
    if (!staffId) return;
    setSaving(true);
    const wardMap = Object.fromEntries(wards.map(w => [w.id, w.panchayath_id]));
    const rows = Array.from(selected).map(wardId => ({
      staff_id: staffId,
      ward_id: wardId,
      panchayath_id: wardMap[wardId],
    }));
    const { error: delError } = await supabase.from("delivery_staff_wards").delete().eq("staff_id", staffId);
    if (delError) {
      setSaving(false);
      toast({ title: "Error", description: delError.message, variant: "destructive" });
      return;
    }
    if (rows.length > 0) {
      const { error } = await supabase.from("delivery_staff_wards").insert(rows);
      if (error) {
        setSaving(false);
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    }
    setSaving(false);
    toast({ title: "Pickup locations saved", description: `${rows.length} ward(s) assigned.` });
    onOpenChange(false);
    onSaved?.();
  };

  const filtered = panchayaths.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dialog open={!!staffId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Pickup Locations {staffName ? `— ${staffName}` : ""}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search panchayath" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <Badge variant="secondary" className="w-fit">{selected.size} ward(s) selected</Badge>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {filtered.map(p => {
                const pWards = wards.filter(w => w.panchayath_id === p.id);
                const allSelected = pWards.length > 0 && pWards.every(w => selected.has(w.id));
                return (
                  <div key={p.id} className="rounded-lg border border-border p-3 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox checked={allSelected} onCheckedChange={() => togglePanchayath(p.id, allSelected)} />
                      <span className="font-display font-medium text-sm">{p.name}</span>
                      <span className="text-xs text-muted-foreground font-body">{(p.districts as any)?.name}</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pl-6">
                      {pWards.length === 0 && <span className="text-xs text-muted-foreground">No wards</span>}
                      {pWards.map(w => (
                        <label key={w.id} className="flex items-center gap-1.5 text-xs font-body cursor-pointer rounded-md border border-border px-2 py-1">
                          <Checkbox checked={selected.has(w.id)} onCheckedChange={() => toggleWard(w.id)} />
                          Ward {w.ward_number}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground">No panchayaths found</p>}
            </div>
            <DialogFooter>
              <Button className="w-full font-display font-semibold" onClick={save} disabled={saving}>
                {saving ? "Saving..." : "Save Locations"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryLocationsDialog;
