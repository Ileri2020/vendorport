"use client"
import { Button } from '@/components/ui/button';
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { ProductCard } from "./productCard";
import { useCart } from "@/hooks/use-cart";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppContext } from "@/hooks/useAppContext";
import { Plus, ChevronLeft, ChevronRight, LayoutGrid, LayoutList } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ProductForm from "@/prisma/forms/ProductForm";
import { getSavedUserLocation, locationMatchesBusiness, rankByDistance, USER_LOCATION_CHANGED_EVENT } from "@/lib/user-location";

const ITEMS_PER_PAGE = 30;

const shuffleArray = <T,>(array: T[]): T[] => {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const Stocks = () => {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");
  const concernFilter = searchParams.get("concern"); // ✅ NEW: health concern filter
  const brandFilter = searchParams.get("brand");
  const minPriceFilter = searchParams.get("minPrice");
  const maxPriceFilter = searchParams.get("maxPrice");
  const locationFilter = searchParams.get("location");
  const isFeatured = searchParams.get("featured") === "true";
  const isDiscounted = searchParams.get("discounted") === "true";
  const closestToMe = searchParams.get("closest") === "true";
  
  const { addItem } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const isAdmin = useIsAdmin();
  const isMobile = useIsMobile();
  const { currentBusiness } = useAppContext();
  const businessId = currentBusiness?.id;
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [cardOrientation, setCardOrientation] = useState<"horizontal" | "vertical">("horizontal");
  const [showOrientationPopup, setShowOrientationPopup] = useState(false);
  const [locationRevision, setLocationRevision] = useState(0);
  const orientationStorageKey = businessId ? `store-card-orientation:${businessId}` : 'store-card-orientation';

  useEffect(() => {
    const refreshLocation = () => setLocationRevision((revision) => revision + 1);
    window.addEventListener(USER_LOCATION_CHANGED_EVENT, refreshLocation);
    return () => window.removeEventListener(USER_LOCATION_CHANGED_EVENT, refreshLocation);
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, brandFilter, concernFilter, minPriceFilter, maxPriceFilter, locationFilter, isFeatured, isDiscounted, closestToMe]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const bizQ = businessId ? `&businessId=${businessId}` : "";
      let url = `/api/dbhandler?model=product&include=category,brand,stock${bizQ}`;
      
      if (brandFilter) url += `&brand=${encodeURIComponent(brandFilter)}`;
      if (categoryFilter) url += `&categoryName=${encodeURIComponent(categoryFilter)}`;
      if (concernFilter) url += `&concern=${encodeURIComponent(concernFilter)}`;
      if (minPriceFilter) url += `&minPrice=${encodeURIComponent(minPriceFilter)}`;
      if (maxPriceFilter) url += `&maxPrice=${encodeURIComponent(maxPriceFilter)}`;
      if (locationFilter) url += `&location=${encodeURIComponent(locationFilter)}`;

      if (!isAdmin) {
         url += `&requireImages=true&requirePrice=true`;
      }

      if (isFeatured || isDiscounted) {
        url += `&limit=5000`;
        const res = await axios.get(url);
        let data = res.data.data || res.data; // Handle potential format change just in case

        if (closestToMe) data = await rankByDistance(data, getSavedUserLocation(), (product: any) => product.business);

        if (isFeatured) {
          const featRes = await axios.get(`/api/dbhandler?model=featuredProduct&minimal=true${bizQ}`);
          const featIds = new Set(featRes.data.map((f: any) => f.productId));
          data = data.filter((p: any) => featIds.has(p.id));
        }

        if (isDiscounted) {
          const discRes = await axios.get('/api/heavily-discounted?admin=false');
          const discIds = new Set(discRes.data.map((d: any) => d.productId));
          data = data.filter((p: any) => discIds.has(p.id));
        }

        const shuffled = closestToMe ? data : shuffleArray(data);
        setProducts(shuffled);
        setTotalProducts(shuffled.length);
      } else {
        // Load up to 5000 matching products, then randomize order on the client.
        // This ensures the platform and store product page show a different mix each load.
        url += `&limit=5000`;
        const res = await axios.get(url);
        const fetchedProducts = res.data.data || res.data;
        const savedLocation = closestToMe ? getSavedUserLocation() : null;
        const prioritizedProducts = closestToMe
          ? await rankByDistance(fetchedProducts, savedLocation, (product: any) => product.business)
          : fetchedProducts;
        const shuffled = closestToMe ? prioritizedProducts : shuffleArray(prioritizedProducts);

        const pagedProducts = shuffled.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
        setProducts(pagedProducts);
        setTotalProducts(fetchedProducts.length);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, brandFilter, concernFilter, minPriceFilter, maxPriceFilter, locationFilter, isFeatured, isDiscounted, closestToMe, isAdmin, currentPage, businessId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (locationRevision > 0) fetchProducts();
  }, [fetchProducts, locationRevision]);

  // Load card orientation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(orientationStorageKey);
    if (saved === 'vertical' || saved === 'horizontal') {
      setCardOrientation(saved);
    }
  }, [orientationStorageKey]);

  useEffect(() => {
    if (businessId && localStorage.getItem(orientationStorageKey)) return;
    const businessOrientation = currentBusiness?.siteSettings?.productCardOrientation;
    if (businessOrientation === 'vertical' || businessOrientation === 'horizontal') {
      setCardOrientation(businessOrientation);
    }
  }, [businessId, currentBusiness?.siteSettings?.productCardOrientation, orientationStorageKey]);

  // Show orientation popup for first-time mobile visitors
  useEffect(() => {
    if (isMobile) {
      const hasSeenPopup = localStorage.getItem('store-orientation-popup-seen');
      if (!hasSeenPopup) {
        const timer = setTimeout(() => {
          setShowOrientationPopup(true);
          localStorage.setItem('store-orientation-popup-seen', 'true');
        }, 10000); // 10 seconds
        return () => clearTimeout(timer);
      }
    }
  }, [isMobile]);

  const toggleOrientation = () => {
    const newOrientation = cardOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    setCardOrientation(newOrientation);
    localStorage.setItem(orientationStorageKey, newOrientation);
  };

  const handleAddToWishlist = (productId: string) => {
    alert(`Adding product ${productId} to wishlist`);
  };

  // Pagination Logic
  const visibleProducts = products; // Already filtered by backend if not admin
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  const currentItems = isFeatured || isDiscounted 
    ? visibleProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
    : visibleProducts;

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col items-center py-8 px-1">
        <div className={`grid ${cardOrientation === 'horizontal' ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 px-2 md:px-4 max-w-7xl w-full`}>
          {[...Array(8)].map((_, index) => (
            <div key={index} className="flex flex-col space-y-4 w-full p-2 border rounded-xl shadow-sm">
              <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
              <div className="space-y-2 flex-1 px-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-1/3 mt-2" />
              </div>
              <div className="pt-2 px-2 pb-2">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center py-8">

      {/* 📦 Fixed Floating Add Product Button (Admin Only) */}
      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-50">
          <Dialog onOpenChange={(open) => !open && fetchProducts()}>
            <DialogTrigger asChild>
              <Button
                size="lg"
                className="gap-2 bg-primary hover:bg-primary/90 shadow-xl rounded-full px-5 py-3 font-semibold text-sm"
              >
                <Plus className="h-5 w-5" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <ProductForm hideList={true} />
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* 📱 Mobile Card Orientation Toggle */}
      {isMobile && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            size="lg"
            onClick={toggleOrientation}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-xl rounded-full px-4 py-3 font-semibold text-sm"
            title={`Switch to ${cardOrientation === 'horizontal' ? 'vertical' : 'horizontal'} layout`}
          >
            {cardOrientation === 'horizontal' ? <LayoutList className="h-5 w-5" /> : <LayoutGrid className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {currentItems.length > 0 ? (
        <div className={`grid ${cardOrientation === 'horizontal' ? 'grid-cols-1' : 'grid-cols-2'} md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 px-1 md:px-4 max-w-7xl w-full`}>
          {currentItems.map((product) => (
            <ProductCard
              key={product.id}
              className="w-full group mx-auto shadow-md shadow-accent"
              orientation={cardOrientation}
              product={{ 
                ...product, 
                inStock: true, 
                originalPrice: Number(product.price) * 1.2, 
                rating: 5,
                categoryName: product.category?.name || "Pharmacy"
              }}
              onAddToCart={(item) => addItem(item, 1)}
              onAddToWishlist={() => handleAddToWishlist(product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <h3 className="text-xl font-medium text-muted-foreground">No products found in this category.</h3>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-lg"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => {
            // Show first, last, and pages around current
            if (
              number === 1 ||
              number === totalPages ||
              (number >= currentPage - 2 && number <= currentPage + 2)
            ) {
              return (
                <Button
                  key={number}
                  variant={currentPage === number ? "default" : "outline"}
                  onClick={() => paginate(number)}
                  className={`w-10 h-10 rounded-lg ${currentPage === number ? 'bg-primary' : ''}`}
                >
                  {number}
                </Button>
              );
            } else if (
              number === currentPage - 3 ||
              number === currentPage + 3
            ) {
              return <span key={number} className="px-1 text-muted-foreground">...</span>;
            }
            return null;
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-lg"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Mobile Orientation Popup */}
      <Dialog open={showOrientationPopup} onOpenChange={setShowOrientationPopup}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Customize Your View</DialogTitle>
            <DialogDescription>
              Try switching between horizontal and vertical product card layouts to see which one you prefer!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setShowOrientationPopup(false)}>
              Maybe Later
            </Button>
            <Button onClick={() => {
              setShowOrientationPopup(false);
              toggleOrientation();
            }}>
              Try It Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Stocks;