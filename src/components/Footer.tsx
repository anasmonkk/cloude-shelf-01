import { CloudIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <CloudIcon className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-bold text-background">Cloud Shelf</span>
          </div>
          <p className="text-sm text-muted-foreground font-body">
            © 2026 Cloud Shelf. Hyperlocal rental marketplace.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-background transition-colors font-body">Login</Link>
            <Link to="/register" className="text-sm text-muted-foreground hover:text-background transition-colors font-body">Register</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
