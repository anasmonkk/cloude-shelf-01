import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { BarChart3, Users, Package, MapPin, CreditCard, Settings, ShoppingBag, Truck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
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
  { label: "Vendors", path: "/admin/owners", icon: <Users className="h-4 w-4" /> },
  { label: "Delivery Staff", path: "/admin/delivery", icon: <Truck className="h-4 w-4" /> },
  { label: "Areas", path: "/admin/areas", icon: <MapPin className="h-4 w-4" /> },
  { label: "Payments", path: "/admin/payments", icon: <CreditCard className="h-4 w-4" /> },
  { label: "Items", path: "/admin/items", icon: <Package className="h-4 w-4" /> },
  { label: "Settlements", path: "/admin/settlements", icon: <Settings className="h-4 w-4" /> },
];

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ orders: 0, owners: 0, deliveryStaff: 0, areas: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [pendingSettlements, setPendingSettlements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, rolesRes, areasRes, recentOrdersRes, settlementsRes] = await Promise.all([
          supabase.from("orders").select("id", { count: "exact", head: true }),
          supabase.from("user_roles").select("role"),
          supabase.from("areas").select("id", { count: "exact", head: true }),
          supabase.from("orders").select("order_number, status, total_amount, created_at").order("created_at", { ascending: false }).limit(5),
          supabase.from("settlements").select("id, amount, status, user_id").eq("status", "pending").limit(5),
        ]);

        const roles = rolesRes.data || [];
        const ownerCount = roles.filter(r => r.role === "owner").length;
        const deliveryCount = roles.filter(r => r.role === "delivery").length;

        setStats({
          orders: ordersRes.count || 0,
          owners: ownerCount,
          deliveryStaff: deliveryCount,
          areas: areasRes.count || 0,
        });

        setRecentOrders(recentOrdersRes.data || []);

        // Fetch profile names for settlements
        const settlements = settlementsRes.data || [];
        if (settlements.length > 0) {
          const userIds = [...new Set(settlements.map(s => s.user_id))];
          const { data: profiles } = await supabase.from("profiles").select("id, full_name").in("id", userIds);
          const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p.full_name]));
          setPendingSettlements(settlements.map(s => ({ ...s, profile_name: profileMap[s.user_id] || "Unknown" })));
        } else {
          setPendingSettlements([]);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: "Pending", confirmed: "Confirmed", in_transit: "In Transit",
      delivered: "Delivered", return_pending: "Return Pending", returned: "Returned", cancelled: "Cancelled",
    };
    return map[s] || s;
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const statCards = [
    { label: "Total Orders", value: stats.orders.toString(), icon: ShoppingBag },
    { label: "Active Vendors", value: stats.owners.toString(), icon: Users },
    { label: "Delivery Staff", value: stats.deliveryStaff.toString(), icon: Truck },
    { label: "Areas", value: stats.areas.toString(), icon: MapPin },
  ];

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <s.icon className="h-5 w-5 text-primary" />
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
              {recentOrders.length === 0 && <p className="text-sm text-muted-foreground">No orders yet.</p>}
              {recentOrders.map((o) => (
                <div key={o.order_number} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="text-sm font-display font-medium text-foreground">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground font-body">{statusLabel(o.status)}</p>
                  </div>
                  <span className="text-sm font-display font-semibold text-foreground">₹{Number(o.total_amount).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <h3 className="font-display font-semibold text-lg mb-3">Pending Settlements</h3>
            <div className="space-y-2">
              {pendingSettlements.length === 0 && <p className="text-sm text-muted-foreground">No pending settlements.</p>}
              {pendingSettlements.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary">
                  <div>
                    <p className="text-sm font-display font-medium text-foreground">{s.profile_name || "Unknown"}</p>
                    <Badge variant="secondary" className="text-xs">Pending</Badge>
                  </div>
                  <span className="text-sm font-display font-semibold text-accent">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

const pageTitles: Record<string, string> = {
  "/admin": "Admin Dashboard",
  "/admin/orders": "Orders Management",
  "/admin/owners": "Vendors Management",
  "/admin/delivery": "Delivery Staff",
  "/admin/areas": "Areas",
  "/admin/payments": "Payments",
  "/admin/items": "Items Management",
  "/admin/settlements": "Settlements",
};

const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const path = location.pathname;
  const title = pageTitles[path] || "Admin Dashboard";

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate("/login/admin", { replace: true });
        return;
      }
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!roleData) {
        await supabase.auth.signOut();
        navigate("/login/admin", { replace: true });
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        setAuthChecked(false);
        navigate("/login/admin", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
