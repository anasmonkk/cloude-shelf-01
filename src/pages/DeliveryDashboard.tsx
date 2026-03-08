import DashboardLayout from "@/components/DashboardLayout";
import { Truck, Package, Wallet, User, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Available Orders", path: "/delivery", icon: <Bell className="h-4 w-4" /> },
  { label: "My Deliveries", path: "/delivery/active", icon: <Truck className="h-4 w-4" /> },
  { label: "Wallet", path: "/delivery/wallet", icon: <Wallet className="h-4 w-4" /> },
  { label: "Profile", path: "/delivery/profile", icon: <User className="h-4 w-4" /> },
];

const DeliveryDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="Available Orders" role="Delivery Staff">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Completed</p>
              <p className="text-lg font-display font-bold text-foreground">23</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Earnings</p>
              <p className="text-lg font-display font-bold text-foreground">₹1,840</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card mb-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-display text-lg">New Delivery Orders</CardTitle>
          <Badge className="bg-destructive text-destructive-foreground">2 New</Badge>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { id: "DEL-101", item: "Wedding Saree", from: "Priya's Collection", to: "Anjali, Ward 5", area: "Thrissur East", fee: 80 },
            { id: "DEL-102", item: "Power Drill", from: "Rajan Tools", to: "Rajesh, Ward 12", area: "Thrissur East", fee: 80 },
          ].map((d) => (
            <div key={d.id} className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold text-sm text-foreground">{d.item}</p>
                <span className="text-xs font-body text-muted-foreground">{d.id}</span>
              </div>
              <div className="text-xs font-body text-muted-foreground space-y-1">
                <p>📦 Pickup: {d.from}</p>
                <p>📍 Deliver: {d.to}</p>
                <p>🗺️ Area: {d.area}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-bold text-primary">₹{d.fee}</span>
                <Button size="sm" className="font-display text-xs">Accept Order</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
