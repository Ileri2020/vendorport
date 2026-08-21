"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/stock-pricing";

export function getVariantAmount(variant: any): number | null {
  const rawAmount = variant?.prices?.[0]?.calculatedAmount ?? variant?.prices?.[0]?.amount;
  if (rawAmount === undefined || rawAmount === null || !Number.isFinite(Number(rawAmount))) return null;
  const amount = Number(rawAmount);
  return amount > 100000 ? amount / 100 : amount;
}

export function getVariantPriceRange(variants: any[]) {
  const amounts = variants.map(getVariantAmount).filter((amount): amount is number => amount !== null);
  if (!amounts.length) return null;
  return { minimum: Math.min(...amounts), maximum: Math.max(...amounts) };
}

export function VariantCard({ variant, onAddToCart }: { variant: any; onAddToCart: (variant: any) => void }) {
  const amount = getVariantAmount(variant);

  return (
    <div className="rounded-xl border bg-background p-3 shadow-sm">
      <div className="min-w-0">
        <h4 className="truncate font-bold">{variant?.title || "Standard option"}</h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {[variant?.weight, variant?.volume].filter(Boolean).join(" · ") || "Standard option"}
        </p>
        {amount !== null && <p className="mt-2 text-sm font-black text-primary">₦ {formatPrice(amount)}</p>}
        {variant?.inventoryItems?.[0]?.sku && <p className="mt-1 text-[10px] text-muted-foreground">SKU: {variant.inventoryItems[0].sku}</p>}
      </div>
      <Button type="button" size="sm" className="mt-3 w-full gap-2" onClick={() => onAddToCart(variant)}>
        <ShoppingCart className="h-4 w-4" />
        Add to Cart
      </Button>
    </div>
  );
}
