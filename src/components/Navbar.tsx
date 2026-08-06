import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isBrowsePage = location.pathname === "/browse";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-3">
          {!isBrowsePage && (
            <Link
              to="/home"
              aria-label="Back to home"
              className="flex items-center justify-center h-9 w-9 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          )}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Cloud Shelf" className="h-9 w-auto" />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors font-body text-sm font-medium">
            Login
          </Link>
          <Link to="/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container py-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground py-2 font-body">
                Login
              </Link>
              <Link to="/register" onClick={() => setOpen(false)}>
                <Button className="w-full" size="sm">Get Started</Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
