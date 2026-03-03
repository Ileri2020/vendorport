"use client"
import React from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Settings as SettingsIcon } from 'lucide-react'

const SectionConfigDialog = ({ section, onUpdate }: { section: any, onUpdate: () => void }) => {
  // section may come from old schema (data) or new businessSection (content/settings)
  const [configData, setConfigData] = React.useState(section.data || section.content || {});
  const [categories, setCategories] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchCats = async () => {
      const res = await axios.get('/api/dbhandler?model=category');
      setCategories(res.data);
    };
    if (section.type === 'products') fetchCats();
  }, [section.type]);

  const handleSave = async () => {
    try {
      // determine whether to update old section or new businessSection
      const useMaster = section.hasOwnProperty('businessId');
      if (useMaster) {
        // update content/settings
        await axios.put(`/api/dbhandler?model=businessSection`, {
          id: section.id,
          content: configData,
        });
      } else {
        await axios.put(`/api/dbhandler?model=section`, {
          id: section.id,
          data: configData,
        });
      }
      toast.success("Section updated");
      onUpdate();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="secondary" className="h-8 w-8">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Section: {section.type}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {section.type === 'products' && (
            <div className="space-y-2">
              <Label>Product Category</Label>
              <Select
               value={configData.categoryId || "featured"}
               onValueChange={(v) => setConfigData({ ...configData, categoryId: v === 'featured' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Featured Products" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured (Global)</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label>Section Title (Overlay)</Label>
            <Input
             value={configData.title || ""}
             onChange={(e) => setConfigData({ ...configData, title: e.target.value })}
            />
          </div>
        </div>
        <Button onClick={handleSave} className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold">Save Changes</Button>
      </DialogContent>
    </Dialog>
  );
}

export default SectionConfigDialog
