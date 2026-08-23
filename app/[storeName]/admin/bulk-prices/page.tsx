"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Save, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/myComponents/subs/productCard";
import { useAppContext } from "@/hooks/useAppContext";
import { getVariantPriceRange, getVariantAmount } from "@/components/myComponents/subs/variantCard";
import { toast } from "sonner";

type ProductDraft = any;

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return <div className="flex items-center justify-center gap-2 py-3">
    <Button size="icon" variant="outline" disabled={page === 1} onClick={() => onChange(page - 1)}><ChevronLeft className="h-4 w-4" /></Button>
    <span className="text-sm font-bold">Page {page} of {totalPages}</span>
    <Button size="icon" variant="outline" disabled={page === totalPages} onClick={() => onChange(page + 1)}><ChevronRight className="h-4 w-4" /></Button>
  </div>;
}

export default function BulkPricesPage() {
  const { storeName } = useParams<{ storeName: string }>();
  const router = useRouter();
  const { currentBusiness } = useAppContext();
  const [products, setProducts] = useState<ProductDraft[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [saving, setSaving] = useState(false);
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const businessId = currentBusiness?.id;

  const load = useCallback(async (nextPage: number, nextCategory = categoryId) => {
    if (!businessId) return;
    try {
      const response = await axios.get(`/api/bulk-prices?businessId=${businessId}&page=${nextPage}${nextCategory ? `&categoryId=${nextCategory}` : ""}`);
      setProducts(response.data.products || []);
      setTotalPages(response.data.totalPages || 1);
      setPage(nextPage);
    } catch (error: any) {
      if (error.response?.status === 403) router.replace(`/${storeName}/store`);
      else toast.error("Could not load prices");
    }
  }, [businessId, categoryId, router, storeName]);

  useEffect(() => {
    if (!businessId) return;
    axios.get(`/api/dbhandler?model=category&businessId=${businessId}&limit=500`).then((response) => setCategories(response.data || [])).catch(() => setCategories([]));
    load(1);
  }, [businessId, load]);

  const updateProduct = (id: string, update: any) => setProducts((items) => items.map((product) => product.id === id ? { ...product, ...update } : product));
  const save = async () => {
    if (!businessId) return;
    setSaving(true);
    try {
      await axios.put(`/api/bulk-prices?businessId=${businessId}`, { products: products.map((product) => ({ id: product.id, price: product.price, variants: (product.variants || []).map((variant: any) => ({ id: variant.id, price: getVariantAmount(variant) })) })) });
      toast.success("Prices saved");
    } catch (error) { toast.error("Could not save prices"); }
    finally { setSaving(false); }
  };
  const changePage = async (nextPage: number) => { await save(); await load(nextPage); };
  const changeCategory = async (nextCategory: string) => { await save(); setCategoryId(nextCategory); await load(1, nextCategory); };

  const ownerReady = Boolean(currentBusiness?.ownerId && currentBusiness.ownerId === (currentBusiness as any)?.ownerId);
  const pageTitle = useMemo(() => categoryId ? categories.find((category) => category.id === categoryId)?.name || "Category" : "All products", [categories, categoryId]);
  if (!ownerReady && businessId) return <div className="mx-auto max-w-3xl p-8 text-center">Only the store owner can access bulk pricing.</div>;

  return <main className="mx-auto max-w-7xl px-3 py-6 md:px-6">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-2xl font-black">Bulk Price Editor</h1><p className="text-sm text-muted-foreground">{pageTitle} · Up to 20 products per page</p></div>
      <div className="flex gap-2"><Button size="icon" variant={layout === "grid" ? "default" : "outline"} onClick={() => setLayout("grid")} title="Grid layout"><LayoutGrid className="h-4 w-4" /></Button><Button size="icon" variant={layout === "list" ? "default" : "outline"} onClick={() => setLayout("list")} title="List layout"><LayoutList className="h-4 w-4" /></Button><Button onClick={save} disabled={saving} className="fixed bottom-5 right-5 z-40 gap-2 shadow-xl"><Save className="h-4 w-4" />{saving ? "Saving" : "Save page"}</Button></div>
    </div>
    <div className="mb-4"><label htmlFor="bulk-category" className="mr-2 text-sm font-bold">Category</label><select id="bulk-category" value={categoryId} onChange={(event) => changeCategory(event.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
    <Pagination page={page} totalPages={totalPages} onChange={changePage} />
    <div className={layout === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" : "grid grid-cols-1 gap-4"}>
      {products.map((product) => <EditableProductCard key={product.id} product={product} layout={layout} onChange={(update) => updateProduct(product.id, update)} />)}
    </div>
    {!products.length && <p className="py-20 text-center text-muted-foreground">No products in this category.</p>}
    <Pagination page={page} totalPages={totalPages} onChange={changePage} />
    <div className="flex justify-center py-6"><Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />Save all changes</Button></div>
  </main>;
}

function EditableProductCard({ product, onChange, layout }: { product: any; onChange: (update: any) => void; layout: "grid" | "list" }) {
  const variants = Array.isArray(product.variants) ? product.variants : [];
  const [editingVariants, setEditingVariants] = useState(false);
  const range = getVariantPriceRange(variants);
  const priceText = range ? `₦${Math.ceil(range.minimum)} - ₦${Math.ceil(range.maximum)}` : `₦${product.price || 0}`;
  const updateVariant = (id: string, value: string) => onChange({ variants: variants.map((variant: any) => variant.id === id ? { ...variant, prices: [{ ...(variant.prices?.[0] || {}), amount: Number(value), calculatedAmount: Number(value) }] } : variant) });
  return <div className="relative">
    <ProductCard product={{ ...product, inStock: true }} orientation={layout === "grid" ? "vertical" : "horizontal"} priceEditor={<div className="w-full"><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); if (variants.length) setEditingVariants((open) => !open); }} className="w-full text-left font-medium text-foreground">{priceText}</button>{editingVariants && <div className="mt-2 space-y-2 rounded-md border bg-background p-2" onClick={(event) => event.stopPropagation()}>{variants.map((variant: any) => <div key={variant.id}><label className="block truncate text-[10px] text-muted-foreground">{variant.title}</label><input type="number" value={getVariantAmount(variant) || 0} onChange={(event) => updateVariant(variant.id, event.target.value)} className="h-8 w-full rounded border px-2 text-sm" /></div>)}</div>}</div>} onAddToCart={() => undefined} />
  </div>;
}
