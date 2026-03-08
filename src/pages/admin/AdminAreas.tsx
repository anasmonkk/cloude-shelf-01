import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Truck, Package } from "lucide-react";

const mockAreas = [
  { name: "Thrissur East", panchayaths: ["Ayyanthole", "Ollur", "Nadathara", "Vilvattom"], owners: 12, delivery: 3, orders: 56 },
  { name: "Thrissur West", panchayaths: ["Chavakkad"], owners: 5, delivery: 1, orders: 18 },
  { name: "Kochi Metro", panchayaths: ["Kalamassery", "Thrikkakara"], owners: 10, delivery: 4, orders: 42 },
  { name: "Palakkad Central", panchayaths: ["Palakkad Municipality"], owners: 7, delivery: 2, orders: 28 },
];

const AdminAreas = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockAreas.map((area) => (
          <Card key={area.name} className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> {area.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1 text-muted-foreground"><Users className="h-3.5 w-3.5" /> {area.owners} Owners</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Truck className="h-3.5 w-3.5" /> {area.delivery} Staff</span>
                <span className="flex items-center gap-1 text-muted-foreground"><Package className="h-3.5 w-3.5" /> {area.orders} Orders</span>
              </div>
              <div>
                <p className="text-xs font-body text-muted-foreground mb-2">Panchayaths:</p>
                <div className="flex flex-wrap gap-1.5">
                  {area.panchayaths.map((p) => (
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
