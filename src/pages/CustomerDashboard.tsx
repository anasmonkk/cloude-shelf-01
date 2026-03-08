import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(50);

  useEffect(() => {
    const fetchData = async () => {
      const [itemsRes, catsRes, delRes] = await Promise.all([
        supabase
          .from("items")
          .select("id, name, description, owner_price, status, image_urls, owner_id, category_id, categories(name, commission_rate)")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name"),
        supabase.from("delivery_config").select("fixed_charge").limit(1).single(),
      ]);

      const ownerIds = [...new Set((itemsRes.data || []).map(i => i.owner_id))];
      let profileMap: Record<string, string> = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds);
        profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
      }

      setItems((itemsRes.data || []).map(item => ({
        ...item,
        vendor_name: profileMap[item.owner_id] || "—",
      })));
      setCategories(catsRes.data || []);
      if (delRes.data) setDeliveryCharge(Number(delRes.data.fixed_charge));
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = items.filter(item => {
    const matchesCategory = selectedCategory === "All" || (item.categories as any)?.name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.vendor_name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout navItems={navItems} title="Browse Items" role="Customer">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        {/* Category Filters */}
        <div className="flex gap-2 flex-wrap mt-3">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-body border transition-colors ${selectedCategory === "All" ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary"}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-body border transition-colors ${selectedCategory === cat.name ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground font-body mt-2">
          Showing <span className="font-medium text-foreground">{filtered.length}</span> items
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground font-body text-sm">
          No items found. Check back later for new listings.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((item) => {
            const total = Number(item.owner_price) + deliveryCharge;
            const imageUrl = item.image_urls?.[0];

            return (
              <div
                key={item.id}
                className="bg-card rounded-xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-all group cursor-pointer"
                onClick={() => navigate(`/item/${item.id}`)}
              >
                <div className="aspect-[4/3] bg-muted flex items-center justify-center relative overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-muted-foreground text-xs font-body">No image</span>
                  )}
                  <Badge variant="outline" className="absolute top-2 left-2 text-xs bg-card/80 backdrop-blur-sm">
                    {(item.categories as any)?.name || "—"}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-xs text-muted-foreground font-body">{item.vendor_name}</p>
                  </div>
                  <div className="space-y-1 text-xs font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental Price</span>
                      <span className="text-foreground font-medium">₹{Number(item.owner_price).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-foreground">₹{deliveryCharge}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 mt-1">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-semibold text-primary">₹{total.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full font-display text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/item/${item.id}`); }}>
                    View Details
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
