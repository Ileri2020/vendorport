"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CategoryForm from "@/prisma/forms/CategoryForm";
import ProductForm from "@/prisma/forms/ProductForm";
import { PackageOpen, PlusCircle, Sparkles } from "lucide-react";

interface StoreSetupPromptProps {
  businessName?: string;
  isOwner: boolean;
  hasCategories: boolean;
  hasProducts: boolean;
  onRefresh?: () => void;
}

export function StoreSetupSkeleton() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10" aria-label="Loading store content">
      <div className="animate-pulse space-y-6 rounded-[2.5rem] border border-border/60 bg-muted/20 p-8">
        <div className="mx-auto h-10 max-w-sm rounded-lg bg-muted" />
        <div className="mx-auto h-4 max-w-2xl rounded bg-muted" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-40 rounded-3xl bg-muted" />
          <div className="h-40 rounded-3xl bg-muted" />
        </div>
      </div>
    </section>
  );
}

export default function StoreSetupPrompt({
  businessName,
  isOwner,
  hasCategories,
  hasProducts,
  onRefresh,
}: StoreSetupPromptProps) {
  const needsCategories = !hasCategories;
  const needsProducts = !hasProducts;
  const title = useMemo(() => {
    if (needsCategories && needsProducts) return `Let’s build ${businessName || "your store"} together`;
    if (needsCategories) return `Create your first category`;
    return `Start adding products`;
  }, [needsCategories, needsProducts, businessName]);

  const subtitle = useMemo(() => {
    if (needsCategories && needsProducts) {
      return "Your storefront is ready — just add product categories and products to go live.";
    }
    if (needsCategories) {
      return "Categories help customers browse your business easily. Add one now to get started.";
    }
    return "Products bring your store to life. Add items now so customers can shop immediately.";
  }, [needsCategories, needsProducts]);

  if (!isOwner) {
    return (
      <section className="mx-auto max-w-6xl py-10 px-4">
        <div className="rounded-3xl border border-dashed border-muted p-8 text-center bg-muted/20">
          <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold">(Store under construction)</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            This store is still being prepared by the owner. Check back soon for products and collections.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl py-10 px-4">
      <div className="rounded-[2.5rem] border border-primary/20 bg-primary/5 p-8 shadow-sm mx-auto">
        <div className="flex flex-col items-center justify-center gap-4 text-center mx-auto">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          </div>
        </div>

        <div className={`mt-10 grid gap-6 ${needsCategories && needsProducts ? "lg:grid-cols-2" : "max-w-xl"} mx-auto justify-center items-center`}>
          {needsCategories && (
            <div className="rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-sm mx-auto">
              <div className="flex items-center gap-3 text-primary">
                <PackageOpen className="h-6 w-6" />
                <div>
                  <h3 className="font-bold text-lg">Add your first category</h3>
                  <p className="text-sm text-muted-foreground">Organize your products into collections customers can browse easily.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Dialog onOpenChange={(open) => !open && onRefresh?.()}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2 bg-primary text-white">
                      <PlusCircle className="h-4 w-4" /> Create Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add a Category</DialogTitle>
                    </DialogHeader>
                    <CategoryForm />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {needsProducts && (
            <div className="rounded-3xl border border-primary/10 bg-white/80 p-6 shadow-sm mx-auto">
              <div className="flex items-center gap-3 text-primary mx-auto">
                <PlusCircle className="h-6 w-6" />
                <div>
                  <h3 className="font-bold text-lg">Add products to your store</h3>
                  <p className="text-sm text-muted-foreground">Create items for customers to purchase and showcase your inventory.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                <Dialog onOpenChange={(open) => !open && onRefresh?.()}>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2 bg-secondary text-white">
                      <PlusCircle className="h-4 w-4" /> Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm hideList={true} />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </div>

        {(needsCategories && needsProducts) && (
          <div className="mt-10 rounded-3xl border border-primary/10 bg-primary/10 p-6 text-sm text-muted-foreground">
            <p>
              Start by creating a category first, then add products to populate this storefront. If you only see a button for products, make sure a category exists before saving your first item.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
