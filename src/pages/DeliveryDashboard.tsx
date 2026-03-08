import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Truck, Package, Wallet, User, Bell, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Available Orders", path: "/delivery", icon: <Bell className="h-4 w-4" /> },
  { label: "My Deliveries", path: "/delivery/active", icon: <Truck className="h-4 w-4" /> },
  { label: "Wallet", path: "/delivery/wallet", icon: <Wallet className="h-4 w-4" /> },
  { label: "Profile", path: "/delivery/profile", icon: <User className="h-4 w-4" /> },
];

const AvailableOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ completed: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get staff's areas
      const { data: staffAreas } = await supabase.from("delivery_staff_areas").select("area_id").eq("staff_id", user.id);
      const areaIds = (staffAreas || []).map(a => a.area_id);

      // Get available orders (pending, no delivery staff assigned, in staff's areas)
      let availableOrders: any[] = [];
      if (areaIds.length > 0) {
        const { data } = await supabase
          .from("orders")
          .select("id, order_number, status, total_amount, delivery_charge, delivery_address, created_at, items(name), owner_id, profiles!orders_owner_id_fkey(full_name)")
          .in("status", ["confirmed"])
          .is("delivery_staff_id", null);
        availableOrders = data || [];
      }
      setOrders(availableOrders);

      // My stats
      const { data: myOrders } = await supabase.from("orders").select("id, status, delivery_charge").eq("delivery_staff_id", user.id);
      const completed = (myOrders || []).filter(o => o.status === "delivered").length;
      const earnings = (myOrders || []).filter(o => o.status === "delivered").reduce((sum, o) => sum + Number(o.delivery_charge), 0);
      setStats({ completed, earnings });

      setLoading(false);
    };
    fetch();
  }, []);

  const acceptOrder = async (orderId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("orders").update({ delivery_staff_id: user.id, status: "in_transit" }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Order accepted!" });
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="shadow-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-body">Completed</p>
              <p className="text-lg font-display font-bold text-foreground">{stats.completed}</p>
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
              <p className="text-lg font-display font-bold text-foreground">₹{stats.earnings.toLocaleString("en-IN")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card mb-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-display text-lg">Available Orders</CardTitle>
          {orders.length > 0 && <Badge className="bg-destructive text-destructive-foreground">{orders.length} New</Badge>}
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No available orders right now</p>}
          {orders.map((o) => (
            <div key={o.id} className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold text-sm text-foreground">{(o.items as any)?.name || "Item"}</p>
                <span className="text-xs font-body text-muted-foreground">{o.order_number}</span>
              </div>
              <div className="text-xs font-body text-muted-foreground space-y-1">
                <p>📍 {o.delivery_address || "Address pending"}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-bold text-primary">₹{Number(o.delivery_charge).toLocaleString("en-IN")}</span>
                <Button size="sm" className="font-display text-xs" onClick={() => acceptOrder(o.id)}>Accept Order</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

const MyDeliveries = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, delivery_charge, delivery_address, created_at, items(name)")
        .eq("delivery_staff_id", user.id)
        .order("created_at", { ascending: false });
      setOrders(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Status updated" });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const statusColors: Record<string, string> = {
    in_transit: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    return_pending: "bg-amber-100 text-amber-800",
    returned: "bg-muted text-muted-foreground",
  };

  return (
    <Card className="shadow-card">
      <CardHeader><CardTitle className="font-display text-lg">My Deliveries</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No deliveries yet</p>}
        {orders.map(o => (
          <div key={o.id} className="p-4 rounded-lg border border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold text-sm">{(o.items as any)?.name || "Item"}</p>
              <Badge className={statusColors[o.status] || "bg-muted text-muted-foreground"}>{o.status.replace(/_/g, " ")}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">📍 {o.delivery_address || "—"}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-display font-bold text-primary">₹{Number(o.delivery_charge)}</span>
              {o.status === "in_transit" && (
                <Button size="sm" variant="outline" onClick={() => updateStatus(o.id, "delivered")}>Mark Delivered</Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const DeliveryWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle();
      setWallet(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[
        { label: "Balance", value: `₹${wallet?.balance || 0}` },
        { label: "Total Earned", value: `₹${wallet?.total_earned || 0}` },
        { label: "Pending Settlement", value: `₹${wallet?.pending_settlement || 0}` },
      ].map(s => (
        <Card key={s.label} className="shadow-card">
          <CardContent className="p-6 text-center">
            <p className="text-xs text-muted-foreground font-body mb-1">{s.label}</p>
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const DeliveryProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card max-w-md">
      <CardHeader><CardTitle className="font-display text-lg">My Profile</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm font-medium">{profile?.full_name}</span></div>
        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Mobile</span><span className="text-sm font-medium">{profile?.mobile}</span></div>
        {profile?.date_of_birth && <div className="flex justify-between"><span className="text-sm text-muted-foreground">DOB</span><span className="text-sm font-medium">{new Date(profile.date_of_birth).toLocaleDateString("en-IN")}</span></div>}
        <Button variant="destructive" className="w-full mt-4" onClick={handleLogout}>Logout</Button>
      </CardContent>
    </Card>
  );
};

const pageTitles: Record<string, string> = {
  "/delivery": "Available Orders",
  "/delivery/active": "My Deliveries",
  "/delivery/wallet": "Wallet",
  "/delivery/profile": "Profile",
};

const DeliveryDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const title = pageTitles[path] || "Available Orders";

  const renderContent = () => {
    switch (path) {
      case "/delivery/active": return <MyDeliveries />;
      case "/delivery/wallet": return <DeliveryWallet />;
      case "/delivery/profile": return <DeliveryProfile />;
      default: return <AvailableOrders />;
    }
  };

  return (
    <DashboardLayout navItems={navItems} title={title} role="Delivery Staff">
      {renderContent()}
    </DashboardLayout>
  );
};

export default DeliveryDashboard;
