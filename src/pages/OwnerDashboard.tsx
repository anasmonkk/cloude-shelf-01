import DashboardLayout from "@/components/DashboardLayout";
import { Package, ShoppingBag, Wallet, User, TruckIcon, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const navItems = [
  { label: "Dashboard", path: "/owner", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "My Items", path: "/owner/items", icon: <Package className="h-4 w-4" /> },
  { label: "Orders", path: "/owner/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Wallet", path: "/owner/wallet", icon: <Wallet className="h-4 w-4" /> },
  { label: "Delivery Options", path: "/owner/delivery", icon: <TruckIcon className="h-4 w-4" /> },
  { label: "Profile", path: "/owner/profile", icon: <User className="h-4 w-4" /> },
];

const stats = [
  { label: "Active Listings", value: "12", icon: Package },
  { label: "Pending Orders", value: "3", icon: ShoppingBag },
  { label: "Earnings", value: "₹15,400", icon: Wallet },
  { label: "Completed", value: "47", icon: BarChart3 },
];

const OwnerDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="Owner Dashboard" role="Owner">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
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

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: "ORD-001", item: "Wedding Saree", customer: "Anjali", status: "Pending Acceptance", statusColor: "bg-warning" },
              { id: "ORD-002", item: "Power Drill", customer: "Rajesh", status: "Delivered", statusColor: "bg-success" },
              { id: "ORD-003", item: "DJ Speaker", customer: "Suresh", status: "Return Requested", statusColor: "bg-accent" },
            ].map((o) => (
              <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                <div>
                  <p className="text-sm font-display font-medium text-foreground">{o.item}</p>
                  <p className="text-xs text-muted-foreground font-body">{o.id} · {o.customer}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${o.statusColor} text-primary-foreground font-body font-medium`}>
                  {o.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
