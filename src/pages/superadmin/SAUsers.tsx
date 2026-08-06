import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  owner: "Vendor",
  customer: "Customer",
  delivery: "Delivery",
};

const roleOptions = ["super_admin", "admin", "owner", "customer", "delivery"];

const SAUsers = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { toast } = useToast();

  const fetchData = async () => {
    const [profilesRes, rolesRes, panchayathsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, mobile, panchayath_id, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("id, user_id, role"),
      supabase.from("panchayaths").select("id, name"),
    ]);
    const roles = rolesRes.data || [];
    const panMap = Object.fromEntries((panchayathsRes.data || []).map(p => [p.id, p.name]));
    setRows((profilesRes.data || []).map(p => {
      const userRoles = roles.filter(r => r.user_id === p.id);
      return {
        ...p,
        panchayath_name: p.panchayath_id ? panMap[p.panchayath_id] || "—" : "—",
        roles: userRoles,
      };
    }));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const assignRole = async (userId: string, role: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Role assigned" }); fetchData(); }
  };

  const removeRole = async (roleRowId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleRowId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Role removed" }); fetchData(); }
  };

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !q || r.full_name?.toLowerCase().includes(q) || r.mobile?.includes(q);
    const matchRole = roleFilter === "all"
      ? true
      : roleFilter === "none"
        ? r.roles.length === 0
        : r.roles.some((x: any) => x.role === roleFilter);
    return matchSearch && matchRole;
  });

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> All Users ({filtered.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search name or mobile" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleOptions.map(r => <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>)}
              <SelectItem value="none">No role</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead>Panchayath</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Assign</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>{u.mobile || "—"}</TableCell>
                <TableCell>{u.panchayath_name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {u.roles.length === 0 && <span className="text-xs text-muted-foreground">No role</span>}
                    {u.roles.map((r: any) => (
                      <Badge key={r.id} variant="secondary" className="gap-1">
                        {roleLabels[r.role] || r.role}
                        <button onClick={() => removeRole(r.id)} aria-label="Remove role">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Select onValueChange={(v) => assignRole(u.id, v)}>
                    <SelectTrigger className="w-36"><SelectValue placeholder="Add role" /></SelectTrigger>
                    <SelectContent>
                      {roleOptions.filter(r => !u.roles.some((x: any) => x.role === r)).map(r => (
                        <SelectItem key={r} value={r}>{roleLabels[r]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No users found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SAUsers;