import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CloudIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const roles = [
  { value: "customer", label: "Customer" },
  { value: "owner", label: "Owner" },
  { value: "delivery", label: "Delivery Staff" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
];

const Login = () => {
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("customer");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile || mobile.length < 10) {
      toast({ title: "Invalid mobile number", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    // Demo navigation based on role
    const dashboardMap: Record<string, string> = {
      customer: "/customer",
      owner: "/owner",
      delivery: "/delivery",
      admin: "/admin",
      superadmin: "/superadmin",
    };
    toast({ title: "Login successful", description: `Welcome back! Redirecting to ${role} dashboard.` });
    navigate(dashboardMap[role] || "/");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <CloudIcon className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Cloud Shelf</span>
          </Link>
          <p className="text-muted-foreground font-body">Login with your mobile number</p>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-5">
          <div className="space-y-2">
            <Label className="font-body font-medium">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            Login
          </Button>

          <p className="text-center text-sm text-muted-foreground font-body">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Register</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
