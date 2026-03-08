import DashboardLayout from "@/components/DashboardLayout";
import { Globe, MapPin, Percent, BarChart3, Users, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", path: "/superadmin", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "States & Districts", path: "/superadmin/locations", icon: <Globe className="h-4 w-4" /> },
  { label: "Panchayaths", path: "/superadmin/panchayaths", icon: <MapPin className="h-4 w-4" /> },
  { label: "Areas", path: "/superadmin/areas", icon: <MapPin className="h-4 w-4" /> },
  { label: "Commission", path: "/superadmin/commission", icon: <Percent className="h-4 w-4" /> },
  { label: "Admin Accounts", path: "/superadmin/admins", icon: <Users className="h-4 w-4" /> },
  { label: "Analytics", path: "/superadmin/analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Settings", path: "/superadmin/settings", icon: <Settings className="h-4 w-4" /> },
];

const commissionRates = [
  { category: "Dress", rate: "15%" },
  { category: "Ornaments", rate: "20%" },
  { category: "Electronics", rate: "10%" },
  { category: "Tools", rate: "10%" },
  { category: "Furniture", rate: "12%" },
];

const SuperAdminDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="Super Admin" role="Super Admin">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "States", value: "1", icon: Globe },
          { label: "Districts", value: "3", icon: MapPin },
          { label: "Panchayaths", value: "8", icon: MapPin },
          { label: "Areas", value: "4", icon: MapPin },
        ].map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-body">{s.label}</p>
                <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Platform Commission Rates</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {commissionRates.map((c) => (
              <div key={c.category} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <span className="text-sm font-body font-medium text-foreground">{c.category}</span>
                <Badge variant="secondary" className="font-display font-semibold">{c.rate}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Location Hierarchy</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-sm font-display font-medium text-foreground">Kerala</p>
                <div className="mt-2 ml-4 space-y-2">
                  {["Thrissur", "Ernakulam", "Palakkad"].map((d) => (
                    <div key={d}>
                      <p className="text-xs font-body text-muted-foreground">📍 {d}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-secondary">
                <p className="text-sm font-display font-medium text-foreground">Areas</p>
                <div className="mt-2 ml-4 space-y-1">
                  {["Thrissur East (4 Panchayaths)", "Thrissur West (1 Panchayath)", "Kochi Metro (2 Panchayaths)", "Palakkad Central (1 Panchayath)"].map((a) => (
                    <p key={a} className="text-xs font-body text-muted-foreground">🗺️ {a}</p>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
