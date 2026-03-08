import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SAAdmins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    // Get all users with admin role
    const { data: adminRoles } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
    const adminIds = (adminRoles || []).map(r => r.user_id);

    // Get profiles of admins
    let adminProfiles: any[] = [];
    if (adminIds.length > 0) {
      const { data } = await supabase.from("profiles").select("id, full_name, mobile, created_at").in("id", adminIds);
      adminProfiles = data || [];
    }
    setAdmins(adminProfiles);

    // Find users who registered via admin signup but have no role yet (pending approval)
    const { data: allRoles } = await supabase.from("user_roles").select("user_id");
    const usersWithRoles = new Set((allRoles || []).map(r => r.user_id));

    // Get all profiles and find ones without roles (potential pending admins)
    const { data: allProfiles } = await supabase.from("profiles").select("id, full_name, mobile, created_at").order("created_at", { ascending: false });
    const pending = (allProfiles || []).filter(p => !usersWithRoles.has(p.id));
    setPendingUsers(pending);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Admin approved", description: "User can now log in as Admin." });
    fetchData();
  };

  const removeAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Admin role removed" });
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingUsers.length > 0 && (
        <Card className="shadow-card border-amber-200">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2 text-amber-700">
              <Users className="h-5 w-5" /> Pending Admin Approvals ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-display font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="font-body">{u.mobile}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString("en-IN")}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => approveAdmin(u.id)} className="mr-2">
                        <CheckCircle className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Active Admins */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Active Admins ({admins.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-display font-medium">{a.full_name}</TableCell>
                  <TableCell className="font-body">{a.mobile}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(a.created_at).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => removeAdmin(a.id)}>
                      <XCircle className="h-4 w-4 text-destructive mr-1" /> Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No admins</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SAAdmins;
