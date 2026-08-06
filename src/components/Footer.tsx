import { Link } from "react-router-dom";
import logo from "@/assets/cloud-shelf-logo.png.asset.json";

const Footer = () => {
  return (
    <footer className="bg-foreground py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <img src={logo.url} alt="Cloud Shelf" className="h-10 w-auto rounded" />
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
