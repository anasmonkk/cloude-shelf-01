import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Package, ShoppingBag, Wallet, User, TruckIcon, BarChart3, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", path: "/owner", icon: <BarChart3 className="h-4 w-4" /> },
  { label: "My Items", path: "/owner/items", icon: <Package className="h-4 w-4" /> },
  { label: "Orders", path: "/owner/orders", icon: <ShoppingBag className="h-4 w-4" /> },
  { label: "Wallet", path: "/owner/wallet", icon: <Wallet className="h-4 w-4" /> },
  { label: "Delivery Options", path: "/owner/delivery", icon: <TruckIcon className="h-4 w-4" /> },
  { label: "Profile", path: "/owner/profile", icon: <User className="h-4 w-4" /> },
];

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeListings: 0, pendingOrders: 0, earnings: 0, completed: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login/owner");
        return;
      }

      const uid = session.user.id;
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "owner")
        .maybeSingle();

      if (!roleData) {
        toast({ title: "Access denied", description: "You don't have vendor access.", variant: "destructive" });
        await supabase.auth.signOut();
        navigate("/login/owner");
        return;
      }

      setUserId(uid);
      await fetchDashboardData(uid);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") navigate("/login/owner");
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async (uid: string) => {
    const [itemsRes, ordersRes, walletRes] = await Promise.all([
      supabase.from("items").select("id, status").eq("owner_id", uid),
      supabase.from("orders").select("id, order_number, status, total_amount, created_at, item_id, items(name)").eq("owner_id", uid).order("created_at", { ascending: false }).limit(5),
      supabase.from("wallets").select("balance, total_earned").eq("user_id", uid).maybeSingle(),
    ]);

    const items = itemsRes.data || [];
    const orders = ordersRes.data || [];
    const wallet = walletRes.data;

    setStats({
      activeListings: items.filter(i => i.status === "active").length,
      pendingOrders: orders.filter(o => o.status === "pending" || o.status === "confirmed").length,
      earnings: wallet?.total_earned || 0,
      completed: orders.filter(o => o.status === "delivered").length,
    });

    setRecentOrders(orders);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning";
      case "confirmed": return "bg-primary";
      case "in_transit": return "bg-accent";
      case "delivered": return "bg-success";
      case "return_pending": case "returned": return "bg-destructive";
      case "cancelled": return "bg-muted";
      default: return "bg-secondary";
    }
  };

  const formatStatus = (status: string) => status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    { label: "Active Listings", value: String(stats.activeListings), icon: Package },
    { label: "Pending Orders", value: String(stats.pendingOrders), icon: ShoppingBag },
    { label: "Earnings", value: `₹${stats.earnings.toLocaleString()}`, icon: Wallet },
    { label: "Completed", value: String(stats.completed), icon: BarChart3 },
  ];

  return (
    <DashboardLayout navItems={navItems} title="Vendor Dashboard" role="Vendor">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
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
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground font-body text-center py-4">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((o: any) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="text-sm font-display font-medium text-foreground">
                      {o.items?.name || "Item"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {o.order_number} · ₹{o.total_amount}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(o.status)} text-primary-foreground font-body font-medium`}>
                    {formatStatus(o.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default OwnerDashboard;
