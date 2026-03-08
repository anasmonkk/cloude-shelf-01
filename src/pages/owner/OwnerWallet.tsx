import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Wallet, TrendingUp, Clock } from "lucide-react";

const OwnerWallet = () => {
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase.from("wallets").select("*").eq("user_id", session.user.id).maybeSingle();
      setWallet(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  const stats = [
    { label: "Balance", value: `₹${wallet?.balance?.toLocaleString() || 0}`, icon: Wallet },
    { label: "Total Earned", value: `₹${wallet?.total_earned?.toLocaleString() || 0}`, icon: TrendingUp },
    { label: "Pending Settlement", value: `₹${wallet?.pending_settlement?.toLocaleString() || 0}`, icon: Clock },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-foreground">Wallet</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label}>
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
      {!wallet && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground font-body">No wallet data yet. Your wallet will be created when you receive your first order.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OwnerWallet;
