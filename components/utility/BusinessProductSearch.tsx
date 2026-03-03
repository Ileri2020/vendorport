"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Trash2,
  ChevronDown,
  ShoppingCart,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";
import { PriceDisplay } from "./PriceDisplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category?: {
    id: string;
    name: string;
  };
  businessId: string;
  reviews?: any[];
}

interface Category {
  id: string;
  name: string;
}

interface BusinessProductSearchProps {
  businessId: string;
  className?: string;
}

export const BusinessProductSearch = ({
  businessId,
  className = "",
}: BusinessProductSearchProps) => {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [sortBy, setSortBy] = useState("newest");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const params = new URLSearchParams();
        params.append("model", "category");
        if (businessId) {
          params.append("businessId", businessId);
        }
        const res = await axios.get(`/api/dbhandler?${params.toString()}`);
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [businessId]);

  // Fetch products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("model", "product");

      if (businessId) {
        params.append("businessId", businessId);
      }

      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }

      if (selectedCategory !== "all") {
        params.append("category", selectedCategory);
      }

      params.append("minPrice", priceRange[0].toString());
      params.append("maxPrice", priceRange[1].toString());

      const res = await axios.get(`/api/dbhandler?${params.toString()}`);
      let filteredProducts = res.data || [];

      // Apply sorting
      if (sortBy === "price-low") {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (sortBy === "price-high") {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (sortBy === "rating") {
        filteredProducts.sort(
          (a, b) =>
            (b.reviews?.length || 0) - (a.reviews?.length || 0)
        );
      }

      setProducts(filteredProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, priceRange, sortBy, businessId]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange([0, 500000]);
    setSortBy("newest");
  };

  const handleAddToCart = (product: Product) => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category?.name,
      },
      1
    );
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-accent/5 to-primary/5 border-b py-6 px-4 md:px-8 rounded-t-2xl">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Search className="h-6 w-6 text-accent" />
            <h2 className="text-2xl md:text-3xl font-black">Search Products</h2>
          </div>
          <p className="text-muted-foreground">
            Discover and browse all available products in our store
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Mobile Filter Toggle */}
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant="outline"
                className="w-full lg:hidden font-bold gap-2"
              >
                <Filter className="h-4 w-4" />
                {isFilterOpen ? "Hide" : "Show"} Filters
                <ChevronDown
                  className={`h-4 w-4 ml-auto transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {isFilterOpen && (
                <Card className="rounded-2xl border-2">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-black uppercase tracking-widest">
                        <Filter className="h-4 w-4 inline mr-2 text-accent" />
                        Filters
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-8 text-[10px] font-bold text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Search */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Search
                      </label>
                      <Input
                        placeholder="Product name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 rounded-xl border-2"
                      />
                    </div>

                    {/* Category Filter */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Category
                      </label>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-10 rounded-xl border-2">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Price Range
                      </label>
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={500000}
                        step={5000}
                        className="cursor-pointer"
                      />
                      <div className="flex justify-between text-sm font-bold">
                        <span>₦{priceRange[0].toLocaleString()}</span>
                        <span>₦{priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Sort By
                      </label>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-10 rounded-xl border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="newest">Newest</SelectItem>
                          <SelectItem value="price-low">Price: Low to High</SelectItem>
                          <SelectItem value="price-high">Price: High to Low</SelectItem>
                          <SelectItem value="rating">Most Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="h-80 bg-muted rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-xl font-bold mb-2">No products found</h3>
                <p className="text-muted-foreground max-w-md">
                  Try adjusting your search filters or browse our categories
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-6 font-bold"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="font-black text-sm uppercase tracking-widest text-muted-foreground">
                    {products.length} Product{products.length !== 1 ? "s" : ""} Found
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card
                      key={product.id}
                      className="rounded-2xl border-2 overflow-hidden hover:border-accent/50 transition-all group cursor-pointer"
                    >
                      {/* Image */}
                      <div className="relative w-full aspect-square bg-muted overflow-hidden">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/50">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground/20" />
                          </div>
                        )}

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            className="gap-2 font-bold"
                            onClick={() => handleAddToCart(product)}
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>

                      {/* Info */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <p className="font-bold text-sm line-clamp-2">
                            {product.name}
                          </p>
                          {product.category && (
                            <Badge variant="secondary" className="text-[10px] mt-2">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-lg font-black text-accent">
                            ₦{product.price.toLocaleString()}
                          </p>
                          {product.reviews && product.reviews.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold">
                                {(
                                  product.reviews.reduce((acc, r) => acc + (r.rating || 0), 0) /
                                  product.reviews.length
                                ).toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>

                        <Button
                          className="w-full h-10 bg-accent hover:bg-accent/90 text-white font-bold rounded-xl gap-2"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
