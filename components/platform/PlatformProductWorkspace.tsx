"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Search, PackagePlus, Link2, Check, Plus, X, ChevronLeft, ChevronRight, FolderPlus, ChevronDown, Loader2 } from "lucide-react";
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
  const [selectedCatalogCategories, setSelectedCatalogCategories] = useState<string[]>([]);
  const [categoryFilterOpen, setCategoryFilterOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", costPrice: "", categoryId: "", variants: [] as Array<{ title: string; weight: string; volume: string; price: string }> });
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [catalogMode, setCatalogMode] = useState<"products" | "categories" | null>(null);
  const [productPage, setProductPage] = useState(1);
  const [catalogProductPage, setCatalogProductPage] = useState(1);
  const [catalogProductHasMore, setCatalogProductHasMore] = useState(false);
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [categoryDialog, setCategoryDialog] = useState<any | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
  const [categoryProductsLoading, setCategoryProductsLoading] = useState(false);
  const [categoryProductSelection, setCategoryProductSelection] = useState<string[]>([]);
  const [saveDialog, setSaveDialog] = useState<{ title: string; message: string; success: boolean } | null>(null);
  const [savingCategoryIds, setSavingCategoryIds] = useState<string[]>([]);
  const [savedCategoryIds, setSavedCategoryIds] = useState<string[]>([]);
  const ITEMS_PER_PAGE = 20;

  const loadProducts = async (page = catalogProductPage) => {
    const params = new URLSearchParams({ query });
    params.set("page", String(page));
    params.set("pageSize", "100");
    selectedCatalogCategories.forEach((id) => params.append("categoryId", id));
    const response = await fetch(`/api/platform-products?${params.toString()}`);
    if (!response.ok) return;
    const result = await response.json();
    const shuffledProducts = [...(result.products || [])].sort(() => Math.random() - 0.5);
    setProducts(shuffledProducts);
    setCatalogProductPage(result.page || page);
    setCatalogProductHasMore(Boolean(result.hasMore));
  };

  const loadBusinessCategories = async () => {
    if (!business?.id || !isOwner) return;
    try {
      const response = await fetch(`/api/dbhandler?model=category&businessId=${business.id}`);
      if (!response.ok) throw new Error("Failed to load categories");
      setBusinessCategories(await response.json());
    } catch (error) {
      toast.error("Could not load business categories");
    }
  };

  useEffect(() => {
    if (session?.user?.id) loadProducts();
  }, [session?.user?.id, query, selectedCatalogCategories]);

  useEffect(() => {
    if (session?.user?.id) loadProducts(catalogProductPage);
  }, [catalogProductPage]);

  useEffect(() => {
    loadBusinessCategories();
  }, [business?.id, isOwner]);

  useEffect(() => {
    const loadCategories = async () => {
      const items: any[] = [];
      let offset = 0;
      while (true) {
        const response = await fetch(`/api/dbhandler?model=category&limit=100&offset=${offset}`);
        if (!response.ok) throw new Error("Could not load categories");
        const pageItems = await response.json();
        items.push(...pageItems);
        if (!Array.isArray(pageItems) || pageItems.length < 100) break;
        offset += 100;
      }

      const shuffledItems = items.sort(() => Math.random() - 0.5);
      {
        const seen = new Map<string, any>();
        for (const category of shuffledItems) {
          const key = String(category?.name || "").trim().toLowerCase();
          const existing = seen.get(key);
          if (!existing) {
            seen.set(key, category);
            continue;
          }
          const currentIsPlatform = !existing.businessId;
          const incomingIsPlatform = !category.businessId;
          if (incomingIsPlatform && !currentIsPlatform) seen.set(key, category);
          else if (currentIsPlatform === incomingIsPlatform) {
            const incomingImageCount = Array.isArray(category.products) ? category.products.filter((product: any) => product?.images?.length).length : 0;
            const currentImageCount = Array.isArray(existing.products) ? existing.products.filter((product: any) => product?.images?.length).length : 0;
            if (incomingImageCount > currentImageCount) seen.set(key, category);
          }
        }
        setCategories([...seen.values()]);
      }
    };

    loadCategories().catch(() => toast.error("Could not load categories"));
  }, []);

  useEffect(() => {
    setProductPage(1);
  }, [query, selectedCatalogCategories]);

  useEffect(() => {
    setCatalogProductPage(1);
  }, [query, selectedCatalogCategories]);

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
      .then((response) => response.ok ? response.json() : { products: [] })
      .then((result) => setCategoryProducts(result.products || []))
      .catch(() => toast.error("Could not load category products"))
      .finally(() => setCategoryProductsLoading(false));
  }, [categoryDialog]);

  const autoSaveCategory = async (sourceCategory: any) => {
    const sourceCategoryId = sourceCategory.id;
    const isAlreadySelected = selectedCategories.includes(sourceCategoryId);

    if (isAlreadySelected) {
      setSelectedCategories((items) => items.filter((id) => id !== sourceCategoryId));
      return;
    }

    setSelectedCategories((items) => [...items, sourceCategoryId]);

    if (savedCategoryIds.includes(sourceCategoryId)) return;
    if (!business?.id) return;

    setSavingCategoryIds((prev) => [...prev, sourceCategoryId]);
    try {
      // Pass categoryId override only if explicitly selected by the store owner, else undefined so sourceCategory.name is created/linked
      const targetCategoryId = categoryId ? String(categoryId) : undefined;
      const response = await fetch("/api/platform-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          action: "attach-category",
          businessId: business.id,
          userId: session?.user?.id,
          categoryId: targetCategoryId,
          sourceCategoryId,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setSavedCategoryIds((prev) => [...new Set([...prev, sourceCategoryId])]);
        toast.success(`Category "${sourceCategory.name}" added to ${business.name}`);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("vport:clear-api-cache"));
        }
        await loadBusinessCategories();
      } else {
        toast.error(result.error || `Could not save category ${sourceCategory.name}`);
      }
    } catch (err) {
      console.error(err);
      toast.error(`Could not save category ${sourceCategory.name}`);
    } finally {
      setSavingCategoryIds((prev) => prev.filter((id) => id !== sourceCategoryId));
    }
  };

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
        keepalive: true,
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
        keepalive: true,
        body: JSON.stringify({ action: "attach", businessId: business.id, userId: session?.user?.id, categoryId, productIds: selected }),
      });
      const result = await response.json().catch(() => ({}));
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
    if (!business || selectedCategories.length === 0) return toast.error("Select categories to add");
    setLoading(true);
    try {
      const targetCategoryId = categoryId ? String(categoryId) : undefined;
      const results = await Promise.all(selectedCategories.map(async (sourceCategoryId) => {
        const response = await fetch("/api/platform-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ action: "attach-category", businessId: business.id, userId: session?.user?.id, categoryId: targetCategoryId, sourceCategoryId }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "Could not attach category");
        setSavedCategoryIds((prev) => [...new Set([...prev, sourceCategoryId])]);
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
        keepalive: true,
        body: JSON.stringify({ action: "attach", businessId: business.id, userId: session?.user?.id, categoryId, productIds }),
      });
      const result = await response.json().catch(() => ({}));
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
    const targetCategoryId = categoryId ? String(categoryId) : undefined;

    const unsavedCategories = selectedCategories.filter((id) => !savedCategoryIds.includes(id));

    if (unsavedCategories.length === 0 && selected.length === 0) {
      const title = "Saved successfully";
      const message = `All selected items were saved to ${business.name}.`;
      toast.success(message);
      setSaveDialog({ title, message, success: true });
      setSelected([]);
      setSelectedCategories([]);
      setCategoryId("");
      return;
    }

    setLoading(true);
    try {
      let addedProducts = 0;
      if (unsavedCategories.length) {
        const categoryResults = await Promise.all(
          unsavedCategories.map(async (sourceCategoryId) => {
            const response = await fetch("/api/platform-products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              keepalive: true,
              body: JSON.stringify({ action: "attach-category", businessId: business.id, userId: session?.user?.id, categoryId: targetCategoryId, sourceCategoryId }),
            });
            const result = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(result.error || "Could not add categories");
            setSavedCategoryIds((prev) => [...new Set([...prev, sourceCategoryId])]);
            return Number(result.attached) || 0;
          })
        );
        addedProducts += categoryResults.reduce((total, count) => total + count, 0);
      }

      if (selected.length) {
        const response = await fetch("/api/platform-products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          keepalive: true,
          body: JSON.stringify({ action: "attach", businessId: business.id, userId: session?.user?.id, categoryId: targetCategoryId || undefined, productIds: selected }),
        });
        const result = await response.json().catch(() => ({}));
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

      await loadBusinessCategories();
      toast.success(message);
      setSaveDialog({ title, message, success: true });
      setSelected([]);
      setSelectedCategories([]);
      setCategoryId("");
      await loadProducts();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "The selected items could not be saved.";
      setSaveDialog({ title: "Unable to save", message, success: false });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) => category.businessId !== business?.id && category.name.toLowerCase().includes(categoryQuery.toLowerCase()));
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

      {isOwner && (
        <section className="flex items-start gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 px-5 py-4 shadow-sm dark:border-amber-400/30 dark:bg-amber-950/30">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 1.998-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.502-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Important notice</p>
            <p className="mt-0.5 text-sm leading-relaxed text-amber-700 dark:text-amber-400">
              Ensure you only select products and categories you can deliver to your customers, as reports from customers may result in sanctions.
            </p>
          </div>
        </section>
      )}

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
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="relative w-full sm:w-64"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search products" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
              <Button type="button" variant={selectedCatalogCategories.length ? "default" : "outline"} className="justify-between gap-2" onClick={() => setCategoryFilterOpen(true)}>
                <span>Categories{selectedCatalogCategories.length ? ` (${selectedCatalogCategories.length})` : ""}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {selectedCatalogCategories.length > 0 && <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs font-semibold text-muted-foreground">Showing:</span>{selectedCatalogCategories.map((id) => <span key={id} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{categories.find((category) => category.id === id)?.name || "Category"}</span>)}<Button type="button" variant="ghost" size="sm" onClick={() => setSelectedCatalogCategories([])}>Clear</Button></div>}
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
          {(productPages > 1 || catalogProductPage > 1 || catalogProductHasMore) && <div className="mt-4 flex flex-wrap items-center justify-center gap-3"><Button type="button" size="icon" variant="outline" disabled={productPage === 1 && catalogProductPage === 1} onClick={() => { if (productPage > 1) setProductPage((page) => page - 1); else setCatalogProductPage((page) => Math.max(1, page - 1)); }}><ChevronLeft className="h-4 w-4" /></Button><span className="text-xs text-muted-foreground">Page {productPage} of {productPages} · Batch {catalogProductPage}</span><Button type="button" size="icon" variant="outline" disabled={productPage < productPages && !catalogProductHasMore} onClick={() => { if (productPage < productPages) setProductPage((page) => page + 1); else { setProductPage(1); setCatalogProductPage((page) => page + 1); } }}><ChevronRight className="h-4 w-4" /></Button></div>}
        </section>}

      {catalogMode === "categories" && isOwner && <section className="space-y-5 rounded-2xl border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold">Platform categories</h2><p className="text-xs text-muted-foreground">Each card shows products available in that category.</p></div><div className="relative w-full sm:max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search categories" value={categoryQuery} onChange={(e) => setCategoryQuery(e.target.value)} /></div></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCategories.map((category) => <div key={category.id} className="overflow-hidden rounded-xl border bg-background text-left transition hover:border-primary hover:shadow-md"><div className="grid h-28 grid-cols-3 gap-1 bg-muted p-1">{(category.products || []).slice(0, 3).map((product: any, index: number) => <div key={index} className="overflow-hidden rounded-md bg-background">{product.images?.[0] ? <img src={product.images[0]} alt="" className="h-full w-full object-cover" /> : <PackagePlus className="m-auto mt-9 h-5 w-5 text-muted-foreground" />}</div>)}</div><div className="p-3"><h3 className="font-bold">{category.name}</h3><p className="mt-1 text-xs text-muted-foreground">{category._count?.products || 0} products</p><div className="mt-3 flex gap-2"><Button type="button" size="sm" variant="outline" className="flex-1" onClick={() => { setCategoryDialog(category); setCategoryProductSelection([]); }}><Check className="mr-1 h-3 w-3" />Choose products</Button><Button type="button" size="sm" className={`flex-1 ${savedCategoryIds.includes(category.id) ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`} disabled={savingCategoryIds.includes(category.id)} onClick={() => autoSaveCategory(category)}>{savingCategoryIds.includes(category.id) ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Saving...</> : savedCategoryIds.includes(category.id) || selectedCategories.includes(category.id) ? <><Check className="mr-1 h-3 w-3" />Added</> : <><Plus className="mr-1 h-3 w-3" />Add category</>}</Button></div></div></div>)}
        </div>
        {categoryPages > 1 && <div className="flex items-center justify-center gap-3"><Button type="button" size="icon" variant="outline" disabled={categoryPage === 1} onClick={() => setCategoryPage((page) => page - 1)}><ChevronLeft className="h-4 w-4" /></Button><span className="text-xs text-muted-foreground">Page {categoryPage} of {categoryPages}</span><Button type="button" size="icon" variant="outline" disabled={categoryPage === categoryPages} onClick={() => setCategoryPage((page) => page + 1)}><ChevronRight className="h-4 w-4" /></Button></div>}
      </section>}

      {isOwner && catalogMode === "products" && <section className="space-y-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div><div className="flex items-center gap-2 font-bold"><Link2 className="h-5 w-5 text-primary" /> Add products or categories to {business?.name}</div><p className="mt-1 text-sm text-muted-foreground">Select individual product cards, or select one or more platform categories to add their available products and variants together.</p></div>
        <div className="space-y-3 rounded-xl border bg-background/70 p-4">
          <div className="flex items-center justify-between gap-2"><div><h3 className="font-bold">Select categories</h3><p className="text-xs text-muted-foreground">Choose source categories from the shared catalog.</p></div><span className="text-xs font-bold text-primary">{selectedCategories.length} selected</span></div>
          <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
            {categories.filter((category) => category.businessId !== business?.id).map((category) => {
              const checked = selectedCategories.includes(category.id);
              const isSaved = savedCategoryIds.includes(category.id);
              const isSaving = savingCategoryIds.includes(category.id);
              return <button type="button" key={category.id} onClick={() => autoSaveCategory(category)} className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm ${checked ? "border-primary bg-primary/10" : "hover:bg-muted"}`}><span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{isSaving ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : checked && <Check className="h-3 w-3" />}</span><span className="truncate">{category.name}</span>{isSaved && <span className="ml-auto text-xs font-bold text-emerald-600">Saved</span>}</button>;
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

      <Dialog open={categoryFilterOpen} onOpenChange={setCategoryFilterOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>Filter products by category</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Select one or more categories to show only matching product cards.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {categories.filter((category) => category.businessId !== business?.id).map((category) => {
              const checked = selectedCatalogCategories.includes(category.id);
              return <button type="button" key={category.id} onClick={() => setSelectedCatalogCategories((items) => checked ? items.filter((id) => id !== category.id) : [...items, category.id])} className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm ${checked ? "border-primary bg-primary/10" : "hover:bg-muted"}`}><span className={`flex h-5 w-5 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{checked && <Check className="h-3 w-3" />}</span><span className="min-w-0 flex-1 truncate">{category.name}</span><span className="text-xs text-muted-foreground">{category._count?.products || 0}</span></button>;
            })}
          </div>
          <div className="flex gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => setSelectedCatalogCategories([])}>Clear</Button><Button type="button" className="flex-1" onClick={() => setCategoryFilterOpen(false)}>Show products</Button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(saveDialog)} onOpenChange={(open) => { if (!open) setSaveDialog(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">{saveDialog?.title || "Saved successfully"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`flex items-center gap-3 rounded-2xl border p-3 ${saveDialog?.success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${saveDialog?.success ? "bg-emerald-600" : "bg-red-600"}`}>
                <Check className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium">{saveDialog?.message || "Your selected items were saved successfully."}</p>
            </div>
            <Button type="button" onClick={() => setSaveDialog(null)} className="w-full font-semibold">Done</Button>
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
