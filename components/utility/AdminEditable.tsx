"use client"
import React, { useState } from 'react'
import { useIsBusinessAdmin } from '@/hooks/useIsBusinessAdmin'
import { useMounted } from '@/hooks/use-mounted'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Edit2, 
  Check, 
  X, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Palette, 
  Upload,
  ExternalLink
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'

interface AdminEditableProps {
  value: any
  model: string // e.g., 'section', 'business', 'siteSettings'
  id: string
  field: string // e.g., 'data.title', 'name'
  type?: 'text' | 'textarea' | 'image' | 'link' | 'color'
  data?: any   // The whole data object if field is nested in data
  onSave?: (newValue: any) => void
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div' | 'img'
  children?: React.ReactNode
  linkField?: string // For 'link' type, the field for the URL
}

export const AdminEditable = ({ 
  value, 
  model, 
  id, 
  field, 
  type = 'text',
  data,
  onSave, 
  className = "", 
  as: Component = 'span',
  children,
  linkField
}: AdminEditableProps) => {
  const isAdmin = useIsBusinessAdmin();
  const mounted = useMounted();
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [currentLink, setCurrentLink] = useState(data ? data[linkField || ''] : '');
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleSave = async (overriddenValue?: any) => {
    setIsLoading(true);
    try {
      const valToSave = overriddenValue !== undefined ? overriddenValue : currentValue;
      const updateData: any = { id };
      
      if (field.startsWith('data.')) {
        const key = field.replace('data.', '');
        const newData = { ...data, [key]: valToSave };
        if (type === 'link' && linkField) {
           newData[linkField] = currentLink;
        }
        updateData.data = newData;
      } else {
        updateData[field] = valToSave;
        if (type === 'link' && linkField) {
           updateData[linkField] = currentLink;
        }
      }

      // Handle file upload if present
      if (file && type === 'image') {
        const formData = new FormData();
        formData.append('id', id);
        formData.append('file', file);
        // Map field correctly for multipart
        const uploadModel = model === 'section' ? 'section' : model;
        await axios.put(`/api/dbhandler?model=${uploadModel}`, formData);
      } else {
        await axios.put(`/api/dbhandler?model=${model}`, updateData);
      }
      
      if (onSave) onSave(valToSave);
      setIsEditing(false);
      toast.success("Updated successfully");
      window.location.reload(); // Refresh to show changes across components
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    } finally {
      setIsLoading(false);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  if (!mounted || !isAdmin) {
    if (type === 'image' && Component === 'img') {
        return <img src={value} className={className} alt="" />;
    }
    return <Component className={className}>{children || value}</Component>;
  }

  // --- Inline Editors (Text/Color) ---
  if (isEditing && (type === 'text' || type === 'color')) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Input 
          type={type === 'color' ? 'color' : 'text'}
          value={currentValue} 
          onChange={(e) => setCurrentValue(e.target.value)}
          className={`h-8 py-0 px-2 ${type === 'color' ? 'w-12 p-0 border-none overflow-hidden' : 'min-w-[150px]'}`}
          autoFocus
        />
        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleSave()} disabled={isLoading}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => setIsEditing(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <div 
        className={`group relative cursor-pointer ring-0 hover:ring-[3px] ring-accent ring-offset-4 rounded-xl transition-all duration-300 ease-out active:scale-[0.99] ${className}`}
        onClick={() => setIsEditing(true)}
      >
        <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 transform group-hover:translate-x-1 group-hover:-translate-y-1 scale-75 group-hover:scale-100">
          <div className="bg-accent text-white p-1.5 rounded-full shadow-lg border-2 border-white">
            {type === 'image' ? <ImageIcon className="h-3 w-3" /> : 
             type === 'link' ? <LinkIcon className="h-3 w-3" /> : 
             type === 'color' ? <Palette className="h-3 w-3" /> : 
             <Edit2 className="h-3 w-3" />}
          </div>
        </div>
        
        {type === 'image' && Component === 'img' ? (
           <img src={value} className={className} alt="" />
        ) : children || value}
      </div>

      <Dialog open={isEditing && (type === 'image' || type === 'link' || type === 'textarea')} onOpenChange={setIsEditing}>
         <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl">
            <DialogHeader>
               <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  Edit {type === 'image' ? 'Image' : type === 'link' ? 'Link' : 'Content'}
               </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
               {type === 'textarea' && (
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Text Content</Label>
                     <Textarea 
                       value={currentValue}
                       onChange={(e) => setCurrentValue(e.target.value)}
                       rows={6}
                       className="border-2 rounded-2xl resize-none font-medium"
                     />
                  </div>
               )}

               {type === 'image' && (
                  <div className="space-y-4">
                     <div className="aspect-video rounded-2xl overflow-hidden border-4 border-muted/20 bg-muted/10 relative group">
                        <img src={preview || value} className="w-full h-full object-cover" alt="Preview" />
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                           <Upload className="h-8 w-8 text-white animate-bounce" />
                           <input type="file" className="hidden" onChange={onFileChange} accept="image/*" />
                        </label>
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Or provide Image URL</Label>
                        <Input 
                          value={preview ? '' : currentValue}
                          onChange={(e) => { setPreview(null); setCurrentValue(e.target.value); }}
                          placeholder="https://images.unsplash.com/..."
                          className="border-2 h-11 rounded-xl"
                        />
                     </div>
                  </div>
               )}

               {type === 'link' && (
                  <div className="space-y-4">
                     <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Button Label</Label>
                        <Input 
                          value={currentValue}
                          onChange={(e) => setCurrentValue(e.target.value)}
                          placeholder="Shop Now"
                          className="border-2 h-11 rounded-xl font-bold"
                        />
                     </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Target URL</Label>
                        <div className="relative">
                           <ExternalLink className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                           <Input 
                             value={currentLink}
                             onChange={(e) => setCurrentLink(e.target.value)}
                             placeholder="/store or https://..."
                             className="border-2 h-11 rounded-xl pl-10"
                           />
                        </div>
                     </div>
                  </div>
               )}
            </div>

            <DialogFooter className="gap-2">
               <Button variant="outline" onClick={() => setIsEditing(false)} className="h-12 border-2 rounded-2xl font-bold flex-1">
                  Cancel
               </Button>
               <Button onClick={() => handleSave()} disabled={isLoading} className="h-12 bg-accent hover:bg-accent/90 text-white font-black rounded-2xl shadow-lg shadow-accent/20 flex-1">
                  {isLoading ? 'Saving...' : 'Save Changes'}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </>
  )
}

