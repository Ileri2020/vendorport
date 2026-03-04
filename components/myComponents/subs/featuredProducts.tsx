"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./productCard";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useCart } from "@/hooks/use-cart";
import { useAppContext } from "@/hooks/useAppContext";
import { useParams } from 'next/navigation'
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FeaturedProductForm from "@/prisma/forms/FeaturedProductForm";

/* ===============================
   Types
================================ */
export interface FeaturedProductType {
  id: string;
  name: string;
  category: {
    name: string;
  };
  price: number;
  images: string[];
  inStock: boolean;
  rating?: number;
}

/* ===============================
   Component
================================ */
const FeaturedProducts = ({ categoryId, title: customTitle }: { categoryId?: string, title?: string }) => {
  const [products, setProducts] = useState<FeaturedProductType[]>([]);
  const [loading, setLoading] = useState(true);

  /* Autoplay plugins */
  const autoplayLTR = useRef(
    Autoplay({ delay: 2500, stopOnInteraction: false })
  );

  const autoplayRTL = useRef(
    Autoplay({ delay: 2800, stopOnInteraction: false })
  );

  /* ===============================
     Fetch + Normalize Data
  ================================ */
  const isAdmin = useIsAdmin();
  const { currentBusiness } = useAppContext();
  const params = useParams();
  const storeName = (params as any)?.storeName;
  const viewAllHref = storeName ? `/${storeName}/store` : '/store';

  async function fetchProducts() {
    try {
      let url = "/api/dbhandler?model=featuredProduct";
      if (currentBusiness?.id) {
        url += `&businessId=${currentBusiness.id}`;
      }
      if (categoryId) {
        url = `/api/dbhandler?model=product&categoryId=${categoryId}`;
        if (currentBusiness?.id) {
          url += `&businessId=${currentBusiness.id}`;
        }
      }
      const res = await fetch(url);
      const data = await res.json();

      // If categoryId, data is already top level product. If featuredProduct, it is { product: ... }
      const mapped: FeaturedProductType[] = data.map((item: any) => {
        const product = categoryId ? item : item.product;
        if (!product) return null;
        
        const totalStock =
          product.stock?.reduce(
            (sum: number, s: any) => sum + (s.addedQuantity ?? 0),
            0
          ) ?? 0;

        const rating =
          product.reviews?.length > 0
            ? product.reviews.reduce(
              (acc: number, r: any) => acc + r.rating,
              0
            ) / product.reviews.length
            : undefined;

        return {
          id: product.id,
          name: product.name,
          category: {
            name: product.category?.name || "Uncategorized",
          },
          price: product.price,
          images:
            product.images?.length > 0
              ? product.images
              : ["/placeholder.png"],
          inStock: totalStock > 0,
          rating,
        };
      }).filter(Boolean);

      setProducts(mapped);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [categoryId]);

  /* ===============================
     Split products for dual carousel
     – Distribute alternately for balance
  ================================ */
  const [topRow, bottomRow] = useMemo(() => {
    const top: FeaturedProductType[] = [];
    const bottom: FeaturedProductType[] = [];
    products.forEach((p, i) => {
      if (i % 2 == 0) top.push(p);
      else bottom.push(p);
    });
    return [top, bottom];
  }, [products]);

  /* ===============================
     Cart Hook
  ================================ */
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: FeaturedProductType) => {
    // Map FeaturedProductType to the structure expected by cart if necessary
    // Assuming cart expects { id, name, price, images, ... } which FeaturedProductType has
    addItem(product as any, 1);
    toast({
      description: `${product.name} added to cart`,
      duration: 2000,
    });
  };

  return (
    <section className="bg-muted/50 py-12 md:py-16 overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col items-center text-center">
          <h2 className="text-3xl font-bold md:text-4xl">
            {customTitle || "Featured Products"}
          </h2>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-4 max-w-2xl text-muted-foreground">
            {customTitle ? `Browse our ${customTitle} collection` : "Hand-picked products customers love most"}
          </p>

          {isAdmin && (
            <div className="mt-6">
              <Dialog onOpenChange={(open) => !open && fetchProducts()}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Manage Featured Products
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Featured Products</DialogTitle>
                  </DialogHeader>
                  <FeaturedProductForm hideList={true} />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading…</p>
        ) : products.length === 0 ? (
          <div className="space-y-8 py-20 text-center text-muted-foreground">
            <p>No products yet. Add some to showcase your store.</p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-32 bg-accent/5 border rounded-lg flex items-center justify-center font-bold text-accent">
                  Product {i}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ===============================
                TOP CAROUSEL (LTR)
            ================================ */}
            <Carousel
              opts={{ loop: true }}
              plugins={[autoplayLTR.current]}
              className="w-screen max-w-screen-md mx-auto"
            >
              <CarouselContent>
                {topRow.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-1/2 md:basis-1/4 /lg:basis-1/7  px-3"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>

            {/* ===============================
                BOTTOM CAROUSEL (RTL)
            ================================ */}
            <Carousel
              opts={{ loop: true }}
              plugins={[autoplayRTL.current]}
              className="w-screen  max-w-screen-md mx-auto"
            >
              <CarouselContent>
                {bottomRow.map((product) => (
                  <CarouselItem
                    key={product.id}
                    className="basis-1/2 md:basis-1/4 px-3"
                  >
                    <ProductCard
                      product={product}
                      onAddToCart={() => handleAddToCart(product)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link href={viewAllHref}>
            <Button
              variant="outline"
              size="lg"
              className="group h-12 px-8 border-2"
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
