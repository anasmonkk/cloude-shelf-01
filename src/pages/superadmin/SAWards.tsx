import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SAWards = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [panRes, wardRes] = await Promise.all([
        supabase.from("panchayaths").select("id, name, ward_count, districts(name)").order("name"),
        supabase.from("wards").select("id, ward_number, panchayath_id").order("ward_number"),
      ]);
      const wards = wardRes.data || [];
      setGroups((panRes.data || []).map(p => ({
        ...p,
        wards: wards.filter(w => w.panchayath_id === p.id),
      })));
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const filtered = groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search panchayath" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {filtered.map(g => (
        <Card key={g.id} className="shadow-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> {g.name}
              <span className="text-xs font-body font-normal text-muted-foreground">{(g.districts as any)?.name} · {g.wards.length} wards</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {g.wards.map((w: any) => <Badge key={w.id} variant="secondary">Ward {w.ward_number}</Badge>)}
            {g.wards.length === 0 && <p className="text-sm text-muted-foreground">No wards generated</p>}
          </CardContent>
        </Card>
      ))}
      {filtered.length === 0 && <p className="text-sm text-muted-foreground">No panchayaths found</p>}
    </div>
  );
};

export default SAWards;