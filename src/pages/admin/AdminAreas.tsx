import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AdminAreas = () => {
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAreas = async () => {
      const { data } = await supabase
        .from("areas")
        .select("id, name, area_panchayaths(panchayath_id, panchayaths(name))")
        .order("name");

      const areaList = (data || []).map(a => ({
        id: a.id,
        name: a.name,
        panchayaths: (a.area_panchayaths || []).map((ap: any) => ap.panchayaths?.name).filter(Boolean),
      }));

      setAreas(areaList);
      setLoading(false);
    };
    fetchAreas();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {areas.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-8">No areas found</p>}
        {areas.map((area) => (
          <Card key={area.id} className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> {area.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs font-body text-muted-foreground mb-2">Panchayaths ({area.panchayaths.length}):</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.panchayaths.length === 0 && <span className="text-xs text-muted-foreground">None assigned</span>}
                  {area.panchayaths.map((p: string) => (
                    <Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminAreas;
