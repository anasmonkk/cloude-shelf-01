import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, CheckCircle, XCircle, Loader2, MapPin, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SAAdmins = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Area assignment dialog state
  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<any>(null);
  const [assignedAreaIds, setAssignedAreaIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    const [rolesRes, areasRes, adminAreasRes, allRolesRes, allProfilesRes] = await Promise.all([
      supabase.from("user_roles").select("user_id").eq("role", "admin"),
      supabase.from("areas").select("id, name").order("name"),
      supabase.from("admin_areas").select("admin_id, area_id"),
      supabase.from("user_roles").select("user_id"),
      supabase.from("profiles").select("id, full_name, mobile, created_at").order("created_at", { ascending: false }),
    ]);

    const adminIds = (rolesRes.data || []).map(r => r.user_id);
    const adminAreaMap: Record<string, string[]> = {};
    (adminAreasRes.data || []).forEach(aa => {
      if (!adminAreaMap[aa.admin_id]) adminAreaMap[aa.admin_id] = [];
      adminAreaMap[aa.admin_id].push(aa.area_id);
    });

    // Get admin profiles
    let adminProfiles: any[] = [];
    if (adminIds.length > 0) {
      const { data } = await supabase.from("profiles").select("id, full_name, mobile, created_at").in("id", adminIds);
      adminProfiles = (data || []).map(p => ({
        ...p,
        areaIds: adminAreaMap[p.id] || [],
      }));
    }
    setAdmins(adminProfiles);
    setAreas(areasRes.data || []);

    // Pending users (no role assigned)
    const usersWithRoles = new Set((allRolesRes.data || []).map(r => r.user_id));
    const pending = (allProfilesRes.data || []).filter(p => !usersWithRoles.has(p.id));
    setPendingUsers(pending);

    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const approveAdmin = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Admin approved" });
    fetchData();
  };

  const removeAdmin = async (userId: string) => {
    // Remove role and area assignments
    await supabase.from("admin_areas").delete().eq("admin_id", userId);
    const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Admin removed" });
    fetchData();
  };

  const openAreaDialog = (admin: any) => {
    setSelectedAdmin(admin);
    setAssignedAreaIds(admin.areaIds || []);
    setAreaDialogOpen(true);
  };

  const toggleArea = (areaId: string) => {
    setAssignedAreaIds(prev =>
      prev.includes(areaId) ? prev.filter(id => id !== areaId) : [...prev, areaId]
    );
  };

  const saveAreas = async () => {
    if (!selectedAdmin) return;
    setSaving(true);
    // Delete existing assignments
    await supabase.from("admin_areas").delete().eq("admin_id", selectedAdmin.id);
    // Insert new ones
    if (assignedAreaIds.length > 0) {
      const rows = assignedAreaIds.map(area_id => ({ admin_id: selectedAdmin.id, area_id }));
      const { error } = await supabase.from("admin_areas").insert(rows);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); setSaving(false); return; }
    }
    toast({ title: "Areas updated" });
    setSaving(false);
    setAreaDialogOpen(false);
    fetchData();
  };

  const getAreaNames = (areaIds: string[]) => {
    return areaIds.map(id => areas.find(a => a.id === id)?.name).filter(Boolean);
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
                      <Button size="sm" onClick={() => approveAdmin(u.id)}>
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
                <TableHead>Assigned Areas</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-display font-medium">{a.full_name}</TableCell>
                  <TableCell className="font-body">{a.mobile}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {a.areaIds.length === 0 && <span className="text-xs text-muted-foreground">No areas</span>}
                      {getAreaNames(a.areaIds).map(name => (
                        <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(a.created_at).toLocaleDateString("en-IN")}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => openAreaDialog(a)}>
                        <Settings2 className="h-4 w-4 mr-1" /> Areas
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeAdmin(a.id)}>
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {admins.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No admins</TableCell></TableRow>}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Area Assignment Dialog */}
      <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" /> Manage Areas — {selectedAdmin?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto space-y-2 py-2">
            {areas.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No areas created yet</p>}
            {areas.map(area => (
              <label key={area.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary cursor-pointer transition-colors">
                <Checkbox
                  checked={assignedAreaIds.includes(area.id)}
                  onCheckedChange={() => toggleArea(area.id)}
                />
                <span className="text-sm font-body font-medium">{area.name}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAreaDialogOpen(false)}>Cancel</Button>
            <Button onClick={saveAreas} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SAAdmins;
