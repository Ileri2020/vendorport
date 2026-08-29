"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, PackagePlus, Link2, Check, Plus, X, ChevronLeft, ChevronRight, FolderPlus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PlatformProductWorkspaceProps {
  business?: { id: string; ownerId: string; name: string } | null;
}

export default function PlatformProductWorkspace({ business = null }: PlatformProductWorkspaceProps) {
  const { data: session } = useSession();
  const isOwner = Boolean(business && session?.user?.id && (String(business.ownerId) === String(session.user.id) || session.user.role === "admin"));
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [businessCategories, setBusinessCategories] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", costPrice: "", categoryId: "", variants: [] as Array<{ title: string; weight: string; volume: string; price: string }> });
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [catalogMode, setCatalogMode] = useState<"products" | "categories" | null>(null);
  const [productPage, setProductPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryDialog, setCategoryDialog] = useState<any | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [categoryProductsLoading, setCategoryProductsLoading] = useState(false);
  const [categoryProductSelection, setCategoryProductSelection] = useState<string[]>([]);
  const [saveSuccessDialog, setSaveSuccessDialog] = useState<{ title: string; message: string } | null>(null);
  const ITEMS_PER_PAGE = 20;

  const loadProducts = async () => {
    const response = await fetch(`/api/platform-products?query=${encodeURIComponent(query)}`);
    if (!response.ok) return;
    setProducts(await response.json());
  };

  useEffect(() => {
    if (session?.user?.id) loadProducts();
  }, [session?.user?.id, query]);

  useEffect(() => {
    if (!business?.id || !isOwner) return;
    fetch(`/api/dbhandler?model=category&businessId=${business.id}`)
      .then((response) => response.json())
      .then(setBusinessCategories)
      .catch(() => toast.error("Could not load business categories"));
  }, [business?.id, isOwner]);

  useEffect(() => {
    fetch("/api/dbhandler?model=category")
      .then((response) => response.json())
      .then(setCategories)
      .catch(() => toast.error("Could not load categories"));
  }, []);

  useEffect(() => {
    setProductPage(1);
  }, [query]);

  useEffect(() => {
    setCategoryPage(1);
  }, [categoryQuery]);

  useEffect(() => {
    setProductPage(1);
  }, [minPrice, maxPrice]);

  useEffect(() => {
    if (!categoryDialog) return;
    setCategoryProductsLoading(true);
    fetch(`/api/platform-products?categoryId=${encodeURIComponent(categoryDialog.id)}`)
      .then((response) => response.ok ? response.json() : [])
      .then(setCategoryProducts)
      .catch(() => toast.error("Could not load category products"))
      .finally(() => setCategoryProductsLoading(false));
  }, [categoryDialog]);

  const createCategory = async () => {
    if (!newCategory.name.trim()) return toast.error("Enter a category name");
    const response = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCategory),
    });
    const result = await response.json();
    if (!response.ok) return toast.error(result.error || "Could not create category");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("vport:clear-api-cache"));
    }
    setCategories((items) => items.some((item) => item.id === result.id) ? items : [result, ...items]);
    setForm((previous) => ({ ...previous, categoryId: result.id }));
    setNewCategory({ name: "", description: "" });
    setShowNewCategory(false);
    toast.success("Category ready for this product");
  };

  const createProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/platform-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not create product");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vport:clear-api-cache"));
      }
      setForm({ name: "", description: "", price: "", costPrice: "", categoryId: "", variants: [] });
      toast.success("Platform product created");
      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create product");
    } finally {
      setLoading(false);
    }
  };

  const attachProducts = async () => {
    if (!business || selected.length === 0 || !categoryId) return toast.error("Select products and a category");
    setLoading(true);
    try {
      const response = await fetch("/api/platform-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attach", businessId: business.id, categoryId, productIds: selected }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not attach products");
      toast.success(`${result.attached} product${result.attached === 1 ? "" : "s"} added to ${business.name}`);
      setSelected([]);
      setCategoryId("");
      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not attach products");
    } finally {
      setLoading(false);
    }
  };

  const attachCategories = async () => {
    if (!business || selectedCategories.length === 0 || !categoryId) return toast.error("Select categories and a store category");
    setLoading(true);
    try {
      const results = await Promise.all(selectedCategories.map(async (sourceCategoryId) => {
        const response = await fetch("/api/platform-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "attach-category", businessId: business.id, categoryId, sourceCategoryId }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not attach category");
        return result.attached || 0;
      }));
      toast.success(`${results.reduce((total, count) => total + count, 0)} products added to ${business.name}`);
      setSelectedCategories([]);
      setCategoryId("");
      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not attach categories");
    } finally {
      setLoading(false);
    }
  };

  const attachCategoryProducts = async (allProducts: boolean) => {
    if (!business || !categoryDialog || !categoryId) return toast.error("Select a store category first");
    const productIds = allProducts ? categoryProducts.map((product) => product.id) : categoryProductSelection;
    if (productIds.length === 0) return toast.error("Select at least one product");
    setLoading(true);
    try {
      const response = await fetch("/api/platform-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "attach", businessId: business.id, categoryId, productIds }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not attach category products");
      toast.success(`${result.attached} product${result.attached === 1 ? "" : "s"} added to ${business.name}`);
      setCategoryDialog(null);
      setCategoryProducts([]);
      setCategoryProductSelection([]);
      setCategoryId("");
      await loadProducts();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not attach category products");
    } finally {
      setLoading(false);
    }
  };

  const saveSelectedCatalog = async () => {
    if (!business || (!selected.length && !selectedCategories.length)) {
      toast.error("Select at least one product or category");
      return;
    }
    const targetCategoryId = categoryId || (businessCategories.length === 1 ? String(businessCategories[0].id) : "");

    setLoading(true);
    try {
      let addedProducts = 0;
      if (selectedCategories.length) {
        const categoryResults = await Promise.all(selectedCategories.map(async (sourceCategoryId) => {
          const response = await fetch("/api/platform-products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "attach-category", businessId: business.id, categoryId: targetCategoryId || undefined, sourceCategoryId }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Could not add categories");
          return Number(result.attached) || 0;
        }));
        addedProducts += categoryResults.reduce((total, count) => total + count, 0);
      }

      if (selected.length) {
        const response = await fetch("/api/platform-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "attach", businessId: business.id, categoryId: targetCategoryId || undefined, productIds: selected }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not add products");
        addedProducts += Number(result.attached) || 0;
      }

      const savedProducts = selected.length;
      const savedCategories = selectedCategories.length;
      const itemText = addedProducts === 1 ? "item" : "items";
      const productText = savedProducts === 1 ? "product" : "products";
      const categoryText = savedCategories === 1 ? "category" : "categories";

      const title = "Saved successfully";
      const message =
        savedProducts > 0 && savedCategories > 0
          ? `Saved ${savedProducts} ${productText} and ${savedCategories} ${categoryText} to ${business.name}.`
          : savedProducts > 0
            ? `Saved ${savedProducts} ${productText} to ${business.name}.`
            : savedCategories > 0
              ? `Saved ${savedCategories} ${categoryText} to ${business.name}.`
              : `Saved ${addedProducts} ${itemText} to ${business.name}.`;

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("vport:clear-api-cache"));
      }

      toast.success(message);
      setSaveSuccessDialog({ title, message });
      setSelected([]);
      setSelectedCategories([]);
      setCategoryId("");
      await loadProducts();
    } catch (error) {
      console.error(error);
      toast.error("Could not save selected items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) => !category.businessId && category.name.toLowerCase().includes(categoryQuery.toLowerCase()));
  const filteredProducts = products.filter((product) => {
    const price = Number(product.price) || 0;
    const minimum = minPrice === "" ? 0 : Number(minPrice);
    const maximum = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);
    return price >= minimum && price <= maximum;
  });
  const visibleProducts = filteredProducts.slice((productPage - 1) * ITEMS_PER_PAGE, productPage * ITEMS_PER_PAGE);
  const visibleCategories = filteredCategories.slice((categoryPage - 1) * ITEMS_PER_PAGE, categoryPage * ITEMS_PER_PAGE);
  const productPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const categoryPages = Math.max(1, Math.ceil(filteredCategories.length / ITEMS_PER_PAGE));

  if (!session?.user?.id) {
    return <div className="mx-auto max-w-xl p-10 text-center">Sign in to create and manage platform products.</div>;
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-10">
      <header>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Vport Catalog</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight">New Product</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Create products in the shared platform catalog. Products stay outside every website until a business owner adds them to a category.
        </p>
      </header>

      <section className="rounded-2xl border border-primary/25 bg-primary/5 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary p-2 text-primary-foreground"><PackagePlus className="h-5 w-5" /></div>
          <div>
            <h2 className="text-lg font-black">Are you a company or business with new products?</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
              You can create cards for your products for your sellers to be able to add your products and all its variants to their store easily without stress.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Button type="button" size="lg" variant={createOpen ? "default" : "outline"} aria-expanded={createOpen} className="h-auto border-2 border-accent/70  shadow-md shadow-accent/20 justify-between gap-3 p-5 text-left" onClick={() => setCreateOpen((open) => !open)}><span className="flex items-center gap-3"><PackagePlus className="h-5 w-5" /><span><span className="block font-bold">Create product for the platform</span><span className="mt-1 block text-xs font-normal opacity-75">Open the product card form</span></span></span><ChevronDown className={`h-4 w-4 transition-transform ${createOpen ? "rotate-180" : ""}`} /></Button>
        {isOwner && <Button type="button" size="lg" variant={catalogMode === "products" ? "default" : "outline"} aria-expanded={catalogMode === "products"} className="h-auto border-2 border-accent/70  shadow-md shadow-accent/20 justify-between gap-3 p-5 text-left" onClick={() => setCatalogMode(catalogMode === "products" ? null : "products")}><span className="flex items-center gap-3"><Link2 className="h-5 w-5" /><span><span className="block font-bold">Add platform products</span><span className="mt-1 block text-xs font-normal opacity-75">Search and choose product cards</span></span></span><ChevronDown className={`h-4 w-4 transition-transform ${catalogMode === "products" ? "rotate-180" : ""}`} /></Button>}
        {isOwner && <Button type="button" size="lg" variant={catalogMode === "categories" ? "default" : "outline"} aria-expanded={catalogMode === "categories"} className="h-auto border-2 border-accent/70  shadow-md shadow-accent/20 justify-between gap-3 p-5 text-left" onClick={() => setCatalogMode(catalogMode === "categories" ? null : "categories")}><span className="flex items-center gap-3"><FolderPlus className="h-5 w-5" /><span><span className="block font-bold">Add platform categories</span><span className="mt-1 block text-xs font-normal opacity-75">Browse category cards and products</span></span></span><ChevronDown className={`h-4 w-4 transition-transform ${catalogMode === "categories" ? "rotate-180" : ""}`} /></Button>}
      </section>

      {createOpen && <section className="rounded-2xl border bg-card p-5 shadow-sm">
        <form onSubmit={createProduct} className="space-y-4">
          <div className="flex items-center gap-2 font-bold"><PackagePlus className="h-5 w-5 text-primary" /> Create platform product</div>
          <div><Label htmlFor="platform-product-name">Name</Label><Input id="platform-product-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><Label htmlFor="platform-product-description">Description</Label><Input id="platform-product-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="platform-product-cost">Cost</Label><Input id="platform-product-cost" type="number" min="0" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })} /></div>
            <div><Label htmlFor="platform-product-price">Price</Label><Input id="platform-product-price" required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
          </div>
          <div>
            <Label htmlFor="platform-product-category">Category (optional)</Label>
            <select id="platform-product-category" value={form.categoryId} onChange={(e) => {
              if (e.target.value === "__new__") setShowNewCategory(true);
              else setForm({ ...form, categoryId: e.target.value });
            }} className="mt-1 h-10 w-full rounded-md border bg-background px-3 text-sm">
              <option value="">No category yet</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.businessId ? " (business)" : ""}</option>)}
              <option value="__new__">+ Create new category</option>
            </select>
            {showNewCategory && <div className="mt-3 space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
              <Input placeholder="Category name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
              <Input placeholder="Description (optional)" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
              <div className="flex gap-2"><Button type="button" size="sm" onClick={createCategory}>Create category</Button><Button type="button" size="sm" variant="ghost" onClick={() => setShowNewCategory(false)}>Cancel</Button></div>
            </div>}
          </div>
          <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <div><Label>Product variants</Label><p className="text-xs text-muted-foreground">Add sizes, packs, or other options sellers can offer.</p></div>
              <Button type="button" size="sm" variant="outline" onClick={() => setForm({ ...form, variants: [...form.variants, { title: "", weight: "", volume: "", price: "" }] })}><Plus className="mr-1 h-3 w-3" /> Add variant</Button>
            </div>
            {form.variants.map((variant, index) => <div key={index} className="relative grid gap-2 rounded-lg border bg-background p-3 sm:grid-cols-3">
              <Button type="button" variant="ghost" size="icon" className="absolute -right-1 -top-1 h-6 w-6 text-destructive" onClick={() => setForm({ ...form, variants: form.variants.filter((_, itemIndex) => itemIndex !== index) })}><X className="h-3 w-3" /></Button>
              <Input placeholder="Variant name (e.g. 1 carton)" value={variant.title} onChange={(e) => { const variants = [...form.variants]; variants[index] = { ...variant, title: e.target.value }; setForm({ ...form, variants }); }} />
              <Input placeholder="Weight or volume" value={variant.weight || variant.volume} onChange={(e) => { const variants = [...form.variants]; variants[index] = { ...variant, weight: e.target.value }; setForm({ ...form, variants }); }} />
              <Input type="number" min="0" placeholder="Variant price" value={variant.price} onChange={(e) => { const variants = [...form.variants]; variants[index] = { ...variant, price: e.target.value }; setForm({ ...form, variants }); }} />
            </div>)}
          </div>
          <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating..." : "Create Product Card"}</Button>
        </form>
      </section>}

      {catalogMode === "products" && <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-bold">Platform products</h2><p className="text-xs text-muted-foreground">Search products created by the community.</p></div>
            <div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-md">
            <Input type="number" min="0" placeholder="Minimum price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
            <Input type="number" min="0" placeholder="Maximum price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
          </div>
          <div className="mt-5 space-y-2">
            {visibleProducts.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No unassigned platform products found.</p> : visibleProducts.map((product) => {
              const checked = selected.includes(product.id);
              return <button type="button" key={product.id} onClick={() => setSelected((items) => checked ? items.filter((id) => id !== product.id) : [...items, product.id])} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${checked ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                <span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{checked && <Check className="h-3 w-3" />}</span>
                <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">{product.images?.[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <PackagePlus className="m-4 h-5 w-5 text-muted-foreground" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{product.name}</span><span className="text-xs text-muted-foreground">₦{Number(product.price).toLocaleString()} · {product.variants?.length || 0} variant{product.variants?.length === 1 ? "" : "s"} · by {product.creator?.name || "Vport user"}</span></span><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-primary text-primary"}`} aria-hidden="true"><Plus className="h-4 w-4" /></span>
              </button>;
            })}
          </div>
          {productPages > 1 && <div className="mt-4 flex items-center justify-center gap-3"><Button type="button" size="icon" variant="outline" disabled={productPage === 1} onClick={() => setProductPage((page) => page - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-xs text-muted-foreground">Page {productPage} of {productPages}</span><Button type="button" size="icon" variant="outline" disabled={productPage === productPages} onClick={() => setProductPage((page) => page + 1)}><ChevronRight className="h-4 w-4" /></Button></div>}
        </section>}

      {catalogMode === "categories" && isOwner && <section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">Platform categories</h2><p className="text-xs text-muted-foreground">Each card shows products available in that category.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search categories" value={categoryQuery} onChange={(e) => setCategoryQuery(e.target.value)} /></div></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCategories.map((category) => <div key={category.id} className="overflow-hidden rounded-xl border bg-background text-left transition hover:border-primary hover:shadow-md"><div className="grid h-28 grid-cols-3 gap-1 bg-muted p-1">{(category.products || []).slice(0, 3).map((product: any, index: number) => <div key={index} className="overflow-hidden rounded-md bg-background">{product.images?.[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <PackagePlus className="m-auto mt-9 h-5 w-5 text-muted-foreground" />}</div>)}</div><div className="p-3"><h3 className="font-bold">{category.name}</h3><p className="mt-1 text-xs text-muted-foreground">{category._count?.products || 0} products</p><div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => { setCategoryDialog(category); setCategoryProductSelection([]); }}><Check className="mr-1 h-3 w-3" />Choose products</Button><Button type="button" size="sm" className="flex-1" onClick={() => setSelectedCategories((items) => items.includes(category.id) ? items.filter((id) => id !== category.id) : [...items, category.id])}><Plus className="mr-1 h-3 w-3" />Add category</Button></div></div></div>)}
        </div>
        {categoryPages > 1 && <div className="flex items-center justify-center gap-3"><Button type="button" size="icon" variant="outline" disabled={categoryPage === 1} onClick={() => setCategoryPage((page) => page - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-xs text-muted-foreground">Page {categoryPage} of {categoryPages}</span><Button type="button" size="icon" variant="outline" disabled={categoryPage === categoryPages} onClick={() => setCategoryPage((page) => page + 1)}><ChevronRight className="h-4 w-4" /></Button></div>}
      </section>}

      {isOwner && catalogMode === "products" && <section className="space-y-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div><div className="flex items-center gap-2 font-bold"><Link2 className="h-5 w-5 text-primary" /> Add products or categories to {business?.name}</div><p className="mt-1 text-sm text-muted-foreground">Select individual product cards, or select one or more platform categories to add their available products and variants together.</p></div>
        <div className="space-y-3 rounded-xl border bg-background/70 p-4">
          <div className="flex items-center justify-between gap-2"><div><h3 className="font-bold">Select categories</h3><p className="text-xs text-muted-foreground">Choose source categories from the shared catalog.</p></div><span className="text-xs font-bold text-primary">{selectedCategories.length} selected</span></div>
          <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {categories.filter((category) => !category.businessId).map((category) => {
              const checked = selectedCategories.includes(category.id);
              return <button type="button" key={category.id} onClick={() => setSelectedCategories((items) => checked ? items.filter((id) => id !== category.id) : [...items, category.id])} className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm ${checked ? "border-primary bg-primary/10" : "hover:bg-muted"}`}><span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{checked && <Check className="h-3 w-3" />}</span><span className="truncate">{category.name}</span></button>;
            })}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm sm:max-w-xs"><option value="">Store category for selected items</option>{businessCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></div>
        </div>
        <div className="border-t pt-5">
        <h3 className="font-bold">Add selected product cards</h3>
        <p className="mt-1 text-sm text-muted-foreground">Choose one of your categories. Selected platform products will become part of this website.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm sm:max-w-xs"><option value="">Select category</option>{businessCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        </div>
        </div>
      </section>}

      {isOwner && catalogMode === "categories" && <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Store category for selected items</option>{businessCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><span className="text-sm text-muted-foreground">{selectedCategories.length} category{selectedCategories.length === 1 ? "" : "ies"} selected</span></div></section>}

      {isOwner && (selected.length > 0 || selectedCategories.length > 0) && (
        <Button
          type="button"
          size="lg"
          onClick={saveSelectedCatalog}
          disabled={loading}
          className="fixed bottom-6 right-6 z-50 animate-pulse gap-2 rounded-full px-6 py-4 shadow-2xl shadow-primary/20 font-semibold"
        >
          <Check className="h-5 w-5" />
          {loading ? "Saving..." : `Save selected (${selected.length + selectedCategories.length})`}
        </Button>
      )}

      <Dialog open={Boolean(saveSuccessDialog)} onOpenChange={(open) => { if (!open) setSaveSuccessDialog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{saveSuccessDialog?.title || "Saved successfully"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">{saveSuccessDialog?.message || "Your selected items were saved successfully."}</p>
            </div>
            <Button type="button" onClick={() => setSaveSuccessDialog(null)} className="w-full font-semibold">Done</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(categoryDialog)} onOpenChange={(open) => { if (!open) { setCategoryDialog(null); setCategoryProducts([]); setCategoryProductSelection([]); } }}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Add products from {categoryDialog?.name}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Add every product in this category or choose only the products you want for your store.</p>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="h-10 rounded-md border bg-background px-3 text-sm"><option value="">Select your store category</option>{businessCategories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          {categoryProductsLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading products...</p> : <div className="grid gap-2 sm:grid-cols-2">{categoryProducts.map((product) => { const checked = categoryProductSelection.includes(product.id); return <button type="button" key={product.id} onClick={() => setCategoryProductSelection((items) => checked ? items.filter((id) => id !== product.id) : [...items, product.id])} className={`flex items-center gap-2 rounded-lg border p-2 text-left ${checked ? "border-primary bg-primary/10" : "hover:bg-muted"}`}><span className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">{product.images?.[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <PackagePlus className="m-3 h-5 w-5 text-muted-foreground" />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{product.name}</span><span className="text-xs text-muted-foreground">₦{Number(product.price).toLocaleString()}</span></span>{checked && <Check className="h-4 w-4 text-primary" />}</button>; })}</div>}
          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row"><Button type="button" className="flex-1" disabled={categoryProducts.length === 0} onClick={() => { setSelected((items) => [...new Set([...items, ...categoryProducts.map((product) => product.id)])]); setCategoryDialog(null); setCategoryProducts([]); setCategoryProductSelection([]); }}>Add all to save</Button><Button type="button" variant="outline" className="flex-1" disabled={categoryProductSelection.length === 0} onClick={() => { setSelected((items) => [...new Set([...items, ...categoryProductSelection])]); setCategoryDialog(null); setCategoryProducts([]); setCategoryProductSelection([]); }}>Add selected to save ({categoryProductSelection.length})</Button></div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
