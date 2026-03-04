"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

import { AdminFormContainer } from '@/components/utility/AdminFormContainer';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function ProductForm({ initialProduct, hideList = false, businessId }: { initialProduct?: any, hideList?: boolean, businessId?: string }) {
  const [products, setProducts] = useState<any>([]);
  const [formData, setFormData] = useState<any>({ 
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    categoryId: initialProduct?.categoryId || '',
    price: initialProduct?.price || 0,
    costPrice: initialProduct?.costPrice || 0,
    images: initialProduct?.images || null,
  });
  
  const [file, setFile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(initialProduct?.id || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hideList) fetchProducts();
    fetchCategories();
  }, [businessId]);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        categoryId: initialProduct.categoryId || '',
        price: initialProduct.price || 0,
        costPrice: initialProduct.costPrice || 0,
        images: initialProduct.images || null,
      });
      setEditId(initialProduct.id);
    }
  }, [initialProduct]);

  const fetchProducts = async () => {
    try {
      const url = `/api/dbhandler?model=product${businessId ? `&businessId=${businessId}` : ''}`;
      const res = await axios.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/dbhandler?model=category');
      setCategories(res.data);
      if (!formData.categoryId && res.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          categoryId: res.data[0].id,
        }));
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      price: 0,
      costPrice: 0,
      images: null,
    });
    setEditId(null);
    setFile(null);
    setPreview(null);
  };

  const handleImageChange = (e: any) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        if (selectedFile.size > 1000 * 1024) {
            toast.warning("File size greater than 1MB. Upload might be slow.");
        }
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const pformData = new FormData();

    if (file) pformData.append("file", file);
    pformData.append("name", formData.name);
    pformData.append("description", formData.description);
    pformData.append("categoryId", formData.categoryId);
    pformData.append("price", String(formData.price));
    if (formData.costPrice) pformData.append("costPrice", String(formData.costPrice));
    if (businessId) pformData.append("businessId", businessId);

    try {
      setLoading(true);
      if (editId) {
        await axios.put(`/api/dbhandler?model=product&id=${editId}`, pformData);
      } else {
        await axios.post(`/api/product`, pformData);
      }
      toast.success(editId ? "Product updated" : "Product created");
      resetForm();
      fetchProducts();
    } catch (error) {
      toast.error("Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;
    try {
      await axios.delete(`/api/dbhandler?model=product&id=${product.id}`);
      toast.success('Product deleted.');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setFile(null);
    setPreview(null);
    setFormData({
      name: product.name ?? '',
      description: product.description ?? '',
      categoryId: product.categoryId ?? '',
      price: product.price ?? 0,
      costPrice: product.costPrice ?? 0,
      images: product.images ?? [],
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <AdminFormContainer 
        title="Product Inventory" 
        description="Add and manage products in your digital storefront."
      >
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  placeholder="e.g. Premium Item"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-category">Category</Label>
                <Select 
                  value={formData.categoryId} 
                  onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                  <SelectTrigger id="product-category" className="h-11">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="product-desc">Description</Label>
                <Input
                  id="product-desc"
                  placeholder="Briefly describe the product"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="product-price">Price</Label>
                  <Input
                    id="product-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="h-11 font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="product-cost">Cost</Label>
                  <Input
                    id="product-cost"
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl bg-muted/20 space-y-4">
               {preview || formData.images?.[0] ? (
                 <img src={preview || formData.images[0]} alt="Preview" className="w-full aspect-square max-w-[200px] object-cover rounded-2xl shadow-xl border-4 border-white" />
               ) : (
                 <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                   <Package className="h-10 w-10 text-muted-foreground" />
                 </div>
               )}
               <div className="w-full space-y-1.5 text-center">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Modify Image</Label>
                 <Input
                   type="file"
                   accept="image/*"
                   onChange={handleImageChange}
                   className="h-10 text-xs pt-2 cursor-pointer border-none shadow-none bg-transparent hover:bg-accent/5 transition-colors"
                 />
               </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
            <Button type="submit" disabled={loading} className="flex-1 h-12 text-lg font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
              {loading ? "Processing..." : editId ? 'Update Product' : 'List Product'}
            </Button>
            {editId && <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-12 font-bold border-2">Cancel</Button>}
          </div>
        </form>

        {!hideList && (
          <div className='mt-12 space-y-6'>
            <div className="flex items-center justify-between">
               <h3 className="font-black text-lg uppercase tracking-widest text-primary/60">Recent Inventory</h3>
               <Badge variant="secondary" className="font-bold">{products.length}</Badge>
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-2xl border-2 border-transparent hover:bg-white hover:border-accent/10 transition-all group shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <img src={item.images?.[0] || "/placeholder.jpg"} className="h-10 w-10 rounded-lg object-cover border" />
                            <div className="truncate">
                              <p className="font-bold text-sm truncate">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">₦{(item.price || 0).toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-accent/10 text-accent" onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 text-destructive" onClick={() => handleDelete(item)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
              </div>
            ) : (
              <div className="p-10 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 bg-muted/20">
                <Package className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">Your inventory is currently empty.</p>
              </div>
            )}
          </div>
        )}
      </AdminFormContainer>
    </div>
  );
}

import { Package, Edit, Trash2 } from "lucide-react";
