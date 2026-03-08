import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const demoItems = [
  { id: 1, name: "Wedding Saree - Kasavu", owner: "Priya's Collection", price: 500, commission: 75, delivery: 80, status: "available", returnIn: "", images: 3, category: "Dress" },
  { id: 2, name: "Power Drill Machine", owner: "Rajan Tools", price: 200, commission: 20, delivery: 80, status: "available", returnIn: "", images: 4, category: "Electronics" },
  { id: 3, name: "Gold Necklace Set", owner: "Lakshmi Jewels", price: 1500, commission: 300, delivery: 80, status: "rented", returnIn: "4 Hours", images: 3, category: "Ornaments" },
  { id: 4, name: "DJ Speaker System", owner: "Sound Wave Rentals", price: 800, commission: 80, delivery: 80, status: "available", returnIn: "", images: 5, category: "Electronics" },
  { id: 5, name: "Bridal Lehenga", owner: "Meera Fashion", price: 1200, commission: 180, delivery: 80, status: "available", returnIn: "", images: 3, category: "Dress" },
  { id: 6, name: "DSLR Camera Kit", owner: "Lens Hub", price: 600, commission: 60, delivery: 80, status: "rented", returnIn: "2 Hours", images: 4, category: "Electronics" },
];

const categories = ["All", "Dress", "Electronics", "Ornaments"];

const BrowseItems = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">Browse Items</h1>
            <p className="text-muted-foreground font-body">Rent items from vendors in your area</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="w-full rounded-lg border border-input bg-card pl-10 pr-4 py-2.5 text-sm font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Search items..."
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  className="px-4 py-2 rounded-lg text-sm font-body border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors first:bg-primary first:text-primary-foreground first:border-primary"
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground font-body mb-4">
            Showing items from <span className="font-medium text-foreground">Thrissur East</span>
          </p>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {demoItems.map((item) => (
              <div key={item.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden hover:shadow-elevated transition-all group">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
                  <span className="text-muted-foreground text-xs font-body">{item.images} images</span>
                  {item.status === "rented" ? (
                    <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-xs">
                      Available in {item.returnIn}
                    </Badge>
                  ) : (
                    <Badge className="absolute top-2 right-2 bg-success text-success-foreground text-xs">
                      Available
                    </Badge>
                  )}
                  <Badge variant="outline" className="absolute top-2 left-2 text-xs bg-card/80 backdrop-blur-sm">
                    {item.category}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{item.name}</h3>
                    <p className="text-xs text-muted-foreground font-body">{item.owner}</p>
                  </div>
                  <div className="space-y-1 text-xs font-body">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rental Price</span>
                      <span className="text-foreground font-medium">₹{item.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="text-foreground">₹{item.commission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="text-foreground">₹{item.delivery}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-1 mt-1">
                      <span className="font-medium text-foreground">Total</span>
                      <span className="font-semibold text-primary">₹{item.price + item.commission + item.delivery}</span>
                    </div>
                  </div>
                  <Button size="sm" className="w-full font-display text-xs" disabled={item.status === "rented"}>
                    {item.status === "rented" ? "Currently Rented" : "Rent Now"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BrowseItems;
