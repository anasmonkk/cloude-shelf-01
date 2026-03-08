import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, Users, Package, MapPin, CreditCard, Settings, ShoppingBag, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AdminOrders from "./admin/AdminOrders";
import AdminOwners from "./admin/AdminOwners";
import AdminDelivery from "./admin/AdminDelivery";
import AdminAreas from "./admin/AdminAreas";
import AdminPayments from "./admin/AdminPayments";
import AdminItems from "./admin/AdminItems";
import AdminSettlements from "./admin/AdminSettlements";

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

const DashboardHome = () => (
  <>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((s) => (
        <Card key={s.label} className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <s.icon className="h-5 w-5 text-primary" />
              {s.change && <span className="text-xs font-body text-emerald-600 font-medium">{s.change}</span>}
            </div>
            <p className="text-lg font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground font-body">{s.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="shadow-card">
        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3">Recent Orders</h3>
          <div className="space-y-2">
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
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4">
          <h3 className="font-display font-semibold text-lg mb-3">Pending Settlements</h3>
          <div className="space-y-2">
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
          </div>
        </CardContent>
      </Card>
    </div>
  </>
);

const pageTitles: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/orders": "Orders Management",
  "/admin/owners": "Owners Management",
  "/admin/delivery": "Delivery Staff",
  "/admin/areas": "Areas",
  "/admin/payments": "Payments",
  "/admin/items": "Items Management",
  "/admin/settlements": "Settlements",
};

const AdminDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const title = pageTitles[path] || "Admin Dashboard";

  const renderContent = () => {
    switch (path) {
      case "/admin/orders": return <AdminOrders />;
      case "/admin/owners": return <AdminOwners />;
      case "/admin/delivery": return <AdminDelivery />;
      case "/admin/areas": return <AdminAreas />;
      case "/admin/payments": return <AdminPayments />;
      case "/admin/items": return <AdminItems />;
      case "/admin/settlements": return <AdminSettlements />;
      default: return <DashboardHome />;
    }
  };

  return (
    <DashboardLayout navItems={navItems} title={title} role="Admin">
      {renderContent()}
    </DashboardLayout>
  );
};

export default AdminDashboard;
