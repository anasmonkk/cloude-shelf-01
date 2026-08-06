import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, Heart, MapPin, SlidersHorizontal, LayoutGrid, Sofa, Camera, Wrench,
  Shirt, Laptop, Bike, PartyPopper, Baby, Dumbbell, Music, Tent, BookOpen, Utensils, Package,
} from "lucide-react";
import MarketHeader from "@/components/MarketHeader";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_ICONS: { match: string[]; icon: typeof Package }[] = [
  { match: ["furniture", "sofa", "home", "house"], icon: Sofa },
  { match: ["camera", "photo", "video", "drone"], icon: Camera },
  { match: ["tool", "hardware", "construction", "power"], icon: Wrench },
  { match: ["cloth", "dress", "fashion", "wear", "costume"], icon: Shirt },
  { match: ["electronic", "laptop", "computer", "gadget", "appliance"], icon: Laptop },
  { match: ["vehicle", "bike", "cycle", "car", "scooter"], icon: Bike },
  { match: ["event", "party", "decor", "wedding", "tent house"], icon: PartyPopper },
  { match: ["baby", "kid", "child", "toy"], icon: Baby },
  { match: ["sport", "fitness", "gym"], icon: Dumbbell },
  { match: ["music", "instrument", "sound", "audio"], icon: Music },
  { match: ["camp", "outdoor", "travel", "tent"], icon: Tent },
  { match: ["book", "study", "education"], icon: BookOpen },
  { match: ["kitchen", "cook", "catering", "utensil"], icon: Utensils },
];

const getCategoryIcon = (name: string) => {
  const lower = (name || "").toLowerCase();
  return CATEGORY_ICONS.find(c => c.match.some(m => lower.includes(m)))?.icon || Package;
};


const BrowseItems = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState(50);

  const handleViewItem = async (itemId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Login required", description: "Please log in to view item details.", variant: "destructive" });
      navigate(`/login?redirect=/item/${itemId}`);
      return;
    }
    navigate(`/item/${itemId}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      const [itemsRes, catsRes, delRes] = await Promise.all([
        supabase
          .from("items")
          .select("id, name, description, owner_price, status, image_urls, owner_id, category_id, created_at, categories(name, commission_rate)")
          .eq("status", "active")
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("id, name"),
        supabase.from("delivery_config").select("fixed_charge").limit(1).maybeSingle(),
      ]);

      // Vendor names are private — only fetch them for signed-in users
      const { data: { session } } = await supabase.auth.getSession();
      const ownerIds = [...new Set((itemsRes.data || []).map(i => i.owner_id))];
      let profileMap: Record<string, string> = {};
      if (session && ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", ownerIds);
        profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
      }

      setItems((itemsRes.data || []).map(item => ({
        ...item,
        vendor_name: profileMap[item.owner_id] || "",
      })));
      setCategories(catsRes.data || []);
      if (delRes.data) setDeliveryCharge(Number(delRes.data.fixed_charge));
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = items.filter(item => {
    const matchesCategory = selectedCategory === "All" || (item.categories as any)?.name === selectedCategory;
    const q = search.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(q) || (item.vendor_name || "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const timeAgo = (date?: string) => {
    if (!date) return "";
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MarketHeader search={search} onSearchChange={setSearch} />

      {/* Category strip */}
      <div className="bg-market-strip border-b border-border">
        <div className="container flex items-center gap-2 overflow-x-auto py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-display font-semibold border transition-colors ${
              selectedCategory === "All"
                ? "bg-market-header text-market-header-foreground border-market-header"
                : "bg-card text-market-strip-foreground border-border"
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
            ALL CATEGORIES
          </button>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.name);
            const active = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-body whitespace-nowrap border transition-colors ${
                  active
                    ? "bg-market-header text-market-header-foreground border-market-header"
                    : "bg-card text-market-strip-foreground border-border"
                }`}
              >
                <span className={`grid place-items-center h-5 w-5 rounded-full shrink-0 ${active ? "bg-market-header-foreground/20" : "bg-muted"}`}>
                  <Icon className={`h-3 w-3 ${active ? "" : "text-primary"}`} />
                </span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 pb-12">
        <div className="container pt-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-lg md:text-xl font-display font-semibold text-foreground">Fresh recommendations</h1>
              <p className="text-xs text-muted-foreground font-body mt-0.5">
                {loading ? "Loading listings…" : `${filtered.length} rental items available`}
              </p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-body text-muted-foreground border border-border rounded-md px-3 py-1.5 bg-card">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground font-body">
              <p className="text-lg">No items found</p>
              <p className="text-sm mt-1">Check back later for new listings</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4">
              {filtered.map((item) => {
                const total = Number(item.owner_price) + deliveryCharge;
                const imageUrl = item.image_urls?.[0];

                return (
                  <article
                    key={item.id}
                    onClick={() => handleViewItem(item.id)}
                    className="bg-card rounded-md border border-border overflow-hidden cursor-pointer hover:shadow-elevated transition-shadow flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-muted flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground text-xs font-body">No image</span>
                      )}
                      <button
                        aria-label="Save item"
                        onClick={(e) => { e.stopPropagation(); navigate("/login?redirect=/browse"); }}
                        className="absolute top-1.5 right-1.5 h-7 w-7 grid place-items-center rounded-full bg-card/85 backdrop-blur-sm text-foreground"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="p-2.5 flex flex-col gap-1 flex-1">
                      <p className="font-display font-bold text-base text-foreground leading-none">
                        ₹{Number(item.owner_price).toLocaleString("en-IN")}
                        <span className="text-[10px] font-body font-normal text-muted-foreground"> /rent</span>
                      </p>
                      <h3 className="text-xs font-body text-foreground line-clamp-2">{item.name}</h3>
                      <p className="text-[11px] font-body text-muted-foreground line-clamp-1">
                        {(item.categories as any)?.name || "Uncategorised"} · +₹{deliveryCharge} delivery · ₹{total.toLocaleString("en-IN")} total
                      </p>
                      <div className="mt-auto pt-1.5 flex items-center justify-between text-[10px] font-body text-muted-foreground uppercase">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {item.vendor_name || "Nearby vendor"}
                        </span>
                        <span className="shrink-0">{timeAgo(item.created_at)}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseItems;
