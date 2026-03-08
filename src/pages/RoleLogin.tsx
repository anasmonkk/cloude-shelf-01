import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const roleLabels: Record<string, string> = {
  owner: "Owner",
  delivery: "Delivery Staff",
  admin: "Admin",
  superadmin: "Super Admin",
};

const roleDashboards: Record<string, string> = {
  owner: "/owner",
  delivery: "/delivery",
  admin: "/admin",
  superadmin: "/superadmin",
};

const RoleLogin = () => {
  const { role } = useParams<{ role: string }>();
  const [mobile, setMobile] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const label = roleLabels[role || ""] || "User";
  const dashboard = roleDashboards[role || ""] || "/";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast({ title: "Invalid mobile number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    toast({ title: "Login successful", description: `Welcome back, ${label}!` });
    navigate(dashboard);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src={logo} alt="Cloud Shelf" className="h-16 w-auto mx-auto" />
          </Link>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-5">
          <h2 className="font-display font-bold text-lg text-foreground text-center">{label} Login</h2>

          <div className="space-y-2">
            <Label className="font-body font-medium">Mobile Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="pl-10"
                maxLength={10}
              />
            </div>
          </div>

          <Button type="submit" className="w-full font-display font-semibold">
            Login as {label}
          </Button>

          <p className="text-center text-sm text-muted-foreground font-body">
            <Link to="/login" className="text-primary hover:underline font-medium">← Back to Customer Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default RoleLogin;
