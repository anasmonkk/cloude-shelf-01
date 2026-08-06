import { Link, useNavigate } from "react-router-dom";
import { Search, MapPin, Heart, ChevronDown } from "lucide-react";
import logo from "@/assets/cloud-shelf-logo.png.asset.json";

interface MarketHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  location?: string;
}

const MarketHeader = ({ search, onSearchChange, location = "All India" }: MarketHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-market-header text-market-header-foreground shadow-elevated">
      <div className="container py-2.5">
        {/* Top row */}
        <div className="flex items-center gap-3">
          <Link to="/" className="shrink-0">
            <img src={logo.url} alt="Cloud Shelf" className="h-8 w-auto brightness-0 invert" />
          </Link>

          {/* Location picker */}
          <button className="hidden md:flex items-center gap-1.5 rounded-md bg-card text-card-foreground px-3 h-11 min-w-[180px] text-sm font-body">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{location}</span>
            <ChevronDown className="h-4 w-4 ml-auto shrink-0" />
          </button>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 items-center rounded-md bg-card overflow-hidden h-11 border-2 border-market-header">
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Find rental items, dresses, tools and more"
              className="flex-1 h-full px-3 text-sm font-body bg-transparent text-card-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button className="h-full aspect-square grid place-items-center bg-market-header text-market-header-foreground">
              <Search className="h-5 w-5" />
            </button>
          </div>

          <div className="ml-auto flex items-center gap-3 md:gap-5">
            <Link to="/login" className="hidden sm:inline-flex" aria-label="Favourites">
              <Heart className="h-5 w-5" />
            </Link>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-display font-bold underline underline-offset-4"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register/vendor")}
              className="hidden sm:inline-flex items-center gap-1 rounded-full bg-card text-card-foreground px-4 h-9 text-sm font-display font-bold border-2 border-highlight"
            >
              + SELL
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-2.5 flex items-center rounded-md bg-card overflow-hidden h-10">
          <Search className="h-4 w-4 mx-2.5 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search rental items"
            className="flex-1 h-full pr-3 text-sm font-body bg-transparent text-card-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>
    </header>
  );
};

export default MarketHeader;
