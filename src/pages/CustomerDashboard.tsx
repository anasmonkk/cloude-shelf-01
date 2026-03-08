import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Home, Search, ShoppingBag, User, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { label: "Browse", path: "/customer", icon: <Home className="h-4 w-4" /> },
  { label: "My Orders", path: "/customer/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Profile", path: "/customer/profile", icon: <User className="h-4 w-4" /> },
];

interface ItemWithDetails {
  id: string;
  name: string;
  description: string | null;
  owner_price: number;
  status: string;
  image_urls: string[] | null;
  owner_id: string;
  owner_name: string;
  category_name: string;
  commission_rate: number;
  delivery_charge: number;
}

const CustomerDashboard = () => {
  const [items, setItems] = useState<ItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        // Fetch active items with category info
        const { data: itemsData, error: itemsError } = await supabase
          .from("items")
          .select("id, name, description, owner_price, status, image_urls, owner_id, category_id, categories(name, commission_rate)")
          .eq("status", "active")
          .order("created_at", { ascending: false });

        if (itemsError) throw itemsError;

        // Fetch delivery charge
        const { data: deliveryData } = await supabase
          .from("delivery_config")
          .select("fixed_charge")
          .limit(1)
          .single();

        const deliveryCharge = deliveryData?.fixed_charge ?? 50;

        // Fetch owner profiles
        const ownerIds = [...new Set((itemsData || []).map((i) => i.owner_id))];
        let ownerMap: Record<string, string> = {};
        if (ownerIds.length > 0) {
          const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", ownerIds);
          (profiles || []).forEach((p) => { ownerMap[p.id] = p.full_name; });
        }

        const mapped: ItemWithDetails[] = (itemsData || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          owner_price: item.owner_price,
          status: item.status,
          image_urls: item.image_urls,
          owner_id: item.owner_id,
          owner_name: ownerMap[item.owner_id] || "Unknown",
          category_name: item.categories?.name || "",
          commission_rate: item.categories?.commission_rate || 0,
          delivery_charge: deliveryCharge,
        }));

        setItems(mapped);
      } catch (err) {
        console.error("Error fetching items:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      item.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems} title="Browse Items" role="Customer">
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground font-body mt-2">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> items
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground font-body text-sm">
          No items available right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const commission = Math.round(item.owner_price * item.commission_rate / 100);
            const total = item.owner_price + commission + item.delivery_charge;

            return (
              <div key={item.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-shadow">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
                  {item.image_urls && item.image_urls.length > 0 ? (
                    <img src={item.image_urls[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-xs font-body">No image</span>
                  )}
                  <Badge className="absolute top-2 right-2 bg-success text-success-foreground text-xs">
                    Available
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm">{item.name}</h3>
                    <p className="text-xs text-muted-foreground font-body">{item.owner_name}</p>
                  </div>
                  <div className="space-y-1 text-xs font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental Price</span>
                      <span className="text-foreground font-medium">₹{item.owner_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="text-foreground">₹{commission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-foreground">₹{item.delivery_charge}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 mt-1">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-semibold text-primary">₹{total}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full font-display text-xs">
                    Rent Now
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerDashboard;
