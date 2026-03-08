import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, Users, Package, MapPin, CreditCard, Settings, ShoppingBag, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "Orders", path: "/admin/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Owners", path: "/admin/owners", icon: <Users className="h-4 w-4" /> },
  { label: "Delivery Staff", path: "/admin/delivery", icon: <Truck className="h-4 w-4" /> },
  { label: "Areas", path: "/admin/areas", icon: <MapPin className="h-4 w-4" /> },
  { label: "Payments", path: "/admin/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Items", path: "/admin/items", icon: <Package className="h-4 w-4" /> },
  { label: "Settlements", path: "/admin/settlements", icon: <Settings className="h-4 w-4" /> },
];

const stats = [
  { label: "Total Orders", value: "156", icon: ShoppingBag, change: "+12%" },
  { label: "Active Owners", value: "34", icon: Users, change: "+5" },
  { label: "Revenue", value: "₹48,200", icon: CreditCard, change: "+18%" },
  { label: "Areas", value: "4", icon: MapPin, change: "" },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard" role="Admin">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-5 w-5 text-primary" />
                {s.change && <span className="text-xs font-body text-success font-medium">{s.change}</span>}
              </div>
              <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground font-body">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Recent Orders</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { id: "ORD-156", status: "Waiting Confirmation", amount: "₹1,155" },
              { id: "ORD-155", status: "Delivered", amount: "₹760" },
              { id: "ORD-154", status: "Return Pending", amount: "₹2,180" },
            ].map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div>
                  <p className="text-sm font-display font-medium text-foreground">{o.id}</p>
                  <p className="text-xs text-muted-foreground font-body">{o.status}</p>
                </div>
                <span className="text-sm font-display font-semibold text-foreground">{o.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader><CardTitle className="font-display text-lg">Pending Settlements</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { name: "Priya's Collection", type: "Owner", amount: "₹4,500" },
              { name: "Rajan Tools", type: "Owner", amount: "₹1,200" },
              { name: "Arun (Delivery)", type: "Delivery", amount: "₹640" },
            ].map((s) => (
              <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div>
                  <p className="text-sm font-display font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground font-body">{s.type}</p>
                </div>
                <span className="text-sm font-display font-semibold text-accent">{s.amount}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
