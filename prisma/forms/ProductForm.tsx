// components/ProductForm.tsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, X, CheckCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppContext } from '@/hooks/useAppContext';
import { prepareImageForUpload } from '@/lib/compress-image';

const PLAN_CATALOG = [
  {
    id: 'basic',
    name: 'Basic',
    productLimit: 15,
    monthlyPrice: 500,
    features: ['3 months free', 'Max 15 products', 'AI purchase disabled', 'Category selection only for new products'],
  },
  {
    id: 'premium',
    name: 'Premium',
    productLimit: 200,
    monthlyPrice: 5000,
    features: ['3 months at N3,000', 'Gmail customer notifications', 'AI purchases enabled', 'Feature on home and store pages'],
  },
  {
    id: 'custom',
    name: 'Custom',
    productLimit: Infinity,
    monthlyPrice: 100000,
    features: ['Custom website', 'Own domain', 'Dedicated database', 'Free servicing for first year'],
  },
] as const;

const ITEMS_PER_PAGE = 10;

// All 8 health concerns — must match concern-grid.tsx exactly
export const HEALTH_CONCERNS = [
  "Pain Relief",
  "Cough, Cold & Flu",
  "Mother & Kids",
  "Gut Health",
  "Vitamins",
  "His Health",
  "Her Health",
  "Mental Wellness",
];

export default function ProductForm({ initialProduct, hideList = false }: { initialProduct?: any, hideList?: boolean }) {
  const [products, setProducts] = useState<any>([]);
  const [formData, setFormData] = useState<any>({ 
    name: initialProduct?.name || '',
    description: initialProduct?.description || '',
    shortDescription: initialProduct?.shortDescription || '',
    barcode: initialProduct?.barcode || '',
    volume: initialProduct?.volume || '',
    tags: Array.isArray(initialProduct?.tags) ? initialProduct.tags.join(', ') : '',
    metadata: initialProduct?.metadata ? JSON.stringify(initialProduct.metadata, null, 2) : '',
    categoryId: initialProduct?.categoryId || '',
    categoryIds: Array.isArray(initialProduct?.productCategories) ? initialProduct.productCategories.map((item: any) => item.categoryId || item.category?.id).filter(Boolean) : [],
    price: initialProduct ? (initialProduct.price || '') : '',
    costPrice: initialProduct?.costPrice || 0,
    images: initialProduct?.images || null,
    healthConcerns: initialProduct?.healthConcerns || [],
    activeIngredients: initialProduct?.activeIngredients?.join(", ") || '',
    brand: initialProduct?.brand || '',
    scarce: initialProduct?.scarce || false,
    regulatoryClassification: initialProduct?.regulatoryClassification || 'OTC',
    requiresPrescription: initialProduct?.requiresPrescription || false,
    weight: initialProduct?.weight || '',
    bulkPrices: initialProduct?.bulkPrices || [],
    variants: initialProduct?.variants || [],
  });
  const [files, setFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [allBrands, setAllBrands] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadStatus , setUploadStatus] = useState("");

  const [editId, setEditId] = useState<string | null>(initialProduct?.id || null);

  // Pagination, Search, and Sort State
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [sortBy, setSortBy] = useState<"name" | "price">("name");

  // Name suggestions state
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  
  // Ingredients tags state
  const [ingredientInput, setIngredientInput] = useState("");
  
  // Category search state
  const [categorySearch, setCategorySearch] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [creatingCategory, setCreatingCategory] = useState(false);
  
  // Brand search state
  const [brandSearch, setBrandSearch] = useState("");
  const [newBrandInput, setNewBrandInput] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");

  const nameSuggestions = useMemo(() => {
    if (formData.name.length < 2) return [];
    return products.filter((p: any) => p.name.toLowerCase().includes(formData.name.toLowerCase())).slice(0, 5);
  }, [formData.name, products]);

  const allIngredients = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p: any) => {
      if (Array.isArray(p.activeIngredients)) {
        p.activeIngredients.forEach((ing: any) => set.add(ing?.name || ing));
      } else if (typeof p.activeIngredients === "string") {
        p.activeIngredients.split(",").map((i: string) => i.trim()).filter(Boolean).forEach((ing: string) => set.add(ing));
      }
    });
    return Array.from(set);
  }, [products]);

  // Health Concerns
  const allHealthConcerns = useMemo(() => {
    const set = new Set<string>(HEALTH_CONCERNS);
    products.forEach((p: any) => {
      if (Array.isArray(p.healthConcerns)) {
        p.healthConcerns.forEach((hc: any) => set.add(hc?.name || hc));
      }
    });
    return Array.from(set);
  }, [products]);

  const [healthConcernInput, setHealthConcernInput] = useState("");
  const { currentBusiness } = useAppContext();
  const isPharmacy = String(currentBusiness?.template || "estore").toLowerCase() === "pharmacy";
  const [markupEnabled, setMarkupEnabled] = useState(false);
  const [markupPercentage, setMarkupPercentage] = useState(0);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [activePlanId, setActivePlanId] = useState(isPharmacy ? 'premium' : 'basic');
  const productLimit = isPharmacy ? 200 : activePlanId === 'premium' ? 200 : 15;
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    const loadPricingSettings = async () => {
      if (!currentBusiness?.id) return;
      try {
        const response = await axios.get(`/api/site-settings?businessId=${currentBusiness.id}`);
        const enabled = Boolean(response.data?.markupEnabled);
        const percentage = Number(response.data?.markupPercentage) || 0;
        setMarkupEnabled(enabled);
        setMarkupPercentage(percentage);
        if (!editId && enabled && Number(formData.costPrice) > 0) {
          setFormData((previous: any) => ({
            ...previous,
            price: Number(previous.costPrice) * (1 + percentage / 100),
          }));
        }
      } catch (error) {
        console.error("Failed to load pricing settings", error);
      }
    };

    loadPricingSettings();
  }, [currentBusiness?.id, editId, formData.costPrice]);

  const updateCostPrice = (value: string) => {
    const costPrice = Number(value) || 0;
    setFormData((previous: any) => ({
      ...previous,
      costPrice: value,
      ...(markupEnabled ? { price: costPrice * (1 + markupPercentage / 100) } : {}),
    }));
  };


  const fetchProducts = useCallback(async () => {
    try {
      const businessId = currentBusiness?.id;
      const bizQ = businessId ? `&businessId=${businessId}` : "";
      const res = await axios.get(`/api/dbhandler?model=product&include=category,categories,variants${bizQ}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  }, [currentBusiness?.id]);

  const fetchCategories = useCallback(async () => {
    try {
      const businessId = currentBusiness?.id;
      const bizQ = businessId ? `&businessId=${businessId}` : "";
      const res = await axios.get(`/api/dbhandler?model=category${bizQ}`);
      setCategories(res.data);
      if (res.data.length > 0 && !formData.categoryId) {
        setFormData(prev => ({
          ...prev,
          categoryId: res.data[0].id,
          category: res.data[0].name
        }));
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  }, [currentBusiness?.id, formData.categoryId]);

  const createInlineCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Enter a category name");
      return;
    }
    setCreatingCategory(true);
    try {
      const response = await axios.post("/api/categories", {
        ...newCategory,
        ...(currentBusiness?.id ? { businessId: currentBusiness.id } : {}),
      });
      const category = response.data;
      setCategories((items) => items.some((item: any) => item.id === category.id) ? items : [category, ...items]);
      setFormData((previous: any) => ({ ...previous, categoryId: category.id, category: category.name }));
      setNewCategory({ name: "", description: "" });
      setShowNewCategory(false);
      toast.success("Category ready for this product");
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Could not create category");
    } finally {
      setCreatingCategory(false);
    }
  };

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || '',
        description: initialProduct.description || '',
        shortDescription: initialProduct.shortDescription || '',
        barcode: initialProduct.barcode || '',
        volume: initialProduct.volume || '',
        tags: Array.isArray(initialProduct.tags) ? initialProduct.tags.join(', ') : '',
        metadata: initialProduct.metadata ? JSON.stringify(initialProduct.metadata, null, 2) : '',
        categoryId: initialProduct.categoryId || '',
        categoryIds: Array.isArray(initialProduct.productCategories) ? initialProduct.productCategories.map((item: any) => item.categoryId || item.category?.id).filter(Boolean) : [],
        price: initialProduct.price || 0,
        costPrice: initialProduct.costPrice || 0,
        images: initialProduct.images || null,
        healthConcerns: Array.isArray(initialProduct.healthConcerns) ? initialProduct.healthConcerns.map((hc: any) => hc?.name || hc) : [],
        activeIngredients: Array.isArray(initialProduct.activeIngredients) ? initialProduct.activeIngredients.map((i: any) => i?.name || i).join(", ") : '',
        brand: initialProduct.brand?.name || initialProduct.brand || '',
        scarce: initialProduct.scarce || false,
        regulatoryClassification: initialProduct.regulatoryClassification || 'OTC',
        requiresPrescription: initialProduct.requiresPrescription || false,
        weight: initialProduct.weight || '',
        bulkPrices: Array.isArray(initialProduct.bulkPrices) ? initialProduct.bulkPrices : [],
        variants: Array.isArray(initialProduct.variants) ? initialProduct.variants : [],
      });
      setEditId(initialProduct.id);
    }
  }, [initialProduct]);

  useEffect(() => {
    if (!hideList) fetchProducts();
    fetchCategories();
    axios.get('/api/dbhandler?model=product').then(res => {
      const brands = Array.from(new Set(res.data.map((p: any) => p.brand?.name || p.brand).filter(Boolean))) as string[];
      setAllBrands(brands);
    });
  }, [hideList, fetchProducts, fetchCategories]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: categories.length > 0 ? (categories[0] as any).id : '',
      category: categories.length > 0 ? (categories[0] as any).name : '',
      price: '',
      costPrice: 0,
      images: [],
      shortDescription: '',
      barcode: '',
      volume: '',
      tags: '',
      metadata: '',
      categoryIds: [],
      healthConcerns: [],
      activeIngredients: '',
      brand: '',
      scarce: false,
      regulatoryClassification: 'OTC',
      requiresPrescription: false,
      weight: '',
      bulkPrices: [],
      variants: [],
    });
    setEditId(null);
    setFiles([]);
    setPreview(null);
  };

  const toggleConcern = (concern: string) => {
    setFormData(prev => ({
      ...prev,
      healthConcerns: prev.healthConcerns.includes(concern)
        ? prev.healthConcerns.filter((c: string) => c !== concern)
        : [...prev.healthConcerns, concern],
    }));
  };

  const addIngredient = (ingredient: string) => {
    if (!ingredient.trim()) return;
    const current = formData.activeIngredients ? formData.activeIngredients.split(",").map(i => i.trim()).filter(Boolean) : [];
    if (!current.includes(ingredient.trim())) {
      current.push(ingredient.trim());
      setFormData({ ...formData, activeIngredients: current.join(", ") });
    }
    setIngredientInput("");
  };

  const removeIngredient = (ingredient: string) => {
    const current = formData.activeIngredients.split(",").map(i => i.trim()).filter(Boolean);
    const updated = current.filter(i => i !== ingredient);
    setFormData({ ...formData, activeIngredients: updated.join(", ") });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editId && !isPharmacy && ((products?.length || 0) + 1) > productLimit) {
      setShowPlanDialog(true);
      return;
    }

    if (!Number.isFinite(Number(formData.costPrice)) || Number(formData.costPrice) <= 0) {
      toast.error("Enter a valid cost price");
      return;
    }

    setSubmitting(true);

    const pformData = new FormData();

    files.forEach((selectedFile) => pformData.append("file", selectedFile));

    pformData.append("name", formData.name);
    pformData.append("description", formData.description);
    pformData.append("shortDescription", formData.shortDescription || "");
    pformData.append("barcode", formData.barcode || "");
    pformData.append("volume", formData.volume || "");
    pformData.append("tags", JSON.stringify(String(formData.tags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean)));
    pformData.append("metadata", formData.metadata || "");
    pformData.append("categoryId", formData.categoryId);
    pformData.append("categoryIds", JSON.stringify(formData.categoryIds || []));
    pformData.append("price", String(formData.price || formData.costPrice || ""));
    if (currentBusiness?.id) {
      pformData.append("businessId", currentBusiness.id);
    }

    if (isPharmacy) {
      pformData.append("brand", formData.brand || "");
      pformData.append("scarce", String(formData.scarce));
      pformData.append("activeIngredients", formData.activeIngredients || "");
      pformData.append("regulatoryClassification", formData.regulatoryClassification || "OTC");
      pformData.append("requiresPrescription", String(formData.requiresPrescription));
      pformData.append("healthConcerns", (formData.healthConcerns || []).join(","));
    }

    if (formData.costPrice !== undefined && formData.costPrice !== "") {
      pformData.append("costPrice", String(formData.costPrice));
    }
    pformData.append("weight", formData.weight || "");
    pformData.append("bulkPrices", JSON.stringify(formData.bulkPrices || []));
    pformData.append("variants", JSON.stringify(formData.variants || []));

    try {
      if (editId) {
        const productPayload: any = {
          name: formData.name,
          description: formData.description,
          shortDescription: formData.shortDescription || "",
          barcode: formData.barcode || "",
          volume: formData.volume || "",
          tags: String(formData.tags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean),
          metadata: formData.metadata ? JSON.parse(formData.metadata) : null,
          categoryId: formData.categoryId,
          categoryIds: formData.categoryIds || [],
          price: Number(formData.price || formData.costPrice || 0),
          weight: formData.weight || "",
          bulkPrices: formData.bulkPrices || [],
          variants: formData.variants || [],
          ...(currentBusiness?.id ? { businessId: currentBusiness.id } : {}),
        };

        if (isPharmacy) {
          productPayload.healthConcerns = formData.healthConcerns || [];
          productPayload.brand = formData.brand || "";
          productPayload.scarce = !!formData.scarce;
          productPayload.activeIngredients = formData.activeIngredients
            ? formData.activeIngredients.split(",").map((i: string) => i.trim()).filter(Boolean)
            : [];
          productPayload.regulatoryClassification = formData.regulatoryClassification || "OTC";
          productPayload.requiresPrescription = !!formData.requiresPrescription;
        }

        await axios.put(
          `/api/dbhandler?model=product&id=${editId}`,
          productPayload
        );
      } else {
        await axios.post(`/api/product`, pformData);
      }
      setSubmitting(false);
      setUploadStatus("Product saved successfully");
      setResultDialog({
        open: true,
        type: "success",
        title: editId ? "Product Updated" : "Product Created",
        message: editId ? "Product updated successfully." : "Product created successfully.",
      });
      toast.success(editId ? "Product updated successfully" : "Product created successfully");
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error(error);
      setSubmitting(false);
      setResultDialog({
        open: true,
        type: "error",
        title: "Save Failed",
        message: "Failed to save product. Please try again.",
      });
      toast.error("Failed to save product.");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    try {
      const preparedFiles = await Promise.all(selectedFiles.map((selectedFile) => prepareImageForUpload(selectedFile)));
      setFiles(preparedFiles);
      setPreview(URL.createObjectURL(preparedFiles[0]));
      if (preparedFiles.some((preparedFile, index) => preparedFile !== selectedFiles[index])) {
        toast.success("Image compressed to WebP and prepared for upload");
      }
    } catch (error) {
      e.target.value = "";
      toast.error(error instanceof Error ? error.message : "Could not process image");
    }
  };

  const handleDelete = async (product : any) => {
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;
    try {
      const res = await axios.delete(`/api/dbhandler?model=product&id=${product.id}`);
      if (res.status === 200  || res.status === 201) {
        toast.success('Product deleted successfully.');
      }
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product.');
    }
  };

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setFiles([]);
    setPreview(null);

    setFormData({
      name: product.name ?? '',
      description: product.description ?? '',
      shortDescription: product.shortDescription ?? '',
      barcode: product.barcode ?? '',
      volume: product.volume ?? '',
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
      metadata: product.metadata ? JSON.stringify(product.metadata, null, 2) : '',
      categoryId: product.categoryId ?? '',
      categoryIds: Array.isArray(product.productCategories) ? product.productCategories.map((item: any) => item.categoryId || item.category?.id).filter(Boolean) : [],
      price: product.price ?? 0,
      costPrice: product.costPrice ?? 0,
      images: product.images ?? [],
      healthConcerns: Array.isArray(product.healthConcerns) ? product.healthConcerns.map((hc: any) => hc?.name || hc) : [],
      activeIngredients: Array.isArray(product.activeIngredients) ? product.activeIngredients.map((i: any) => i?.name || i).join(", ") : '',
      brand: product.brand?.name || product.brand || '',
      scarce: product.scarce || false,
      regulatoryClassification: product.regulatoryClassification || 'OTC',
      requiresPrescription: product.requiresPrescription || false,
      weight: product.weight || '',
      bulkPrices: Array.isArray(product.bulkPrices) ? product.bulkPrices : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ✅ Search and Filter Logic
  const filteredProducts = useMemo(() => {
    let result = products.filter((p: any) => {
      const pHealthConcerns = Array.isArray(p.healthConcerns) ? p.healthConcerns.map((hc: any) => hc?.name || hc) : [];
      const brandName = p.brand?.name || p.brand || "";
      return p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        HEALTH_CONCERNS.some(c => pHealthConcerns.includes(c) && c.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (brandName.toLowerCase().includes(searchTerm.toLowerCase()))
    });

    if (sortOrder !== "none") {
      result = [...result].sort((a, b) => {
        if (sortBy === "name") {
          return sortOrder === "asc" 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        } else {
          return sortOrder === "asc" 
            ? (a.price || 0) - (b.price || 0) 
            : (b.price || 0) - (a.price || 0);
        }
      });
    }

    return result;
  }, [products, searchTerm, sortOrder, sortBy]);

  // ✅ Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleSort = (type: "name" | "price") => {
    if (sortBy === type) {
      setSortOrder(prev => prev === "none" ? "asc" : prev === "asc" ? "desc" : "none");
    } else {
      setSortBy(type);
      setSortOrder("asc");
    }
  };

  // Reset page when searching or sorting
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder, sortBy]);

  return (
    <div>
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

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Choose a store plan</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 lg:grid-cols-3">
            {PLAN_CATALOG.map((plan) => {
              const isSelected = activePlanId === plan.id || (isPharmacy && plan.id === 'premium');
              return (
                <div key={plan.id} className={`rounded-2xl border p-4 ${isSelected ? 'border-primary bg-primary/5 shadow-md shadow-primary/10' : 'bg-background'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-black">{plan.name}</h3>
                    {isSelected && <Badge className="rounded-full">Current</Badge>}
                  </div>
                  <p className="mt-2 text-2xl font-black">
                    {plan.id === 'custom' ? '₦100k - ₦800k' : `₦${plan.monthlyPrice.toLocaleString()}`}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle className="mt-0.5 h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button type="button" className="mt-5 w-full" onClick={() => {
                    setActivePlanId(plan.id);
                    setShowPlanDialog(false);
                  }}>
                    {isSelected ? 'Selected' : 'Select plan'}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <form onSubmit={handleSubmit} className='flex flex-col w-full max-w-sm gap-2 justify-center items-center p-3 border-2 border-secondary-foreground rounded-sm m-2 shadow-md bg-card'>
        <h2 className='font-bold text-xl mb-2 text-primary'>Product Management</h2>

        <div className="w-full space-y-1 relative">
          <Label htmlFor="product-name">Product Name</Label>
          <Input
            id="product-name"
            placeholder="Name of product"
            value={formData.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              setShowNameSuggestions(true);
            }}
            onFocus={() => setShowNameSuggestions(true)}
            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
            className="border-primary/20 focus:border-primary"
          />
          {showNameSuggestions && nameSuggestions.length > 0 && (
            <div className="absolute top-full left-0 z-10 w-full bg-card border rounded-md shadow-lg p-2 max-h-40 overflow-y-auto">
              <p className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wider">Existing Products (Avoid Duplicates)</p>
              {nameSuggestions.map((s: any) => (
                <div 
                  key={s.id} 
                  className="text-sm p-2 hover:bg-muted cursor-pointer rounded" 
                  onClick={() => {
                    setFormData({ ...formData, name: s.name });
                    setShowNameSuggestions(false);
                  }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full space-y-1">
          <Label htmlFor="product-desc">Product Description</Label>
          <Input
            id="product-desc"
            placeholder="Description of product"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="border-primary/20 focus:border-primary"
          />
        </div>

        <div className="w-full space-y-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <Label className="text-xs font-black uppercase tracking-widest text-primary">Catalog Details</Label>
          <Input placeholder="Short description for product cards" value={formData.shortDescription} onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })} />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input placeholder="Barcode / EAN" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} />
            <Input placeholder="Volume (e.g. 500ml)" value={formData.volume} onChange={(e) => setFormData({ ...formData, volume: e.target.value })} />
            <Input placeholder="Tags, comma separated" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
          </div>
          <textarea className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm" placeholder='Metadata JSON (optional)' value={formData.metadata} onChange={(e) => setFormData({ ...formData, metadata: e.target.value })} />
        </div>

        {isPharmacy && (
          <div className="w-full space-y-1 text-center flex flex-col items-center">
            <Label htmlFor="product-brand" className='mb-2'>Brand</Label>
            <div className="w-full space-y-2">
              <Input
                placeholder="Search brands..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="border-primary/20 focus:border-primary h-8 text-xs"
              />
              <Select 
                value={formData.brand} 
                onValueChange={(value) => {
                  if (value === "__create_new__") return;
                  setFormData({ ...formData, brand: value });
                  setBrandSearch("");
                }}
              >
                <SelectTrigger id="product-brand" className="w-full border-primary/20">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {allBrands
                    .filter((brand) => 
                      brand.toLowerCase().includes(brandSearch.toLowerCase())
                    )
                    .map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  <SelectItem value="__create_new__" className="border-t pt-2 mt-2">
                    <span className="text-primary font-semibold">+ Create New Brand</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.brand === "__create_new__" && (
                <div className="flex gap-2 w-full">
                  <Input
                    placeholder="Brand name"
                    value={newBrandInput}
                    onChange={(e) => setNewBrandInput(e.target.value)}
                    className="border-primary/20 focus:border-primary h-8 text-xs flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (newBrandInput.trim()) {
                        setFormData({ ...formData, brand: newBrandInput.trim() });
                        setAllBrands([...new Set([...allBrands, newBrandInput.trim()])]);
                        setNewBrandInput("");
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {isPharmacy && (
          <div className="w-full space-y-2">
            <Label>Active Ingredients</Label>
            {formData.activeIngredients && (
              <div className="flex gap-2 flex-wrap bg-muted/20 p-2 rounded border">
                {formData.activeIngredients.split(",").map(i => i.trim()).filter(Boolean).map(ing => (
                  <Badge key={ing} variant="secondary" className="flex items-center gap-1">
                    {ing}
                    <X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => removeIngredient(ing)} />
                  </Badge>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Add new ingredient & press Enter"
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngredient(ingredientInput);
                  }
                }}
                className="border-primary/20 focus:border-primary"
              />
              <Button type="button" onClick={() => addIngredient(ingredientInput)}>Add</Button>
            </div>
            
            {allIngredients.length > 0 && (
              <div className="space-y-1 mt-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Saved Ingredients (Click to add)</p>
                <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-2 border rounded bg-card">
                  {allIngredients.map(ing => {
                    const current = formData.activeIngredients ? formData.activeIngredients.split(",").map(i => i.trim()) : [];
                    if (current.includes(ing)) return null;
                    return (
                      <Badge 
                        key={ing} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary/10 transition-colors" 
                        onClick={() => addIngredient(ing)}
                      >
                        {ing}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="w-full space-y-1 text-center flex flex-col items-center">
          <Label htmlFor="product-category" className='mb-2'>Product Category</Label>
          <div className="w-full space-y-2">
            <Input
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="border-primary/20 focus:border-primary h-8 text-xs"
            />
            <Select 
              value={formData.categoryId} 
              onValueChange={(value) => {
                if (value === "__new__") {
                  setShowNewCategory(true);
                  return;
                }
                const selectedCategory = categories.find((cat: any) => cat.id === value);
                setFormData({ 
                  ...formData, 
                  categoryId: value, 
                  category: selectedCategory ? (selectedCategory as any).name : ''
                });
                setCategorySearch("");
              }}
            >
              <SelectTrigger id="product-category" className="w-full border-primary/20">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="__new__">+ Create new category</SelectItem>
                {categories.length > 0 ? categories
                  .filter((category: any) => 
                    category.name.toLowerCase().includes(categorySearch.toLowerCase())
                  )
                  .map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  )) : <SelectItem value="none" disabled>No categories</SelectItem>}
              </SelectContent>
            </Select>
            {showNewCategory && (
              <div className="space-y-2 rounded-md border border-primary/20 bg-primary/5 p-3 text-left">
                <Label htmlFor="new-category-name">New category name</Label>
                <Input id="new-category-name" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} placeholder="e.g. Vitamins" />
                <Input value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} placeholder="Description (optional)" />
                <div className="flex gap-2">
                  <Button type="button" size="sm" onClick={createInlineCategory} disabled={creatingCategory}>{creatingCategory ? "Creating..." : "Create category"}</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setShowNewCategory(false)}>Cancel</Button>
                </div>
              </div>
            )}
            {categories.length > 0 && (
              <div className="space-y-2 rounded-md border bg-muted/20 p-3 text-left">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold">Additional categories</Label>
                  <span className="text-[10px] text-muted-foreground">{formData.categoryIds.length} selected</span>
                </div>
                <div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto">
                  {categories.filter((category: any) => category.id !== formData.categoryId).map((category: any) => (
                    <label key={category.id} className="flex cursor-pointer items-center gap-2 text-xs">
                      <Checkbox checked={formData.categoryIds.includes(category.id)} onCheckedChange={(checked) => setFormData((previous: any) => ({ ...previous, categoryIds: checked ? [...new Set([...previous.categoryIds, category.id])] : previous.categoryIds.filter((id: string) => id !== category.id) }))} />
                      <span className="truncate">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Health Concerns Multi-Select Checkboxes */}
        {isPharmacy && (
          <div className="w-full space-y-2">
            <Label className="text-sm font-semibold">
              Health Concerns / Uses
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                ({formData.healthConcerns.length} selected)
              </span>
            </Label>
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-md bg-muted/30 max-h-48 overflow-y-auto">
              {allHealthConcerns.map((concern) => (
                <div key={concern} className="flex items-center gap-2">
                  <Checkbox
                    id={`concern-${concern}`}
                    checked={formData.healthConcerns.includes(concern)}
                    onCheckedChange={() => toggleConcern(concern)}
                  />
                  <Label htmlFor={`concern-${concern}`} className="text-xs font-normal cursor-pointer line-clamp-1 py-1">
                    {concern}
                  </Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add new health concern..."
                value={healthConcernInput}
                onChange={(e) => setHealthConcernInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (healthConcernInput.trim() && !allHealthConcerns.includes(healthConcernInput.trim())) {
                        toggleConcern(healthConcernInput.trim());
                        setHealthConcernInput("");
                    }
                  }
                }}
                className="border-primary/20 focus:border-primary h-8 text-xs"
              />
              <Button size="sm" type="button" onClick={() => {
                   if (healthConcernInput.trim() && !allHealthConcerns.includes(healthConcernInput.trim())) {
                        toggleConcern(healthConcernInput.trim());
                        setHealthConcernInput("");
                   }
              }}>New</Button>
            </div>
          </div>
        )}

        <div className="w-full space-y-3 border border-primary/20 rounded-lg p-3 bg-primary/5">
          <div className="space-y-1">
            <Label htmlFor="product-cost-price">Cost Price (₦)</Label>
            <Input
              id="product-cost-price"
              placeholder="Enter cost price"
              value={formData.costPrice}
              onChange={(e) => updateCostPrice(e.target.value)}
              type="number"
              min="0"
              className="border-primary/20 focus:border-primary"
            />
          </div>
          <div className="space-y-1">
          <Label htmlFor="product-price">Selling Price (₦) <span className="text-muted-foreground font-normal">(optional, editable)</span></Label>
          <Input
            id="product-price"
            placeholder={markupEnabled ? "Calculated from cost price" : "Leave blank to use cost price"}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            type="number"
            min="0"
            className="border-primary/20 focus:border-primary"
          />
          <p className="text-[10px] text-muted-foreground">
            {markupEnabled
              ? `Suggested at ${markupPercentage}% markup. You can adjust this price for a specific product.`
              : "Optional. If left blank, the cost price will be used as the selling price."}
          </p>
          </div>
        </div>

        {isPharmacy && (
          <div className="w-full space-y-1 text-center flex flex-col items-center">
            <Label htmlFor="reg-class" className='mb-2 font-semibold'>Regulatory Classification</Label>
            <Select 
              value={formData.regulatoryClassification} 
              onValueChange={(value) => {
                setFormData({ 
                  ...formData, 
                  regulatoryClassification: value,
                  requiresPrescription: value === "Prescription Medicine"
                });
              }}
            >
              <SelectTrigger id="reg-class" className="w-full border-primary/20">
                <SelectValue placeholder="Select classification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OTC">OTC (Over the Counter)</SelectItem>
                <SelectItem value="Pharmacy Only Medicine">Pharmacy Only Medicine</SelectItem>
                <SelectItem value="Prescription Medicine">Prescription Medicine</SelectItem>
                <SelectItem value="Controlled Medicine">Controlled Medicine</SelectItem>
              </SelectContent>
            </Select>
            {formData.regulatoryClassification === "Prescription Medicine" && (
              <p className="text-[10px] text-destructive font-bold mt-1 uppercase">Requires Prescription Image</p>
            )}
            {formData.regulatoryClassification === "Controlled Medicine" && (
              <p className="text-[10px] text-accent font-bold mt-1 uppercase text-center leading-tight">Controlled: Only accessible via official representative</p>
            )}
          </div>
        )}

        <div className="w-full space-y-1">
          <Label htmlFor="product-weight">Weight (mg, ml, caps, etc.)</Label>
          <Input
            id="product-weight"
            placeholder="e.g. 500mg or 20 Capsules"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            className="border-primary/20 focus:border-primary"
          />
        </div>

        <div className="w-full space-y-2 border-2 border-dashed border-primary/20 p-3 rounded-lg bg-primary/5">
          <div className="flex justify-between items-center">
            <Label className="font-black text-xs uppercase tracking-widest text-primary">Bulk Pricing Options</Label>
            <Button 
                type="button" 
                size="sm" 
                variant="outline" 
                className="h-7 text-[10px] uppercase font-black border-primary text-primary"
                onClick={() => setFormData({ ...formData, bulkPrices: [...formData.bulkPrices, { name: '', quantity: 1, price: 0 }] })}
            >
                Add Bulk
            </Button>
          </div>
          
          {formData.bulkPrices.map((bp: any, idx: number) => (
            <div key={idx} className="space-y-2 p-2 bg-background border rounded shadow-sm relative group animate-in slide-in-from-right-2">
                <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 absolute -top-2 -right-2 bg-destructive text-white rounded-full hover:bg-destructive/80 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => {
                        const newBulk = [...formData.bulkPrices];
                        newBulk.splice(idx, 1);
                        setFormData({ ...formData, bulkPrices: newBulk });
                    }}
                >
                    <X className="h-4 w-4" />
                </Button>
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-muted-foreground">Bulk Name (Pack, Dozen)</Label>
                        <Input 
                            value={bp.name} 
                            placeholder="Pack of 10" 
                            className="h-8 text-xs font-bold"
                            onChange={(e) => {
                                const newBulk = [...formData.bulkPrices];
                                newBulk[idx].name = e.target.value;
                                setFormData({ ...formData, bulkPrices: newBulk });
                            }}
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[9px] font-black uppercase text-muted-foreground">Units per Bulk</Label>
                        <Input 
                            type="number" 
                            value={bp.quantity} 
                            className="h-8 text-xs font-bold"
                            onChange={(e) => {
                                const newBulk = [...formData.bulkPrices];
                                newBulk[idx].quantity = parseInt(e.target.value);
                                setFormData({ ...formData, bulkPrices: newBulk });
                            }}
                        />
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase text-muted-foreground">Bulk Price (BEFORE MARKUP)</Label>
                    <Input 
                        type="number" 
                        value={bp.price} 
                        className="h-8 text-xs font-bold"
                        onChange={(e) => {
                            const newBulk = [...formData.bulkPrices];
                            newBulk[idx].price = parseFloat(e.target.value);
                            setFormData({ ...formData, bulkPrices: newBulk });
                        }}
                    />
                </div>
            </div>
          ))}
          {formData.bulkPrices.length === 0 && (
              <p className="text-[10px] text-center text-muted-foreground py-2 italic font-bold">No bulk variations added.</p>
          )}
        </div>

        <div className="w-full space-y-3 rounded-lg border-2 border-dashed border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-black uppercase tracking-widest text-primary">Product Variants</Label>
              <p className="text-[10px] text-muted-foreground">Use for pack sizes, weights, or regional prices.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => setFormData({ ...formData, variants: [...formData.variants, { title: '', weight: '', volume: '', allowBackorder: false, manageInventory: true, prices: [{ amount: 0, currencyCode: 'ngn' }], inventoryItems: [] }] })}>Add variant</Button>
          </div>
          {formData.variants.map((variant: any, index: number) => (
            <div key={variant.id || index} className="relative space-y-2 rounded-md border bg-background p-3">
              <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-6 w-6 text-destructive" onClick={() => setFormData({ ...formData, variants: formData.variants.filter((_: any, itemIndex: number) => itemIndex !== index) })}><X className="h-4 w-4" /></Button>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Input placeholder="Variant title (e.g. 1 Carton)" value={variant.title || ''} onChange={(e) => { const next = [...formData.variants]; next[index] = { ...next[index], title: e.target.value }; setFormData({ ...formData, variants: next }); }} />
                <Input placeholder="Weight" value={variant.weight || ''} onChange={(e) => { const next = [...formData.variants]; next[index] = { ...next[index], weight: e.target.value }; setFormData({ ...formData, variants: next }); }} />
                <Input placeholder="Volume" value={variant.volume || ''} onChange={(e) => { const next = [...formData.variants]; next[index] = { ...next[index], volume: e.target.value }; setFormData({ ...formData, variants: next }); }} />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <Input type="number" min="0" placeholder="Price" value={variant.prices?.[0]?.amount ?? ''} onChange={(e) => { const next = [...formData.variants]; next[index] = { ...next[index], prices: [{ ...(next[index].prices?.[0] || {}), amount: Number(e.target.value), currencyCode: 'ngn' }] }; setFormData({ ...formData, variants: next }); }} />
                <Input placeholder="SKU" value={variant.inventoryItems?.[0]?.sku || ''} onChange={(e) => { const next = [...formData.variants]; next[index] = { ...next[index], inventoryItems: [{ ...(next[index].inventoryItems?.[0] || {}), sku: e.target.value }] }; setFormData({ ...formData, variants: next }); }} />
                <label className="flex items-center gap-2 text-xs"><Checkbox checked={!!variant.allowBackorder} onCheckedChange={(checked) => { const next = [...formData.variants]; next[index] = { ...next[index], allowBackorder: !!checked }; setFormData({ ...formData, variants: next }); }} /> Allow backorder</label>
              </div>
            </div>
          ))}
          {formData.variants.length === 0 && <p className="py-2 text-center text-xs italic text-muted-foreground">No variants added. The base product price remains active.</p>}
        </div>

        {isPharmacy && (
          <div className="w-full flex items-center gap-2 border p-2 rounded-md bg-secondary/10">
            <Checkbox 
              id="product-scarce" 
              checked={formData.scarce}
              onCheckedChange={(checked) => setFormData({...formData, scarce: !!checked})}
            />
            <Label htmlFor="product-scarce" className="text-sm font-semibold cursor-pointer">Mark as Scarce Product</Label>
          </div>
        )}

        <div className="w-full space-y-1">
          <Label htmlFor="product-image">Product Images</Label>
          {formData?.images?.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {formData.images.map((imageUrl: string) => <img key={imageUrl} src={imageUrl} alt="Current product" className="aspect-square rounded-md object-cover" />)}
            </div>
          )}
          {(preview) && (
            <div style={{ marginTop: '1rem', width: '100%' }}>
              <img src={preview} alt="Selected preview" className="rounded-md object-cover" style={{ maxHeight: '200px', width: '100%' }} />
            </div>
          )}
          <Input
            type="file"
            multiple
            name='image'
            id='product-image'
            onChange={handleImageChange}
            className="border-primary/20 focus:border-primary mt-2"
          />
        </div>
        <div className="flex w-full gap-2 mt-4">
          <Button type="submit" className="flex-1 font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98]">{editId ? 'Update Product' : 'Create Product'}</Button>
          {editId && <Button type="button" variant="outline" onClick={resetForm} className="flex-1 border-primary text-primary">Cancel</Button>}
        </div>

        {!hideList && (
          <div className="w-full mt-10 border-t pt-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              Our Products
              <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredProducts.length}</span>
            </h2>

            {/* ✅ Search and Sort Controls */}
            <div className="flex flex-col gap-2 mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, category, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-secondary/20 h-9 text-xs"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className={`flex-1 text-[10px] h-8 gap-2 ${sortBy === "name" && sortOrder !== "none" ? "bg-primary/20 border-primary" : ""}`}
                  onClick={() => toggleSort("name")}
                >
                  <ArrowUpDown className="h-3 w-3" /> Sort Name {sortBy === "name" && sortOrder !== "none" ? `(${sortOrder})` : ""}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className={`flex-1 text-[10px] h-8 gap-2 ${sortBy === "price" && sortOrder !== "none" ? "bg-primary/20 border-primary" : ""}`}
                  onClick={() => toggleSort("price")}
                >
                  <ArrowUpDown className="h-3 w-3" /> Sort Price {sortBy === "price" && sortOrder !== "none" ? `(${sortOrder})` : ""}
                </Button>
              </div>
            </div>

            <ul className='w-full space-y-3'>
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((item: any) => (
                  <li key={item.id} className="flex flex-col gap-2 bg-secondary/10 border-2 border-secondary rounded-lg w-full p-4 hover:border-primary/30 transition-colors shadow-sm">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm block truncate uppercase tracking-tight">
                          {isPharmacy && item.scarce && <span className="text-destructive mr-1">⚠️</span>}
                          {item.name}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-primary">Cost: ₦{item.price}</p>
                            {isPharmacy && item.brand && <span className="text-[10px] text-muted-foreground">| {item.brand}</span>}
                          </div>
                          {item.category?.name && (
                            <span className="text-[10px] text-muted-foreground italic truncate">in {item.category.name}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button type='button' size="sm" onClick={() => handleEdit(item)} className='h-8 w-12 text-[10px] font-bold'>EDIT</Button>
                        <Button type='button' size="sm" onClick={() => handleDelete(item)} variant='outline' className='h-8 w-12 text-[10px] font-bold border-destructive text-destructive hover:bg-destructive hover:text-white'>DEL</Button>
                      </div>
                    </div>
                    {isPharmacy && item.healthConcerns?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.healthConcerns.map((hc: string) => (
                          <span key={hc} className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase">
                            {hc}
                          </span>
                        ))}
                      </div>
                    )}
                    {isPharmacy && item.activeIngredients?.length > 0 && (
                      <p className="text-[10px] text-muted-foreground truncate">
                        <strong>Ingredients:</strong> {item.activeIngredients.join(", ")}
                      </p>
                    )}
                  </li>
                ))
              ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg bg-muted/10">
                  <p className="text-sm text-muted-foreground font-medium italic">No results found.</p>
                </div>
              )}
            </ul>

            {/* ✅ Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-2 mt-8">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <span className="text-sm font-black text-primary">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}