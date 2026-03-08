import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const CUSTOMER_DEFAULT_PASSWORD = "cloudshelf_customer_2024";

const Register = () => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [panchayathId, setPanchayathId] = useState("");
  const [wardId, setWardId] = useState("");
  const [loading, setLoading] = useState(false);

  const [states, setStates] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [panchayaths, setPanchayaths] = useState<{ id: string; name: string }[]>([]);
  const [wards, setWards] = useState<{ id: string; ward_number: number }[]>([]);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("states").select("id, name").then(({ data }) => {
      if (data) setStates(data);
    });
  }, []);

  useEffect(() => {
    if (!stateId) { setDistricts([]); return; }
    supabase.from("districts").select("id, name").eq("state_id", stateId).then(({ data }) => {
      if (data) setDistricts(data);
    });
  }, [stateId]);

  useEffect(() => {
    if (!districtId) { setPanchayaths([]); return; }
    supabase.from("panchayaths").select("id, name").eq("district_id", districtId).then(({ data }) => {
      if (data) setPanchayaths(data);
    });
  }, [districtId]);

  useEffect(() => {
    if (!panchayathId) { setWards([]); return; }
    supabase.from("wards").select("id, ward_number").eq("panchayath_id", panchayathId).order("ward_number").then(({ data }) => {
      if (data) setWards(data);
    });
  }, [panchayathId]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || mobile.length < 10 || !panchayathId || !wardId) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const email = `${mobile}@cloudshelf.app`;
      const { error } = await supabase.auth.signUp({
        email,
        password: CUSTOMER_DEFAULT_PASSWORD,
        options: {
          data: { full_name: name, mobile, role: "customer" },
        },
      });

      if (error) throw error;

      toast({ title: "Account created!", description: "You can now login with your mobile number." });
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
          <p className="text-muted-foreground font-body">Create your customer account</p>
        </div>

        <form onSubmit={handleRegister} className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-4">
          <h2 className="font-display font-bold text-lg text-foreground text-center">Customer Sign Up</h2>

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
                <Input type="tel" placeholder="10-digit number" value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))} className="pl-10" maxLength={10} />
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

          <Button type="submit" className="w-full font-display font-semibold" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
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
