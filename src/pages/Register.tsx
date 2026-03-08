import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { CloudIcon, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// Demo data
const states = ["Kerala"];
const districts: Record<string, string[]> = { Kerala: ["Thrissur", "Ernakulam", "Palakkad"] };
const panchayaths: Record<string, { name: string; area: string }[]> = {
  Thrissur: [
    { name: "Kuttanellur", area: "Thrissur East" },
    { name: "Ollur", area: "Thrissur East" },
    { name: "Nadathara", area: "Thrissur East" },
    { name: "Koorkenchery", area: "Thrissur East" },
    { name: "Ayyanthole", area: "Thrissur West" },
  ],
  Ernakulam: [
    { name: "Kakkanad", area: "Kochi Metro" },
    { name: "Thrikkakara", area: "Kochi Metro" },
  ],
  Palakkad: [
    { name: "Palakkad Town", area: "Palakkad Central" },
  ],
};
const wardCounts: Record<string, number> = {
  Kuttanellur: 25, Ollur: 20, Nadathara: 18, Koorkenchery: 22, Ayyanthole: 19,
  Kakkanad: 30, Thrikkakara: 28, "Palakkad Town": 35,
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get("role") || "customer";

  const [role, setRole] = useState(defaultRole);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [panchayath, setPanchayath] = useState("");
  const [ward, setWard] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedPanchayathData = state && district
    ? panchayaths[district]?.find((p) => p.name === panchayath)
    : null;
  const area = selectedPanchayathData?.area || "—";
  const maxWards = panchayath ? wardCounts[panchayath] || 0 : 0;
  const wards = Array.from({ length: maxWards }, (_, i) => `Ward ${i + 1}`);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || mobile.length < 10) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    toast({ title: "Registration successful!", description: `Welcome to Cloud Shelf as ${role}.` });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <CloudIcon className="h-8 w-8 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">Cloud Shelf</span>
          </Link>
          <p className="text-muted-foreground font-body">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="bg-card rounded-xl border border-border p-6 shadow-elevated space-y-4">
          <div className="space-y-2">
            <Label className="font-body font-medium">Register as</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="owner">Owner</SelectItem>
                <SelectItem value="delivery">Delivery Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

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

          {role !== "delivery" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body font-medium">State</Label>
                  <Select value={state} onValueChange={(v) => { setState(v); setDistrict(""); setPanchayath(""); setWard(""); }}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body font-medium">District</Label>
                  <Select value={district} onValueChange={(v) => { setDistrict(v); setPanchayath(""); setWard(""); }} disabled={!state}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent>
                      {(districts[state] || []).map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-body font-medium">Panchayath</Label>
                  <Select value={panchayath} onValueChange={(v) => { setPanchayath(v); setWard(""); }} disabled={!district}>
                    <SelectTrigger><SelectValue placeholder="Select panchayath" /></SelectTrigger>
                    <SelectContent>
                      {(panchayaths[district] || []).map((p) => <SelectItem key={p.name} value={p.name}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-body font-medium">Ward</Label>
                  <Select value={ward} onValueChange={setWard} disabled={!panchayath}>
                    <SelectTrigger><SelectValue placeholder="Select ward" /></SelectTrigger>
                    <SelectContent>
                      {wards.map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-secondary rounded-lg p-3">
                <p className="text-sm font-body text-muted-foreground">
                  <span className="font-medium text-foreground">Area:</span> {area}
                </p>
              </div>
            </>
          )}

          {role === "delivery" && (
            <div className="space-y-2">
              <Label className="font-body font-medium">Assigned Area</Label>
              <Select>
                <SelectTrigger><SelectValue placeholder="Select area" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="thrissur-east">Thrissur East</SelectItem>
                  <SelectItem value="thrissur-west">Thrissur West</SelectItem>
                  <SelectItem value="kochi-metro">Kochi Metro</SelectItem>
                  <SelectItem value="palakkad-central">Palakkad Central</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <Button type="submit" className="w-full font-display font-semibold">
            Create Account
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
