import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing credentials",
        description: "Please enter your email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error("Unable to verify user session.");

      const { data: customerRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "customer")
        .maybeSingle();

      if (roleError) throw roleError;

      if (!customerRole) {
        await supabase.auth.signOut();
        toast({
          title: "Access denied",
          description: "This login is for customers only. Use the correct role login.",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Login successful", description: "Welcome back!" });
      navigate("/customer");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error?.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
          <p className="text-muted-foreground font-body">Login to rent items near you</p>
        </div>

        {/* Customer Login Form */}
        <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-5">
          <h2 className="font-display font-bold text-lg text-foreground text-center">Customer Login</h2>

          <div className="space-y-2">
            <Label className="font-body font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="font-body font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                autoComplete="current-password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full font-display font-semibold" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-center text-sm text-muted-foreground font-body">
            New customer?{" "}
            <Link to="/register" className="text-primary hover:underline font-medium">Sign Up</Link>
          </p>
        </form>

        {/* Other Role Links */}
        <div className="mt-6 bg-card rounded-xl border border-border p-5 shadow-card">
          <p className="text-xs font-body text-muted-foreground text-center mb-3 uppercase tracking-wider font-medium">Other Logins</p>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/login/owner">
              <Button variant="outline" size="sm" className="w-full font-body text-xs">Owner</Button>
            </Link>
            <Link to="/login/delivery">
              <Button variant="outline" size="sm" className="w-full font-body text-xs">Delivery Staff</Button>
            </Link>
            <Link to="/login/admin">
              <Button variant="outline" size="sm" className="w-full font-body text-xs">Admin</Button>
            </Link>
            <Link to="/login/superadmin">
              <Button variant="outline" size="sm" className="w-full font-body text-xs">Super Admin</Button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

