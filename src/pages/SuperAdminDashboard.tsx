import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Globe, MapPin, Percent, BarChart3, Users, Settings, Package, ShoppingCart, Truck, Layers, Loader2, CreditCard, UserCog, IndianRupee } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import SALocations from "./superadmin/SALocations";
import SAPanchayaths from "./superadmin/SAPanchayaths";
import SAAreas from "./superadmin/SAAreas";
import SACommission from "./superadmin/SACommission";
import SAAdmins from "./superadmin/SAAdmins";
import SASettings from "./superadmin/SASettings";
import SAUsers from "./superadmin/SAUsers";
import SAOrders from "./superadmin/SAOrders";
import SAItems from "./superadmin/SAItems";
import SAPayments from "./superadmin/SAPayments";
import SAWards from "./superadmin/SAWards";

const pageTitles: Record<string, string> = {
  "/superadmin": "Super Admin Dashboard",
  "/superadmin/locations": "States & Districts",
  "/superadmin/panchayaths": "Panchayaths",
  "/superadmin/areas": "Areas",
  "/superadmin/wards": "Wards",
  "/superadmin/commission": "Commission Rates",
  "/superadmin/admins": "Admin Accounts",
  "/superadmin/users": "All Users",
  "/superadmin/orders": "Orders",
  "/superadmin/items": "Items",
  "/superadmin/payments": "Payments & Settlements",
  "/superadmin/settings": "Settings",
};

// Dashboard Home with live stats
const DashboardHome = () => {
  const [stats, setStats] = useState({ states: 0, districts: 0, panchayaths: 0, areas: 0, wards: 0, orders: 0, items: 0, admins: 0, owners: 0, delivery: 0, customers: 0 });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statesRes, districtsRes, panchayathsRes, areasRes, wardsRes, ordersRes, itemsRes, rolesRes, categoriesRes] = await Promise.all([
        supabase.from("states").select("id", { count: "exact", head: true }),
        supabase.from("districts").select("id", { count: "exact", head: true }),
        supabase.from("panchayaths").select("id", { count: "exact", head: true }),
        supabase.from("areas").select("id", { count: "exact", head: true }),
        supabase.from("wards").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("items").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("categories").select("name, commission_rate").order("name"),
      ]);

      const roles = rolesRes.data || [];
      setStats({
        states: statesRes.count || 0, districts: districtsRes.count || 0, panchayaths: panchayathsRes.count || 0,
        areas: areasRes.count || 0, wards: wardsRes.count || 0, orders: ordersRes.count || 0, items: itemsRes.count || 0,
        admins: roles.filter(r => r.role === "admin").length, owners: roles.filter(r => r.role === "owner").length,
        delivery: roles.filter(r => r.role === "delivery").length, customers: roles.filter(r => r.role === "customer").length,
      });
      setCategories(categoriesRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider mb-3">Location Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "States", value: stats.states, icon: Globe },
            { label: "Districts", value: stats.districts, icon: MapPin },
            { label: "Panchayaths", value: stats.panchayaths, icon: Layers },
            { label: "Wards", value: stats.wards, icon: MapPin },
            { label: "Areas", value: stats.areas, icon: MapPin },
          ].map(s => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-body truncate">{s.label}</p>
                  <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-body font-medium text-muted-foreground uppercase tracking-wider mb-3">Platform Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { label: "Admins", value: stats.admins, icon: Users },
            { label: "Vendors", value: stats.owners, icon: Package },
            { label: "Customers", value: stats.customers, icon: Users },
            { label: "Delivery Staff", value: stats.delivery, icon: Truck },
            { label: "Orders", value: stats.orders, icon: ShoppingCart },
          ].map(s => (
            <Card key={s.label} className="shadow-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                  <s.icon className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-body truncate">{s.label}</p>
                  <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Commission summary */}
      <Card className="shadow-card max-w-md">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2"><Percent className="h-4 w-4 text-primary" /> Commission Rates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map(c => (
            <div key={c.name} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary">
              <span className="text-sm font-body font-medium text-foreground">{c.name}</span>
              <Badge variant="secondary" className="font-display font-semibold">{c.commission_rate}%</Badge>
            </div>
          ))}
          {categories.length === 0 && <p className="text-sm text-muted-foreground">No categories configured</p>}
        </CardContent>
      </Card>
    </div>
  );
};

const SuperAdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const title = pageTitles[path] || "Super Admin Dashboard";

  const renderContent = () => {
    switch (path) {
      case "/superadmin/locations": return <SALocations />;
      case "/superadmin/panchayaths": return <SAPanchayaths />;
      case "/superadmin/areas": return <SAAreas />;
      case "/superadmin/commission": return <SACommission />;
      case "/superadmin/admins": return <SAAdmins />;
      case "/superadmin/settings": return <SASettings />;
      default: return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout navItems={navItems} title={title} role="Super Admin">
      {renderContent()}
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
