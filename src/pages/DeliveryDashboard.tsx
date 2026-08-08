import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Truck, Wallet, User, Bell, Loader2, PackageCheck, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Delivery Requests", path: "/delivery", icon: <Bell className="h-4 w-4" /> },
  { label: "My Deliveries", path: "/delivery/active", icon: <Truck className="h-4 w-4" /> },
  { label: "Cash Collections", path: "/delivery/collections", icon: <Banknote className="h-4 w-4" /> },
  { label: "Wallet", path: "/delivery/wallet", icon: <Wallet className="h-4 w-4" /> },
  { label: "Profile", path: "/delivery/profile", icon: <User className="h-4 w-4" /> },
];

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-800",
  delivery_booked: "bg-violet-100 text-violet-800",
  picked_up: "bg-indigo-100 text-indigo-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  delivered: "bg-emerald-100 text-emerald-800",
  return_pending: "bg-amber-100 text-amber-800",
  returned: "bg-muted text-muted-foreground",
};

const statusLabel = (s: string) =>
  ({
    confirmed: "Awaiting Pickup Booking",
    delivery_booked: "Delivery Booked",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered",
  }[s] || s.replace(/_/g, " "));

const AvailableOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [myLocations, setMyLocations] = useState<string[]>([]);
  const [stats, setStats] = useState({ completed: 0, earnings: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: staffWards } = await supabase
      .from("delivery_staff_wards")
      .select("ward_id, wards(ward_number, panchayaths(name))")
      .eq("staff_id", user.id);
    const wardIds = (staffWards || []).map(w => w.ward_id);
    setMyLocations((staffWards || []).map(w => `${(w.wards as any)?.panchayaths?.name || "—"} · Ward ${(w.wards as any)?.ward_number}`));

    let availableOrders: any[] = [];
    if (wardIds.length > 0) {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total_amount, delivery_charge, payment_method, delivery_address, created_at, items(name), wards(ward_number, panchayaths(name))")
        .eq("status", "confirmed")
        .is("delivery_staff_id", null)
        .in("ward_id", wardIds)
        .order("created_at", { ascending: false });
      availableOrders = data || [];
    }
    setOrders(availableOrders);

    const { data: myOrders } = await supabase.from("orders").select("id, status, delivery_charge").eq("delivery_staff_id", user.id);
    const done = (myOrders || []).filter(o => o.status === "delivered");
    setStats({ completed: done.length, earnings: done.reduce((sum, o) => sum + Number(o.delivery_charge), 0) });
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("delivery-open-orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);


  const acceptOrder = async (orderId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("orders")
      .update({ delivery_staff_id: user.id, status: "delivery_booked" as any, booked_at: new Date().toISOString() })
      .eq("id", orderId)
      .is("delivery_staff_id", null)
      .select("id");
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (!data || data.length === 0) {
      toast({ title: "Already taken", description: "Another staff member accepted this order.", variant: "destructive" });
      setOrders(prev => prev.filter(o => o.id !== orderId));
      return;
    }
    toast({ title: "Delivery booked", description: "Head to the vendor for pickup." });
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
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-base">My Pickup Locations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {myLocations.length === 0 && (
            <p className="text-sm text-muted-foreground">No panchayath/ward assigned yet. Ask the admin to allocate your pickup locations.</p>
          )}
          {myLocations.map(l => <Badge key={l} variant="secondary" className="text-xs">{l}</Badge>)}
        </CardContent>
      </Card>

      <Card className="shadow-card mb-4">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-display text-lg">Delivery Requests</CardTitle>
          {orders.length > 0 && <Badge className="bg-destructive text-destructive-foreground">{orders.length} New</Badge>}
        </CardHeader>
        <CardContent className="space-y-3">
          {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No delivery requests right now</p>}
          {orders.map((o) => (
            <div key={o.id} className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-display font-semibold text-sm text-foreground">{(o.items as any)?.name || "Item"}</p>
                <span className="text-xs font-body text-muted-foreground">{o.order_number}</span>
              </div>
              <div className="text-xs font-body text-muted-foreground space-y-1">
                {(o.wards as any) && (
                  <p>🏷 {(o.wards as any).panchayaths?.name || "—"} · Ward {(o.wards as any).ward_number}</p>
                )}
                <p>📍 {o.delivery_address || "Address pending"}</p>
                <p>
                  {o.payment_method === "cash_on_delivery"
                    ? `Collect ₹${Number(o.total_amount).toLocaleString("en-IN")} in cash`
                    : "Prepaid — no cash to collect"}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-display font-bold text-primary">₹{Number(o.delivery_charge).toLocaleString("en-IN")}</span>
                <Button size="sm" className="font-display text-xs" onClick={() => acceptOrder(o.id)}>Accept Request</Button>
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

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, delivery_charge, total_amount, payment_method, delivery_address, created_at, items(name)")
      .eq("delivery_staff_id", user.id)
      .order("created_at", { ascending: false });
    setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const markPickedUp = async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "picked_up" as any, picked_up_at: new Date().toISOString() })
      .eq("id", orderId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Marked as picked up" });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "picked_up" } : o));
  };

  const markDelivered = async (order: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: "delivered" as any, delivered_at: new Date().toISOString() })
      .eq("id", order.id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    if (order.payment_method === "cash_on_delivery") {
      const { error: payError } = await supabase.from("payments").insert({
        order_id: order.id,
        amount: order.total_amount,
        method: "cash_on_delivery" as any,
        status: "collected" as any,
        collected_by: user.id,
        collected_at: new Date().toISOString(),
      });
      if (payError) {
        toast({ title: "Cash not recorded", description: payError.message, variant: "destructive" });
      } else {
        toast({ title: "Delivered", description: "Cash added to your collections." });
      }
    } else {
      toast({ title: "Delivered" });
    }
    setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "delivered" } : o));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader><CardTitle className="font-display text-lg">My Deliveries</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {orders.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No deliveries yet</p>}
        {orders.map(o => (
          <div key={o.id} className="p-4 rounded-lg border border-border space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-display font-semibold text-sm">{(o.items as any)?.name || "Item"}</p>
              <Badge className={statusColors[o.status] || "bg-muted text-muted-foreground"}>{statusLabel(o.status)}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">📍 {o.delivery_address || "—"}</p>
            {o.payment_method === "cash_on_delivery" && o.status !== "delivered" && (
              <p className="text-xs text-amber-600 font-body">Collect ₹{Number(o.total_amount).toLocaleString("en-IN")} on delivery</p>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm font-display font-bold text-primary">₹{Number(o.delivery_charge)}</span>
              <div className="flex gap-2">
                {o.status === "delivery_booked" && (
                  <Button size="sm" variant="outline" onClick={() => markPickedUp(o.id)}>
                    <PackageCheck className="h-4 w-4 mr-1" /> Mark Picked Up
                  </Button>
                )}
                {(o.status === "picked_up" || o.status === "in_transit") && (
                  <Button size="sm" onClick={() => markDelivered(o)}>Mark Delivered</Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const Collections = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("payments")
      .select("id, amount, status, created_at, submitted_at, orders(order_number)")
      .eq("collected_by", user.id)
      .order("created_at", { ascending: false });
    setCollections(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submitToOffice = async (paymentId: string) => {
    const { error } = await supabase
      .from("payments")
      .update({ status: "submitted" as any, submitted_at: new Date().toISOString() })
      .eq("id", paymentId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Submitted to office", description: "Awaiting admin verification." });
    setCollections(prev => prev.map(c => c.id === paymentId ? { ...c, status: "submitted" } : c));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const inHand = collections.filter(c => c.status === "collected");
  const inHandTotal = inHand.reduce((s, c) => s + Number(c.amount), 0);

  const submitAll = async () => {
    for (const c of inHand) await submitToOffice(c.id);
  };

  const payStatus: Record<string, string> = {
    collected: "bg-amber-100 text-amber-800",
    submitted: "bg-blue-100 text-blue-800",
    verified: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-card">
        <CardContent className="p-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-body">Cash in hand</p>
            <p className="text-2xl font-display font-bold text-foreground">₹{inHandTotal.toLocaleString("en-IN")}</p>
          </div>
          {inHand.length > 0 && (
            <Button onClick={submitAll} className="font-display">
              <Banknote className="h-4 w-4 mr-1" /> Submit All to Office
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="font-display text-lg">Cash Collections</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {collections.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">No cash collected yet</p>}
          {collections.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
              <div>
                <p className="font-display font-semibold text-sm">{(c.orders as any)?.order_number || "—"}</p>
                <p className="text-xs text-muted-foreground font-body">₹{Number(c.amount).toLocaleString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={payStatus[c.status] || "bg-muted text-muted-foreground"}>
                  {c.status === "submitted" ? "Submitted to Office" : c.status === "collected" ? "In Hand" : c.status}
                </Badge>
                {c.status === "collected" && (
                  <Button size="sm" variant="outline" onClick={() => submitToOffice(c.id)}>Submit</Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
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
  "/delivery": "Delivery Requests",
  "/delivery/active": "My Deliveries",
  "/delivery/collections": "Cash Collections",
  "/delivery/wallet": "Wallet",
  "/delivery/profile": "Profile",
};

const DeliveryDashboard = () => {
  const location = useLocation();
  const path = location.pathname;
  const title = pageTitles[path] || "Delivery Requests";

  const renderContent = () => {
    switch (path) {
      case "/delivery/active": return <MyDeliveries />;
      case "/delivery/collections": return <Collections />;
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
