import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price?: number;
  description?: string;
}

interface FeaturedProduct {
  id: string;
  productId: string;
  product: Product;
}

const MAX_FEATURED_PRODUCTS = 16;

interface FeaturedProductFormProps {
  hideList?: boolean;
}

import { AdminFormContainer } from "@/components/utility/AdminFormContainer";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Trash2, Edit } from "lucide-react";

export default function FeaturedProductForm({ hideList = false }: FeaturedProductFormProps) {
  const [featuredProduct, setFeaturedProduct] = useState<FeaturedProduct[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    productId: "",
    productName: "",
  });

  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    refreshAll();
  }, []);

  const refreshAll = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchFeaturedProduct(), fetchProducts()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProduct = async () => {
    try {
      const res = await axios.get("/api/dbhandler?model=featuredProduct");
      setFeaturedProduct(res.data);
    } catch (err) {
      console.error("Failed to fetch featured products", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/api/dbhandler?model=product");
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
  };

  const featuredIds = useMemo(
    () => new Set(featuredProduct.map((f) => f.productId)),
    [featuredProduct]
  );

  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const isLimitReached =
    featuredProduct.length >= MAX_FEATURED_PRODUCTS && !editId;

  const handleFeatureClick = async (item: Product) => {
    if (featuredIds.has(item.id)) return;

    if (featuredProduct.length >= MAX_FEATURED_PRODUCTS) {
      toast.error(`You can only feature up to ${MAX_FEATURED_PRODUCTS} products.`);
      return;
    }

    try {
      await axios.post("/api/dbhandler?model=featuredProduct", {
        productId: item.id,
      });

      toast.success(`${item.name} featured successfully`);
      await refreshAll();
    } catch (err) {
      console.error("Failed to feature product:", err);
      toast.error("Failed to feature product");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editId || !formData.productId) return;

    try {
      await axios.put(
        `/api/dbhandler?model=featuredProduct&id=${editId}`,
        { productId: formData.productId }
      );

      toast.success("Featured product updated");
      resetForm();
      refreshAll();
    } catch (err) {
      console.error("Failed to update featured product:", err);
      toast.error("Failed to update featured product");
    }
  };

  const handleEdit = (item: FeaturedProduct) => {
    setFormData({
      productId: item.productId,
      productName: item.product?.name || "",
    });
    setEditId(item.id);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Remove ${name} from featured products?`)) return;
    try {
      await axios.delete(`/api/dbhandler?model=featuredProduct&id=${id}`);
      toast.success("Feature removed");
      refreshAll();
    } catch (err) {
      console.error("Failed to delete featured product", err);
      toast.error("Failed to remove feature");
    }
  };

  const resetForm = () => {
    setFormData({ productId: "", productName: "" });
    setEditId(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-1">
      <AdminFormContainer 
        title="Featured Collections" 
        description="Choose products to highlight on your home page carousel."
      >
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products to feature..."
              className="h-12 pl-10 rounded-2xl border-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredProducts.map((item) => {
              const isFeatured = featuredIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-2xl border-2 transition-all group shadow-sm",
                    isFeatured 
                      ? "bg-accent/5 border-accent/20" 
                      : "bg-muted/30 border-transparent hover:bg-white hover:border-accent/10"
                  )}
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-bold text-sm truncate uppercase tracking-tight">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">₦{(item.price || 0).toLocaleString()}</p>
                  </div>
                  <Button
                    size="sm"
                    className={cn(
                      "h-8 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest",
                      isFeatured ? "bg-accent/20 text-accent hover:bg-accent/30" : "bg-primary shadow-lg shadow-primary/20"
                    )}
                    onClick={() => handleFeatureClick(item)}
                    disabled={isFeatured || isLimitReached}
                  >
                    {isFeatured ? (
                      <div className="flex items-center gap-1"><Star className="h-3 w-3 fill-accent" /> FEAT</div>
                    ) : isLimitReached ? (
                      "FULL"
                    ) : (
                      "ADD"
                    )}
                  </Button>
                </div>
              );
            })}
            {filteredProducts.length === 0 && (
               <div className="col-span-full py-10 text-center text-muted-foreground italic text-sm">No products matching your search.</div>
            )}
          </div>

          {!hideList && (
            <div className="pt-8 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg uppercase tracking-widest text-primary/60">Featured Items</h3>
                <Badge className="font-bold bg-accent/10 text-accent hover:bg-accent/20 border-none">
                  {featuredProduct.length} / {MAX_FEATURED_PRODUCTS}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {featuredProduct.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 p-4 bg-white rounded-3xl border-2 border-accent/10 shadow-lg shadow-accent/5 group"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 overflow-hidden">
                        <p className="font-black text-sm uppercase tracking-tight truncate">
                          {index + 1}. {item.product?.name ?? "Unnamed"}
                        </p>
                        <p className="text-[10px] text-accent font-black tracking-widest uppercase">₦{(item.product?.price || 0).toLocaleString()}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                         <Button size="icon" variant="ghost" onClick={() => handleEdit(item)} className="h-8 w-8 text-muted-foreground hover:text-accent group-hover:bg-accent/10">
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button size="icon" variant="ghost" onClick={() => handleDelete(item.id, item.product?.name || "this item")} className="h-8 w-8 text-muted-foreground hover:text-destructive group-hover:bg-destructive/10">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {featuredProduct.length === 0 && (
                  <div className="col-span-full p-10 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3 bg-muted/20">
                    <Star className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm font-medium">Add products above to see them in your home page spotlight.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {editId && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
               <div className="w-full max-w-md bg-background rounded-[2.5rem] p-8 shadow-2xl border-none">
                 <h4 className="text-xl font-black mb-1">Modify Selection</h4>
                 <p className="text-sm text-muted-foreground mb-6">Updating focal product for this feature slot.</p>
                 <Input value={formData.productName} disabled className="h-12 border-2 bg-muted/50 font-bold mb-6 rounded-2xl" />
                 <div className="flex gap-3">
                    <Button onClick={handleSubmit} className="flex-1 h-12 rounded-2xl font-black bg-accent shadow-lg shadow-accent/20">Update Slot</Button>
                    <Button onClick={resetForm} variant="outline" className="flex-1 h-12 rounded-2xl font-black border-2">Cancel</Button>
                 </div>
               </div>
            </div>
          )}
        </div>
      </AdminFormContainer>
    </div>
  );
}
