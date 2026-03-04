"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AdminFormContainer } from "@/components/utility/AdminFormContainer";

interface CategoriesFormProps {
  initialCategory?: any;
  hideList?: boolean;
}

export default function CategoriesForm({ initialCategory, hideList = false }: CategoriesFormProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    id: initialCategory?.id || "",
    name: initialCategory?.name || "",
    description: initialCategory?.description || "",
    image: initialCategory?.image || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(initialCategory?.id || null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileKey, setFileKey] = useState("file-0"); // Unique key to reset input

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/dbhandler?model=category");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setErrorMsg("");

    if (!selected) return;

    const maxSizeKB = 300;
    const maxSizeBytes = maxSizeKB * 1024;

    if (selected.size > maxSizeBytes) {
      setErrorMsg(`Image must be smaller than ${maxSizeKB}KB.`);
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);

      if (file) {
        data.append("file", file);
      } else if (editId && formData.image) {
        data.append("image", formData.image);
      }

      if (editId) data.append("id", editId);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (editId) {
        await axios.put(`/api/dbhandler?model=category&id=${editId}`, data, config);
      } else {
        await axios.post(`/api/dbhandler?model=category`, data, config);
      }

      setLoading(false);
      toast.success(editId ? "Category updated" : "Category created");
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditId(item.id);
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description,
      image: item.image,
    });

    setFile(null);
    setPreview(null);
    setErrorMsg("");
    setFileKey(`file-${Date.now()}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this category?`)) return;
    try {
      await axios.delete(`/api/dbhandler?model=category&id=${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", description: "", image: "" });
    setFile(null);
    setPreview(null);
    setEditId(null);
    setErrorMsg("");
    setFileKey(`file-${Date.now()}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AdminFormContainer 
        title="Product Categories" 
        description="Organize your products into easy-to-browse collections."
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-name">Category Name</Label>
                <Input
                  id="cat-name"
                  placeholder="e.g. Health & Beauty"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-desc">Description</Label>
                <Input
                  id="cat-desc"
                  placeholder="Short summary of this group"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cat-image">Category Banner</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="cat-image"
                    ref={fileInputRef}
                    key={fileKey}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="h-11 pt-2"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Max 300KB • Square or Wide</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl bg-muted/20">
              {preview || formData.image ? (
                <div className="relative group">
                  <img
                    src={preview || formData.image}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-2xl shadow-xl border-4 border-white"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                    PREVIEW
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Image Preview</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button type="submit" disabled={loading} className="flex-1 h-12 text-lg font-bold shadow-lg shadow-primary/20">
              {loading ? "Processing..." : editId ? "Update Category" : "Build Category"}
            </Button>
            {editId && (
              <Button type="button" onClick={resetForm} variant="outline" className="flex-1 h-12 font-bold border-2">
                Discard Changes
              </Button>
            )}
          </div>
        </form>

        {!hideList && (
          <div className="mt-12 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="font-black text-lg uppercase tracking-widest text-primary/60">Live Collections</h3>
               <Badge variant="secondary" className="h-6 font-bold">{categories.length}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((item) => (
                <div
                  key={item.id}
                  className="group relative flex flex-col p-4 bg-muted/30 hover:bg-white rounded-3xl border-2 border-transparent hover:border-accent/10 transition-all duration-300 shadow-sm hover:shadow-xl"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={item.image || "/logo.png"}
                      className="w-14 h-14 rounded-xl object-cover border-2 shadow-inner"
                      alt={item.name}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate uppercase tracking-tight">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{item.productCount || 0} Products</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEdit(item)} className="flex-1 h-9 font-bold">Edit</Button>
                    <Button
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      variant="ghost"
                      className="flex-1 h-9 border-2 border-destructive/20 text-destructive hover:bg-destructive hover:text-white font-bold"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </AdminFormContainer>
    </div>
  );
}
