import DashboardLayout from "@/components/DashboardLayout";
import { Home, Search, ShoppingBag, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Browse", path: "/customer", icon: <Home className="h-4 w-4" /> },
  { label: "My Orders", path: "/customer/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Profile", path: "/customer/profile", icon: <User className="h-4 w-4" /> },
];

const demoItems = [
  { id: 1, name: "Wedding Saree - Kasavu", owner: "Priya's Collection", price: 500, commission: 75, delivery: 80, status: "available", images: 3 },
  { id: 2, name: "Power Drill Machine", owner: "Rajan Tools", price: 200, commission: 20, delivery: 80, status: "available", images: 4 },
  { id: 3, name: "Gold Necklace Set", owner: "Lakshmi Jewels", price: 1500, commission: 300, delivery: 80, status: "rented", returnIn: "4 Hours", images: 3 },
  { id: 4, name: "DJ Speaker System", owner: "Sound Wave Rentals", price: 800, commission: 80, delivery: 80, status: "available", images: 5 },
];

const CustomerDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} title="Browse Items" role="Customer">
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search items in your area..."
          />
        </div>
        <p className="text-xs text-muted-foreground font-body mt-2">Showing items from <span className="font-medium text-foreground">Thrissur East</span></p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {demoItems.map((item) => (
          <div key={item.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
            <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
              <span className="text-muted-foreground text-xs font-body">{item.images} images</span>
              {item.status === "rented" && (
                <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs">
                  Available in {item.returnIn}
                </Badge>
              )}
              {item.status === "available" && (
                <Badge className="absolute top-2 right-2 bg-success text-success-foreground text-xs">
                  Available
                </Badge>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-display font-semibold text-foreground text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground font-body">{item.owner}</p>
              </div>
              <div className="space-y-1 text-xs font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rental Price</span>
                  <span className="text-foreground font-medium">₹{item.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Commission</span>
                  <span className="text-foreground">₹{item.commission}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-foreground">₹{item.delivery}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1 mt-1">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-semibold text-primary">₹{item.price + item.commission + item.delivery}</span>
                </div>
              </div>
              <Button size="sm" className="w-full font-display text-xs" disabled={item.status === "rented"}>
                {item.status === "rented" ? "Currently Rented" : "Rent Now"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
