import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAppContext } from "@/hooks/useAppContext";

interface Staff {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
}

interface StaffFormProps {
  hideList?: boolean;
}

export default function StaffForm({ hideList = false }: StaffFormProps) {
  const { currentBusiness } = useAppContext();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
  });

  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    if (currentBusiness?.id) {
      fetchStaff();
    }
  }, [currentBusiness]);

  const fetchStaff = async () => {
    try {
      const res = await axios.get(`/api/dbhandler?model=staff&businessId=${currentBusiness?.id}`);
      setStaffList(res.data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBusiness?.id) return;
    setLoading(true);

    try {
      if (editId) {
        await axios.put(`/api/dbhandler?model=staff&id=${editId}`, formData);
        toast.success("Staff member updated");
      } else {
        await axios.post(`/api/dbhandler?model=staff`, {
          ...formData,
          businessId: currentBusiness.id,
        });
        toast.success("Staff member added");
      }
      resetForm();
      fetchStaff();
    } catch (err) {
      console.error("Failed to save staff", err);
      toast.error("Failed to save staff member");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: Staff) => {
    setFormData({
      name: item.name,
      role: item.role,
      bio: item.bio || "",
      image: item.image || "",
    });
    setEditId(item.id);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await axios.delete(`/api/dbhandler?model=staff&id=${id}`);
      toast.success("Staff member removed");
      fetchStaff();
    } catch (err) {
      console.error("Failed to delete staff", err);
      toast.error("Failed to remove staff member");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", role: "", bio: "", image: "" });
    setEditId(null);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-xl bg-card shadow-sm">
        <h3 className="font-bold text-lg">{editId ? "Edit Team Member" : "Add Team Member"}</h3>
        
        <div className="space-y-2">
          <Label htmlFor="staff-name">Full Name</Label>
          <Input 
            id="staff-name"
            placeholder="e.g. Dr. John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staff-role">Role / Position</Label>
          <Input 
            id="staff-role"
            placeholder="e.g. Senior Pharmacist"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staff-image">Image URL</Label>
          <Input 
            id="staff-image"
            placeholder="https://example.com/photo.jpg"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="staff-bio">Short Bio (Optional)</Label>
          <Textarea 
            id="staff-bio"
            placeholder="Tell us a bit about this expert..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="h-20"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90" disabled={loading}>
            {editId ? "Update Member" : "Add Member"}
          </Button>
          {editId && (
            <Button type="button" onClick={resetForm} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </form>

      {!hideList && (
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Current Team Members ({staffList.length})</h3>
          <div className="grid gap-4">
            {staffList.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg bg-background group">
                <div className="h-12 w-12 rounded-full overflow-hidden shrink-0 border-2">
                  <img src={item.image || "https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png"} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground truncate uppercase tracking-widest">{item.role}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8"><PlusCircle className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id, item.name)} className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
            {staffList.length === 0 && (
              <p className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-xl">No team members yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { PlusCircle, Trash2 } from "lucide-react";
