"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

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
    <div className="w-full">
      <form onSubmit={handleSubmit} className='flex flex-col w-full gap-4 p-6 border rounded-2xl bg-card shadow-sm'>
        <h2 className="text-xl font-bold">Product Details</h2>

        <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                    id="product-name"
                    placeholder="e.g. Premium Item"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                />
            </div>

            <div className="space-y-1">
                <Label htmlFor="product-category">Category</Label>
                <Select 
                    value={formData.categoryId} 
                    onValueChange={(v) => setFormData({ ...formData, categoryId: v })}
                >
                    <SelectTrigger id="product-category">
                        <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>

        <div className="space-y-1">
            <Label htmlFor="product-desc">Description</Label>
            <Input
                id="product-desc"
                placeholder="Briefly describe the product"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
        </div>

        <div className="grid gap-4 grid-cols-2">
            <div className="space-y-1">
                <Label htmlFor="product-price">Selling Price</Label>
                <Input
                    id="product-price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                />
            </div>
            <div className="space-y-1">
                <Label htmlFor="product-cost">Cost Price</Label>
                <Input
                    id="product-cost"
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                />
            </div>
        </div>

        <div className="space-y-2">
            <Label>Product Image</Label>
            <div className="flex flex-col items-center gap-4 border-2 border-dashed rounded-xl p-4 bg-muted/20">
                {(preview || formData.images?.[0]) && (
                    <img src={preview || formData.images[0]} alt="Preview" className="h-32 w-32 object-cover rounded-lg border shadow-sm" />
                )}
                <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                />
            </div>
        </div>

        <div className="flex gap-2">
            <Button type="submit" className="flex-1 bg-accent hover:bg-accent/90">
                {editId ? 'Update Product' : 'Create Product'}
            </Button>
            {editId && <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>}
        </div>

        {!hideList && (
          <div className='mt-8 space-y-4'>
            <h3 className="font-bold border-b pb-2">Recent Products</h3>
            {products.length > 0 ? (
              <div className="grid gap-2">
                {products.map((item: any, index: number) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group">
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{index + 1}.</span>
                            <span className="font-bold text-sm">{item.name}</span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="ghost" className="h-8" onClick={() => handleEdit(item)}>Edit</Button>
                            <Button size="sm" variant="ghost" className="h-8 text-destructive" onClick={() => handleDelete(item)}>Delete</Button>
                        </div>
                    </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No products found in this business.</p>
            )}
          </div>
        )}
      </form>
    </div>
  );
}