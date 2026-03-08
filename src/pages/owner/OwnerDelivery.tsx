import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, TruckIcon } from "lucide-react";

const OwnerDelivery = () => {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("delivery_config").select("*").maybeSingle();
      setConfig(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-display font-semibold text-foreground">Delivery Options</h2>
      <Card>
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TruckIcon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-body">Fixed Delivery Charge</p>
            <p className="text-lg font-display font-bold text-foreground">₹{config?.fixed_charge || 0}</p>
          </div>
        </CardContent>
      </Card>
      <p className="text-sm text-muted-foreground font-body">Delivery charges are configured by the platform admin. This charge is added to every order.</p>
    </div>
  );
};

export default OwnerDelivery;
