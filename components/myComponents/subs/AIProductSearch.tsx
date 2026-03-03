"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Upload,
  Loader2,
  CheckCircle2,
  ShoppingCart,
  X,
  RotateCcw,
  Image as ImageIcon,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface AIProductSearchProps {
  businessId?: string;
  children: React.ReactNode;
}

interface ProductMatch {
  identifiedItem: {
    name: string;
    category?: string;
  };
  options: Array<{
    id: string;
    name: string;
    price: number;
    images: string[];
    category?: string;
    businessId: string;
    reviewsCount?: number;
    rating?: number;
  }>;
}

export const AIProductSearch = ({
  businessId,
  children,
}: AIProductSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [results, setResults] = useState<ProductMatch[]>([]);
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>({});
  const { addItem } = useCart();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- New: List input processing ---
  const [listText, setListText] = useState<string>("");
  const [useListMode, setUseListMode] = useState(false);

  const processList = async () => {
    if (!listText || !listText.trim()) {
      toast.error("Please enter at least one product in the list");
      return;
    }

    setLoading(true);
    setStatus("Analyzing list...");
    setResults([]);
    setSelectedItems({});

    try {
      const { data: keyData } = await axios.get("/api/keys/gemini");
      const genAI = new GoogleGenerativeAI(keyData.apiKey);
      const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-flash" },
        { apiVersion: "v1" }
      );

      const prompt = `
        Extract a JSON array of products from the following free-form shopping list. Each item should be an object with keys: name (string), quantity (number, default 1), category (optional string).

        List:
        ${listText}

        Return ONLY: { "products": [ { "name": "...", "quantity": 1, "category": "..." }, ... ] }
      `;

      const result = await model.generateContent([prompt]);
      const response = await result.response;
      const parsed = JSON.parse(response.text().replace(/```json|```/g, "").trim());

      if (!parsed.products?.length) throw new Error("No products identified from list.");

      setStatus("Searching your store for matches...");

      const searchResults: ProductMatch[] = [];
      for (const identifiedProduct of parsed.products) {
        try {
          const params = new URLSearchParams();
          params.append("model", "product");
          params.append("search", identifiedProduct.name);
          if (businessId) params.append("businessId", businessId);

          const res = await axios.get(`/api/dbhandler?${params.toString()}`);
          const products = res.data || [];

          searchResults.push({
            identifiedItem: { name: identifiedProduct.name, category: identifiedProduct.category },
            options: products.map((p: any) => ({ id: p.id, name: p.name, price: p.price, images: p.images || [], category: p.category?.name, businessId: p.businessId, reviewsCount: p.reviews?.length || 0, rating: p.rating || 0 } as any)),
          });
        } catch (err) {
          console.error(err);
        }
      }

      setResults(searchResults);
      const initialSelection: Record<string, string[]> = {};
      searchResults.forEach((res: ProductMatch, idx: number) => {
        initialSelection[idx] = res.options.length === 1 ? [res.options[0].id] : [];
      });
      setSelectedItems(initialSelection);
      setStatus("Review your items and choose or use Auto-Pick");
    } catch (error: any) {
      console.error("List processing error:", error);
      toast.error(error.message || "Failed to process list");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  const processImage = async () => {
    if (!image) {
      toast.error("Please select an image first");
      return;
    }

    setLoading(true);
    setStatus("Analyzing image...");
    setResults([]);
    setSelectedItems({});

    try {
      // Get Gemini API key
      const { data: keyData } = await axios.get("/api/keys/gemini");
      const genAI = new GoogleGenerativeAI(keyData.apiKey);
      const model = genAI.getGenerativeModel(
        { model: "gemini-2.5-flash" },
        { apiVersion: "v1" }
      );

      setStatus("Extracting products from image...");
      
      const mimeType = image.match(/data:(.*?);base64/)?.[1] || "image/jpeg";
      const base64Data = image.split(",")[1];
      const part = { inlineData: { data: base64Data, mimeType } };

      const prompt = `
        Analyze this image which contains a list of products, shopping list, or items to find.
        Extract the items. For each item, provide:
        - name: Product/Item name (text)
        - quantity: Quantity requested (number)
        - category: Type of product if identifiable
        
        Return ONLY a JSON object: { "products": [{"name": "...", "quantity": number, "category": "..."}] }
        Be concise and accurate.
      `;

      const result = await model.generateContent([prompt, part]);
      const response = await result.response;
      const parsed = JSON.parse(
        response
          .text()
          .replace(/```json|```/g, "")
          .trim()
      );

      if (!parsed.products?.length) {
        throw new Error("No products identified in the image.");
      }

      setStatus("Searching your store for matching products...");

      // Search for products in the specific business
      const searchResults: ProductMatch[] = [];
      
      for (const identifiedProduct of parsed.products) {
        try {
          const params = new URLSearchParams();
          params.append("model", "product");
          params.append("search", identifiedProduct.name);
          if (businessId) {
            params.append("businessId", businessId);
          }

          const res = await axios.get(`/api/dbhandler?${params.toString()}`);
          const products = res.data || [];

          if (products.length > 0) {
            searchResults.push({
              identifiedItem: {
                name: identifiedProduct.name,
                category: identifiedProduct.category,
              },
              options: products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                images: p.images || [],
                category: p.category?.name,
                businessId: p.businessId,
                reviewsCount: p.reviews?.length || 0,
                rating: p.rating || 0,
              } as any)),
            });
          } else {
            // Add a "not found" option that allows custom request
            searchResults.push({
              identifiedItem: {
                name: identifiedProduct.name,
                category: identifiedProduct.category,
              },
              options: [],
            });
          }
        } catch (err) {
          console.error(`Error searching for ${identifiedProduct.name}:`, err);
        }
      }

      setResults(searchResults);

      // Auto-select first option if only one exists
      const initialSelection: Record<string, string[]> = {};
      searchResults.forEach((res: ProductMatch, idx: number) => {
        if (res.options.length === 1) {
          initialSelection[idx] = [res.options[0].id];
        } else {
          initialSelection[idx] = [];
        }
      });
      setSelectedItems(initialSelection);

      setStatus("Review and select your items");
    } catch (error: any) {
      console.error("Processing error:", error);
      setStatus("");
      toast.error(error.message || "Failed to process image");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (identifiedIdx: number, productId: string) => {
    setSelectedItems((prev) => {
      const current = prev[identifiedIdx] || [];
      const isSelected = current.includes(productId);
      const next = isSelected
        ? current.filter((id) => id !== productId)
        : [...current, productId];

      return { ...prev, [identifiedIdx]: next };
    });
  };

  const autoPickBest = () => {
    // Heuristic: favor higher rating and review count, penalize price
    const nextSelection: Record<string, string[]> = {};
    results.forEach((res, idx) => {
      if (!res.options || res.options.length === 0) {
        nextSelection[idx] = [];
        return;
      }
      let bestId = res.options[0].id;
      let bestScore = -Infinity;
      const maxPrice = Math.max(...res.options.map((o) => o.price || 0), 1);
      res.options.forEach((opt: any) => {
        const ratingScore = (opt.rating || 0) * 20;
        const reviewsScore = (opt.reviewsCount || 0) * 0.5;
        const priceScore = -((opt.price || 0) / (maxPrice || 1)) * 30;
        const score = ratingScore + reviewsScore + priceScore;
        if (score > bestScore) {
          bestScore = score;
          bestId = opt.id;
        }
      });
      nextSelection[idx] = [bestId];
    });
    setSelectedItems(nextSelection);
    toast.success("Auto-picked best options for you");
  };

  const handleAddToCart = () => {
    let totalAdded = 0;
    results.forEach((res, idx) => {
      const selectedIds = selectedItems[idx] || [];
      selectedIds.forEach((id) => {
        const product = res.options.find((opt) => opt.id === id);
        if (product) {
          addItem(
            {
              id: product.id,
              name: product.name,
              price: product.price,
              images: product.images,
              category: product.category,
            },
            1
          );
          totalAdded++;
        }
      });
    });

    if (totalAdded > 0) {
      toast.success(`${totalAdded} items added to cart!`);
      setIsOpen(false);
    } else {
      toast.error("Please select at least one product");
    }
  };

  const reset = () => {
    setImage(null);
    setStatus("");
    setResults([]);
    setSelectedItems({});
    setLoading(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => {
        setIsOpen(val);
        if (!val) reset();
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-3xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 border-b shrink-0">
          <DialogTitle className="text-2xl font-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-6 h-6 text-primary" />
              AI Product Search
            </div>
            {results.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="font-bold text-xs gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-6">
            {!image ? (
              <div className="flex flex-col items-center gap-6 w-full py-12">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-bold">Upload or List Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload an image of your shopping list or enter product names (one per line). AI will find items in our store.
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => setUseListMode(false)}
                    className={`px-4 py-2 rounded-lg ${!useListMode ? "bg-primary text-white" : "bg-muted/10"}`}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setUseListMode(true)}
                    className={`px-4 py-2 rounded-lg ${useListMode ? "bg-primary text-white" : "bg-muted/10"}`}
                  >
                    Text List
                  </button>
                </div>

                {!useListMode ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-6">
                    {/* Gallery Upload */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-muted-foreground/25 rounded-3xl bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer group"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-sm">Upload Image</p>
                        <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP</p>
                      </div>
                    </button>

                    {/* Camera Capture */}
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-muted-foreground/25 rounded-3xl bg-muted/5 hover:bg-muted/10 transition-all cursor-pointer group"
                    >
                      <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Camera className="h-6 w-6 text-accent" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-sm">Snap Photo</p>
                        <p className="text-[10px] text-muted-foreground">Use your camera</p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-2xl mt-6">
                    <textarea
                      value={listText}
                      onChange={(e) => setListText(e.target.value)}
                      placeholder={"e.g. 1. Organic honey\n2. Multivitamin tablets 100s\n3. 500ml olive oil"}
                      className="w-full min-h-[140px] p-4 rounded-xl border bg-transparent text-sm"
                    />
                    <div className="flex gap-3 mt-3">
                      <Button onClick={processList} disabled={loading} className="font-bold">
                        {loading ? (
                          <><Loader2 className="h-4 w-4 animate-spin mr-2"/>Analyzing...</>
                        ) : (
                          <>Analyze List</>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setListText("")}>Clear</Button>
                    </div>
                  </div>
                )}

                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraCapture}
                  className="hidden"
                />
              </div>
            ) : !results.length && loading ? (
              <div className="flex flex-col items-center justify-center gap-6 py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <p className="font-bold text-lg">{status}</p>
                  <p className="text-sm text-muted-foreground">This may take a few seconds...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  {results.map((result, idx) => (
                    <div key={idx} className="border rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-bold">{result.identifiedItem.name}</p>
                        {result.identifiedItem.category && (
                          <Badge variant="secondary" className="text-[10px]">
                            {result.identifiedItem.category}
                          </Badge>
                        )}
                      </div>

                      {result.options.length === 0 ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
                          No matching products found. You can request this item during checkout.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {result.options.map((product) => (
                            <label
                              key={product.id}
                              className="flex items-center gap-3 p-3 border rounded-xl hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <Checkbox
                                checked={
                                  selectedItems[idx]?.includes(product.id) || false
                                }
                                onCheckedChange={() =>
                                  toggleSelection(idx, product.id)
                                }
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm leading-snug truncate">
                                  {product.name}
                                </p>
                                {product.category && (
                                  <p className="text-xs text-muted-foreground">
                                    {product.category}
                                  </p>
                                )}
                              </div>
                              <div className="font-bold text-sm shrink-0">
                                ₦{product.price.toLocaleString()}
                              </div>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-3">
                    <Button onClick={autoPickBest} variant="outline" className="flex-1 font-bold">
                      Auto-Pick Best
                    </Button>
                    <Button onClick={() => {
                      // quick sort view toggle: sort options by price asc within each identified group
                      // not persisted — just reorders the results options array for display
                      setResults((prev) => prev.map((r) => ({
                        ...r,
                        options: [...r.options].sort((a: any, b: any) => a.price - b.price)
                      })));
                    }} variant="ghost" className="font-bold">
                      Sort Options by Price
                    </Button>
                  </div>

                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-12 font-bold text-lg gap-2"
                    disabled={
                      !Object.values(selectedItems).some(
                        (items) => items.length > 0
                      )
                    }
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Add Selected to Cart
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-12">
                {image && (
                  <>
                    <img
                      src={image}
                      alt="Preview"
                      className="max-h-64 max-w-full rounded-2xl border-2 border-muted"
                    />
                    <Button
                      onClick={processImage}
                      disabled={loading}
                      size="lg"
                      className="w-full font-bold"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 mr-2" />
                          Search Products
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={reset}
                      variant="outline"
                      className="w-full font-bold"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Choose Another Image
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
