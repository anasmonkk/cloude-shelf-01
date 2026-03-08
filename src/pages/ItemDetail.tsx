import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [item, setItem] = useState<any>(null);
  const [vendorName, setVendorName] = useState("—");
  const [deliveryCharge, setDeliveryCharge] = useState(50);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

  // Order dialog state
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [panchayaths, setPanchayaths] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [selectedPanchayath, setSelectedPanchayath] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  useEffect(() => {
    const fetchItem = async () => {
      const [itemRes, delRes] = await Promise.all([
        supabase
          .from("items")
          .select("id, name, description, owner_price, status, image_urls, owner_id, category_id, categories(name, commission_rate)")
          .eq("id", id!)
          .single(),
        supabase.from("delivery_config").select("fixed_charge").limit(1).single(),
      ]);

      if (itemRes.data) {
        setItem(itemRes.data);
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", itemRes.data.owner_id)
          .single();
        if (profile) setVendorName(profile.full_name);
      }
      if (delRes.data) setDeliveryCharge(Number(delRes.data.fixed_charge));
      setLoading(false);
    };
    fetchItem();
  }, [id]);

  const handleRentNow = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Login required", description: "Please log in to rent this item.", variant: "destructive" });
      navigate("/login");
      return;
    }

    // Load panchayaths for ward selection
    const { data: pData } = await supabase.from("panchayaths").select("id, name").order("name");
    if (pData) setPanchayaths(pData);
    setShowOrderDialog(true);
  };

  const handlePanchayathChange = async (pId: string) => {
    setSelectedPanchayath(pId);
    setSelectedWard("");
    const { data } = await supabase.from("wards").select("id, ward_number").eq("panchayath_id", pId).order("ward_number");
    if (data) setWards(data);
  };

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast({ title: "Address required", description: "Please enter your delivery address.", variant: "destructive" });
      return;
    }
    if (!selectedWard) {
      toast({ title: "Ward required", description: "Please select your panchayath and ward.", variant: "destructive" });
      return;
    }

    setOrderLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const commissionRate = (item.categories as any)?.commission_rate || 0;
      const ownerPrice = Number(item.owner_price);
      const commissionAmount = ownerPrice * commissionRate / 100;
      const totalAmount = ownerPrice + deliveryCharge;
      const orderNumber = `ORD-${Date.now()}`;

      const { error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        customer_id: session.user.id,
        item_id: item.id,
        owner_id: item.owner_id,
        owner_price: ownerPrice,
        delivery_charge: deliveryCharge,
        commission_amount: commissionAmount,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        ward_id: selectedWard,
        payment_method: paymentMethod,
      });

      if (error) throw error;

      toast({ title: "Order placed!", description: `Order ${orderNumber} has been placed successfully.` });
      setShowOrderDialog(false);
      navigate("/customer");
    } catch (err: any) {
      toast({ title: "Order failed", description: err.message, variant: "destructive" });
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center items-center pt-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-24 text-center">
          <p className="text-muted-foreground font-body text-lg">Item not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/browse")}>Back to Browse</Button>
        </div>
      </div>
    );
  }

  const images: string[] = item.image_urls || [];
  const total = Number(item.owner_price) + deliveryCharge;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container max-w-4xl">
          <button
            onClick={() => navigate("/browse")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground font-body mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Browse
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="aspect-square bg-muted rounded-xl overflow-hidden relative">
                {images.length > 0 ? (
                  <img src={images[currentImage]} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm font-body">No image</div>
                )}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-card transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-foreground" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm rounded-full p-1.5 hover:bg-card transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-foreground" />
                    </button>
                  </>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors ${idx === currentImage ? "border-primary" : "border-transparent"}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Item Details */}
            <div className="space-y-5">
              <div>
                <Badge variant="outline" className="mb-2 text-xs">
                  {(item.categories as any)?.name || "—"}
                </Badge>
                <h1 className="text-2xl font-display font-bold text-foreground">{item.name}</h1>
                <p className="text-sm text-muted-foreground font-body mt-1">by {vendorName}</p>
              </div>

              {item.description && (
                <div>
                  <h3 className="text-sm font-display font-semibold text-foreground mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground font-body">{item.description}</p>
                </div>
              )}

              {/* Pricing */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <h3 className="text-sm font-display font-semibold text-foreground mb-2">Pricing</h3>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">Rental Price</span>
                  <span className="text-foreground font-medium">₹{Number(item.owner_price).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">Delivery Charge</span>
                  <span className="text-foreground font-medium">₹{deliveryCharge}</span>
                </div>
                <div className="flex justify-between text-sm font-body border-t border-border pt-2 mt-2">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary text-lg">₹{total.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <Button size="lg" className="w-full font-display" onClick={handleRentNow}>
                Rent Now
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Order Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Place Order</DialogTitle>
            <DialogDescription>Fill in your delivery details to rent "{item?.name}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="font-body">Delivery Address</Label>
              <Input
                id="address"
                placeholder="Enter your full delivery address"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="font-body">Panchayath</Label>
              <Select value={selectedPanchayath} onValueChange={handlePanchayathChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select panchayath" />
                </SelectTrigger>
                <SelectContent>
                  {panchayaths.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {wards.length > 0 && (
              <div>
                <Label className="font-body">Ward</Label>
                <Select value={selectedWard} onValueChange={setSelectedWard}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {wards.map((w) => (
                      <SelectItem key={w.id} value={w.id}>Ward {w.ward_number}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label className="font-body">Payment Method</Label>
              <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash_on_delivery" id="cod" />
                  <Label htmlFor="cod" className="font-body font-normal cursor-pointer">Cash on Delivery</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="prepaid" id="prepaid" />
                  <Label htmlFor="prepaid" className="font-body font-normal cursor-pointer">Prepaid</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-sm font-body">
              <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-primary">₹{total.toLocaleString("en-IN")}</span></div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>Cancel</Button>
            <Button onClick={handlePlaceOrder} disabled={orderLoading}>
              {orderLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemDetail;
