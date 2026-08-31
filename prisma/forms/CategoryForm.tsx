"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Edit3, Trash2, GitMerge, Check, CheckCircle2, AlertCircle } from "lucide-react";
import { useAppContext } from "@/hooks/useAppContext";
import { prepareImageForUpload } from "@/lib/compress-image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface CategoriesFormProps {
  initialCategory?: any;
  hideList?: boolean;
}

export default function CategoriesForm({ initialCategory, hideList = false }: CategoriesFormProps) {
  const { currentBusiness, user } = useAppContext();
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
  const [mergeMode, setMergeMode] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergeForm, setMergeForm] = useState({ name: "", description: "", image: "" });
  const [mergeFile, setMergeFile] = useState<File | null>(null);
  const [mergePreview, setMergePreview] = useState<string | null>(null);
  const [mergeImageSource, setMergeImageSource] = useState<string>("");
  const [resultDialog, setResultDialog] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileKey, setFileKey] = useState("file-0"); // Unique key to reset input

  const fetchCategories = useCallback(async () => {
    try {
      const businessId = currentBusiness?.id;
      const url = businessId ? `/api/dbhandler?model=category&businessId=${businessId}` : "/api/dbhandler?model=category";
      const res = await axios.get(url);
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  }, [currentBusiness?.id]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;

    if (!selected) return;

    try {
      const preparedFile = await prepareImageForUpload(selected);
      setFile(preparedFile);
      setPreview(URL.createObjectURL(preparedFile));
      if (preparedFile !== selected) {
        toast.success("Image compressed to WebP and prepared for upload");
      }
    } catch (error) {
      e.target.value = "";
      toast.error(error instanceof Error ? error.message : "Could not process image");
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", formData.name.trim());
      data.append("description", formData.description.trim());

      if (file) {
        data.append("file", file); // new upload
      } else if (editId && formData.image) {
        data.append("image", formData.image); // keep existing image
      }

      if (editId) data.append("id", editId);

      const config = { headers: { "Content-Type": "multipart/form-data" } };

      if (currentBusiness?.id) {
        data.append("businessId", currentBusiness.id);
      }

      if (user?.id && user.id !== "nil") {
        data.append("userId", user.id);
      }

      if (editId) {
        await axios.put(`/api/dbhandler?model=category&id=${editId}`, data, config);
      } else {
        await axios.post(`/api/dbhandler?model=category`, data, config);
      }

      setLoading(false);
      setResultDialog({
        open: true,
        type: "success",
        title: editId ? "Category Updated" : "Category Created",
        message: editId ? "Category updated successfully." : "Category created successfully.",
      });
      toast.success(editId ? "Category updated" : "Category created");
      resetForm();
      fetchCategories();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setResultDialog({
        open: true,
        type: "error",
        title: "Save Failed",
        message: "Failed to save category. Please try again.",
      });
      toast.error("Failed to save category");
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
    setFileKey(`file-${Date.now()}`); // Reset input key
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete this category?`)) return;
    try {
      await axios.delete(`/api/dbhandler?model=category&id=${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
      console.error("Failed to delete category:", err);
    }
  };

  const resetForm = () => {
    setFormData({ id: "", name: "", description: "", image: "" });
    setFile(null);
    setPreview(null);
    setEditId(null);
    setFileKey(`file-${Date.now()}`); // Reset input key
  };

  const handleMergeSelection = (categoryId: string) => {
    setSelectedForMerge((current) => current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId]);
  };

  const handleMergeFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) return;

    try {
      const preparedFile = await prepareImageForUpload(selected);
      setMergeFile(preparedFile);
      setMergePreview(URL.createObjectURL(preparedFile));
      setMergeForm((previous) => ({ ...previous, image: "" }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not process merge image");
    }
  };

  const handleMergeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (selectedForMerge.length < 2) {
      toast.error("Select at least two categories to merge");
      return;
    }

    if (!mergeForm.name.trim()) {
      toast.error("A new category name is required");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", mergeForm.name);
      data.append("description", mergeForm.description);
      if (mergeFile) data.append("file", mergeFile);
      else if (mergeImageSource) data.append("image", mergeImageSource);
      if (currentBusiness?.id) data.append("businessId", currentBusiness.id);
      if (user?.id && user.id !== "nil") data.append("userId", user.id);
      data.append("mergedCategoryIds", JSON.stringify(selectedForMerge));

      const response = await axios.post("/api/dbhandler?model=category", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Merged ${selectedForMerge.length} categories into ${response.data.name || mergeForm.name}`);
      setSelectedForMerge([]);
      setMergeForm({ name: "", description: "", image: "" });
      setMergePreview(null);
      setMergeFile(null);
      setMergeDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to merge categories");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-h-[72vh] overflow-y-auto">
      <Dialog open={resultDialog.open} onOpenChange={(open) => setResultDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${resultDialog.type === "success" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
              {resultDialog.type === "success" ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
            </div>
            <DialogTitle className="text-xl font-bold">{resultDialog.title}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground my-2">{resultDialog.message}</p>
          <DialogFooter className="sm:justify-center">
            <Button type="button" onClick={() => setResultDialog((prev) => ({ ...prev, open: false }))}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Merge selected categories</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleMergeSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="merge-name">New category name</Label>
              <Input id="merge-name" value={mergeForm.name} onChange={(event) => setMergeForm((previous) => ({ ...previous, name: event.target.value }))} placeholder="e.g. Health Essentials" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="merge-description">Description</Label>
              <Input id="merge-description" value={mergeForm.description} onChange={(event) => setMergeForm((previous) => ({ ...previous, description: event.target.value }))} placeholder="Short description" />
            </div>

            <div className="space-y-1">
              <Label htmlFor="merge-image">Image</Label>
              <Input id="merge-image" type="file" accept="image/*" onChange={handleMergeFileChange} />
            </div>

            {categories.filter((item) => selectedForMerge.includes(item.id)).length > 0 && (
              <div className="space-y-1">
                <Label htmlFor="merge-image-source">Or use an existing merged category image</Label>
                <select id="merge-image-source" value={mergeImageSource} onChange={(event) => setMergeImageSource(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3 text-sm">
                  <option value="">No image selected</option>
                  {categories.filter((item) => selectedForMerge.includes(item.id)).map((item) => (
                    <option key={item.id} value={item.image || ""}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(mergePreview || mergeImageSource) && (
              <img src={mergePreview || mergeImageSource} alt="Merged category preview" className="h-20 w-20 rounded-md border object-cover" />
            )}

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setMergeDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>Merge categories</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full max-w-sm gap-3 p-4 border-2 border-secondary-foreground rounded-md m-2"
      >
        <h2 className="font-semibold text-lg">Manage Product Categories</h2>

        <div className="w-full space-y-1">
          <Label htmlFor="cat-name">Category Name</Label>
          <Input
            id="cat-name"
            type="text"
            placeholder="Name of category"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
        </div>

        <div className="w-full space-y-1">
          <Label htmlFor="cat-desc">Description</Label>
          <Input
            id="cat-desc"
            type="text"
            placeholder="Short description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </div>

        <div className="w-full space-y-1">
          <Label htmlFor="cat-image">Category Image</Label>
          <Input
            id="cat-image"
            ref={fileInputRef}
            key={fileKey}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 rounded-md mt-2 border"
          />
        ) : formData.image ? (
          <img
            src={formData.image}
            alt="Category"
            className="w-20 h-20 rounded-md mt-2 border"
          />
        ) : null}

        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : editId ? "Update" : "Create"}
        </Button>

        {editId && (
          <Button
            type="button"
            variant="ghost"
            onClick={resetForm}
            className="text-sm underline"
          >
            Cancel Edit
          </Button>
        )}

        {!hideList && (
          <div className="w-full mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Categories</p>
              <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => setMergeMode((value) => !value)}>
                <GitMerge className="h-4 w-4" />
                {mergeMode ? "Cancel" : "Merge"}
              </Button>
            </div>

            {mergeMode && selectedForMerge.length > 1 && (
              <Button type="button" className="w-full" onClick={() => setMergeDialogOpen(true)}>
                Merge selected categories
              </Button>
            )}

            <ul className="w-full space-y-2">
              {categories.map((item, index) => (
                <li
                  key={item.id}
                  className="flex flex-col items-center gap-2 my-2 bg-secondary rounded-md w-full p-3"
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {mergeMode && (
                        <button type="button" onClick={() => handleMergeSelection(item.id)} className={`flex h-5 w-5 items-center justify-center rounded border ${selectedForMerge.includes(item.id) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 bg-background"}`}>
                          {selectedForMerge.includes(item.id) && <Check className="h-3 w-3" />}
                        </button>
                      )}
                      <p className="font-medium">
                        {index + 1}. {item.name}
                      </p>
                    </div>
                  </div>

                  {item.image && (
                    <img
                      src={item.image}
                      className="w-16 h-16 rounded-md border"
                      alt="category"
                    />
                  )}

                  <div className="flex flex-row gap-2 w-full">
                    <Button
                      type="button"
                      size="icon"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEdit(item)}
                      aria-label={`Edit ${item.name}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>

                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDelete(item.id)}
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  );
}
