import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Globe, MapPin, Percent, BarChart3, Users, Settings, Package, ShoppingCart, Truck, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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

interface Stats {
  states: number;
  districts: number;
  panchayaths: number;
  areas: number;
  wards: number;
  orders: number;
  items: number;
  admins: number;
  owners: number;
  delivery: number;
  customers: number;
}

interface Category {
  name: string;
  commission_rate: number;
}

interface LocationData {
  state: string;
  district: string | null;
}

interface AreaData {
  name: string;
  panchayath_count: number;
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ states: 0, districts: 0, panchayaths: 0, areas: 0, wards: 0, orders: 0, items: 0, admins: 0, owners: 0, delivery: 0, customers: 0 });
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [areas, setAreas] = useState<AreaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statesRes, districtsRes, panchayathsRes, areasRes, wardsRes, ordersRes, itemsRes, rolesRes, categoriesRes, locationsRes, areaPanchRes] = await Promise.all([
        supabase.from("states").select("id", { count: "exact", head: true }),
        supabase.from("districts").select("id", { count: "exact", head: true }),
        supabase.from("panchayaths").select("id", { count: "exact", head: true }),
        supabase.from("areas").select("id", { count: "exact", head: true }),
        supabase.from("wards").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("items").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("categories").select("name, commission_rate").order("name"),
        supabase.from("districts").select("name, states(name)"),
        supabase.from("areas").select("name, area_panchayaths(id)"),
      ]);

      const roles = rolesRes.data || [];
      setStats({
        states: statesRes.count || 0,
        districts: districtsRes.count || 0,
        panchayaths: panchayathsRes.count || 0,
        areas: areasRes.count || 0,
        wards: wardsRes.count || 0,
        orders: ordersRes.count || 0,
        items: itemsRes.count || 0,
        admins: roles.filter((r) => r.role === "admin").length,
        owners: roles.filter((r) => r.role === "owner").length,
        delivery: roles.filter((r) => r.role === "delivery").length,
        customers: roles.filter((r) => r.role === "customer").length,
      });

      setCategories((categoriesRes.data as Category[]) || []);

      // Group locations by state
      const locs: LocationData[] = (locationsRes.data || []).map((d: any) => ({
        state: d.states?.name || "Unknown",
        district: d.name,
      }));
      setLocations(locs);

      // Areas with panchayath count
      const areaData: AreaData[] = (areaPanchRes.data || []).map((a: any) => ({
        name: a.name,
        panchayath_count: a.area_panchayaths?.length || 0,
      }));
      setAreas(areaData);

      setLoading(false);
    };
    fetchData();
  }, []);

  // Group locations by state
  const stateMap = locations.reduce<Record<string, string[]>>((acc, loc) => {
    if (!acc[loc.state]) acc[loc.state] = [];
    if (loc.district) acc[loc.state].push(loc.district);
    return acc;
  }, {});

  return (
    <DashboardLayout navItems={navItems} title="Super Admin" role="Super Admin">
      <div className="space-y-6">
        {/* Location Stats */}
        <div>
          <h2 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider mb-3">Location Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "States", value: stats.states, icon: Globe, color: "text-primary" },
              { label: "Districts", value: stats.districts, icon: MapPin, color: "text-primary" },
              { label: "Panchayaths", value: stats.panchayaths, icon: Layers, color: "text-primary" },
              { label: "Wards", value: stats.wards, icon: MapPin, color: "text-primary" },
              { label: "Areas", value: stats.areas, icon: MapPin, color: "text-accent" },
            ].map((s) => (
              <Card key={s.label} className="shadow-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-body truncate">{s.label}</p>
                    <p className="text-xl font-display font-bold text-foreground">{loading ? "–" : s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Platform Stats */}
        <div>
          <h2 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider mb-3">Platform Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Admins", value: stats.admins, icon: Users },
              { label: "Owners", value: stats.owners, icon: Package },
              { label: "Customers", value: stats.customers, icon: Users },
              { label: "Delivery Staff", value: stats.delivery, icon: Truck },
              { label: "Orders", value: stats.orders, icon: ShoppingCart },
            ].map((s) => (
              <Card key={s.label} className="shadow-card">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <s.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-body truncate">{s.label}</p>
                    <p className="text-xl font-display font-bold text-foreground">{loading ? "–" : s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Bottom Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Commission Rates */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                Commission Rates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((c) => (
                <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary">
                  <span className="text-sm font-body font-medium text-foreground">{c.name}</span>
                  <Badge variant="secondary" className="font-display font-semibold">{c.commission_rate}%</Badge>
                </div>
              ))}
              {categories.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground font-body">No categories configured</p>
              )}
            </CardContent>
          </Card>

          {/* Location Hierarchy */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                Location Hierarchy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stateMap).map(([state, districts]) => (
                  <div key={state} className="p-3 rounded-lg bg-secondary">
                    <p className="text-sm font-display font-semibold text-foreground">{state}</p>
                    <div className="mt-2 ml-3 space-y-1">
                      {districts.map((d) => (
                        <p key={d} className="text-xs font-body text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-primary/60" /> {d}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(stateMap).length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground font-body">No locations added</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Areas */}
          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {areas.map((a) => (
                  <div key={a.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary">
                    <span className="text-sm font-body font-medium text-foreground">{a.name}</span>
                    <span className="text-xs font-body text-muted-foreground">
                      {a.panchayath_count} panchayath{a.panchayath_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
                {areas.length === 0 && !loading && (
                  <p className="text-sm text-muted-foreground font-body">No areas configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
