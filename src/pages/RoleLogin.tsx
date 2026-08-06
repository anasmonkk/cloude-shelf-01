import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Phone, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/cloud-shelf-logo.png.asset.json";
import Navbar from "@/components/Navbar";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

const roleLabels: Record<string, string> = {
  owner: "Vendor",
  delivery: "Delivery Staff",
  admin: "Admin",
  superadmin: "Super Admin",
};

const roleToDbRole: Record<string, AppRole> = {
  owner: "owner",
  delivery: "delivery",
  admin: "admin",
  superadmin: "super_admin",
};

const roleDashboards: Record<string, string> = {
  owner: "/owner",
  delivery: "/delivery",
  admin: "/admin",
  superadmin: "/superadmin",
};

const useEmailLogin = (role: string | undefined) => role === "superadmin";
const useMobileOnlyLogin = (role: string | undefined) => role === "owner";
const VENDOR_DEFAULT_PASSWORD = "cloudshelf_vendor_2024";

const RoleLogin = () => {
  const { role } = useParams<{ role: string }>();
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const label = roleLabels[role || ""] || "User";
  const dashboard = roleDashboards[role || ""] || "/";
  const dbRole = roleToDbRole[role || ""];
  const isEmailLogin = useEmailLogin(role);
  const isMobileOnly = useMobileOnlyLogin(role);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEmailLogin) {
      if (!email || !password) {
        toast({ title: "Missing credentials", description: "Please enter your email and password.", variant: "destructive" });
        return;
      }
    } else if (isMobileOnly) {
      if (!mobile || mobile.length < 10) {
        toast({ title: "Missing credentials", description: "Please enter your 10-digit mobile number.", variant: "destructive" });
        return;
      }
    } else {
      if (!mobile || mobile.length < 10 || !password) {
        toast({ title: "Missing credentials", description: "Please enter your mobile number and password.", variant: "destructive" });
        return;
      }
    }

    setLoading(true);
    try {
      const loginEmail = isEmailLogin ? email : `${mobile}@cloudshelf.app`;
      const loginPassword = isMobileOnly ? VENDOR_DEFAULT_PASSWORD : password;
      const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;

      const userId = data.user?.id;
      if (!userId) throw new Error("Unable to verify user session.");

      if (dbRole) {
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", dbRole)
          .maybeSingle();

        if (roleError) throw roleError;

        if (!roleData) {
          let description = `You don't have ${label} access.`;
          if (role === "owner") {
            const { data: application } = await supabase
              .from("vendor_applications")
              .select("status")
              .eq("user_id", userId)
              .maybeSingle();
            if (application?.status === "pending") {
              description = "Your vendor account is still awaiting admin approval.";
            } else if (application?.status === "rejected") {
              description = "Your vendor registration was declined. Please contact an admin.";
            } else {
              const { data: assignedRoles } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", userId);
              const assignedRole = assignedRoles?.[0]?.role;
              const assignedLabel = assignedRole === "super_admin"
                ? "Super Admin"
                : assignedRole === "admin"
                  ? "Admin"
                  : assignedRole === "delivery"
                    ? "Delivery Staff"
                    : assignedRole === "customer"
                      ? "Customer"
                      : null;
              if (assignedLabel) {
                description = `This mobile number is registered as ${assignedLabel}. Please use the ${assignedLabel} login.`;
              } else {
                description = "No vendor registration was found for this mobile number. Please sign up as a vendor first.";
              }
            }
          }
          await supabase.auth.signOut();
          toast({ title: "Access denied", description, variant: "destructive" });
          return;
        }
      }

      toast({ title: "Login successful", description: `Welcome back, ${label}!` });
      navigate(dashboard);
    } catch (error: any) {
      toast({ title: "Login failed", description: error?.message || "Please check your credentials.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 pt-24">
      <Navbar />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src={logo.url} alt="Cloud Shelf" className="h-16 w-auto mx-auto" />
          </Link>
        </div>

        <form onSubmit={handleLogin} className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-5">
          <h2 className="font-display font-bold text-lg text-foreground text-center">{label} Login</h2>

          {isEmailLogin ? (
            <div className="space-y-2">
              <Label className="font-body font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="font-body font-medium">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="pl-10"
                  maxLength={10}
                />
              </div>
            </div>
          )}

          {!isMobileOnly && (
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
          )}

          <Button type="submit" className="w-full font-display font-semibold" disabled={loading}>
            {loading ? "Logging in..." : `Login as ${label}`}
          </Button>

          {role === "superadmin" && (
            <p className="text-center text-xs text-muted-foreground font-body">
              Contact your Super Admin to get an account.
            </p>
          )}

          {role === "admin" && (
            <p className="text-center text-sm text-muted-foreground font-body">
              Don't have an account?{" "}
              <Link to="/register/admin" className="text-primary hover:underline font-medium">Sign Up</Link>
            </p>
          )}

          {role === "owner" && (
            <p className="text-center text-sm text-muted-foreground font-body">
              Don't have an account?{" "}
              <Link to="/register/vendor" className="text-primary hover:underline font-medium">Sign Up as Vendor</Link>
            </p>
          )}

          <p className="text-center text-sm text-muted-foreground font-body">
            <Link to="/login" className="text-primary hover:underline font-medium">← Back to Customer Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default RoleLogin;
