import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [vendorName, setVendorName] = useState("—");
  const [deliveryCharge, setDeliveryCharge] = useState(50);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);

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
          {/* Back button */}
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

              <Button size="lg" className="w-full font-display">
                Rent Now
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ItemDetail;
