import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Phone, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "customer";

  const [role] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [panchayathId, setPanchayathId] = useState("");
  const [wardId, setWardId] = useState("");
  const [loading, setLoading] = useState(false);

  // DB data
  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [panchayaths, setPanchayaths] = useState<{ id: string; name: string }[]>([]);
  const [wards, setWards] = useState<{ id: string; ward_number: number }[]>([]);
  const [area, setArea] = useState("—");

  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch states on mount
  useEffect(() => {
    supabase.from("states").select("id, name").then(({ data }) => {
      if (data) setStates(data);
    });
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!stateId) { setDistricts([]); return; }
    supabase.from("districts").select("id, name").eq("state_id", stateId).then(({ data }) => {
      if (data) setDistricts(data);
    });
  }, [stateId]);

  // Fetch panchayaths when district changes
  useEffect(() => {
    if (!districtId) { setPanchayaths([]); return; }
    supabase.from("panchayaths").select("id, name").eq("district_id", districtId).then(({ data }) => {
      if (data) setPanchayaths(data);
    });
  }, [districtId]);

  // Fetch wards + area when panchayath changes
  useEffect(() => {
    if (!panchayathId) { setWards([]); setArea("—"); return; }
    supabase.from("wards").select("id, ward_number").eq("panchayath_id", panchayathId).order("ward_number").then(({ data }) => {
      if (data) setWards(data);
    });
    // Get area name via area_panchayaths
    supabase.from("area_panchayaths").select("areas(name)").eq("panchayath_id", panchayathId).limit(1).then(({ data }) => {
      if (data && data.length > 0) {
        const areaData = data[0].areas as unknown as { name: string };
        setArea(areaData?.name || "—");
      }
    });
  }, [panchayathId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !mobile || mobile.length < 10) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, mobile },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Assign role
        const appRole = role === "customer" ? "customer" : role === "owner" ? "owner" : "delivery";
        await supabase.from("user_roles").insert({ user_id: data.user.id, role: appRole as any });

        // Save ward association if selected (for customer location)
        // Ward ID can be used later for order delivery
      }

      toast({ title: "Account created!", description: "Please check your email to verify your account." });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-4">
            <img src={logo} alt="Cloud Shelf" className="h-16 w-auto mx-auto" />
          </Link>
          <p className="text-muted-foreground font-body">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body font-medium">Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-body font-medium">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="tel" placeholder="10-digit number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="pl-10" maxLength={10} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="font-body font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body font-medium">State</Label>
              <Select value={stateId} onValueChange={(v) => { setStateId(v); setDistrictId(""); setPanchayathId(""); setWardId(""); }}>
                <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                <SelectContent>
                  {states.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body font-medium">District</Label>
              <Select value={districtId} onValueChange={(v) => { setDistrictId(v); setPanchayathId(""); setWardId(""); }} disabled={!stateId}>
                <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                <SelectContent>
                  {districts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="font-body font-medium">Panchayath</Label>
              <Select value={panchayathId} onValueChange={(v) => { setPanchayathId(v); setWardId(""); }} disabled={!districtId}>
                <SelectTrigger><SelectValue placeholder="Select panchayath" /></SelectTrigger>
                <SelectContent>
                  {panchayaths.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="font-body font-medium">Ward</Label>
              <Select value={wardId} onValueChange={setWardId} disabled={!panchayathId}>
                <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                <SelectContent>
                  {wards.map((w) => <SelectItem key={w.id} value={w.id}>Ward {w.ward_number}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-secondary rounded-lg p-3">
            <p className="text-sm font-body text-muted-foreground">
              <span className="font-medium text-foreground">Area:</span> {area}
            </p>
          </div>

          <Button type="submit" className="w-full font-display font-semibold" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground font-body">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;
