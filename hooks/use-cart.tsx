"use client";

import { CartItem } from "@/components/myComponents/subs/cart";
import * as React from "react";
import { useAppContext } from "./useAppContext";
import { PRICE_MARKUPS } from "@/lib/stock-pricing";

//import type { CartItem } from "~/ui/components/cart";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface CartContextType {
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  clearCart: () => void;
  itemCount: number;
  items: CartItem[];
  removeItem: (id: string, bulkPriceId?: string, variantId?: string) => void;
  subtotal: number;
  updateQuantity: (id: string, quantity: number, bulkPriceId?: string, variantId?: string) => void;
}

/* -------------------------------------------------------------------------- */
/*                                Context                                     */
/* -------------------------------------------------------------------------- */

const CartContext = React.createContext<CartContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                         Local-storage helpers                              */
/* -------------------------------------------------------------------------- */

const DEBOUNCE_MS = 500;

const getStorageKey = (businessSlug?: string): string => {
  if (businessSlug) {
    return `cart.storefront.${businessSlug}`;
  }
  return "cart.platform";
};

const loadCartFromStorage = (businessSlug?: string): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const storageKey = getStorageKey(businessSlug);
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed as CartItem[];
    }
  } catch (err) {
    console.error("Failed to load cart:", err);
  }
  return [];
};

/* -------------------------------------------------------------------------- */
/*                               Provider                                     */
/* -------------------------------------------------------------------------- */

interface CartProviderProps extends React.PropsWithChildren {
  businessSlug?: string;
}

export function CartProvider({ children, businessSlug }: CartProviderProps) {
  const { user } = useAppContext();
  const [items, setItems] = React.useState<CartItem[]>(() => loadCartFromStorage(businessSlug));
  
  const role = user?.role || "customer";
  const markup = PRICE_MARKUPS[role as keyof typeof PRICE_MARKUPS] || 1.0;

  /* -------------------- Persist to localStorage (debounced) ------------- */
  const saveTimeout = React.useRef<null | ReturnType<typeof setTimeout>>(null);

  React.useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      try {
        const storageKey = getStorageKey(businessSlug);
        localStorage.setItem(storageKey, JSON.stringify(items));
      } catch (err) {
        console.error("Failed to save cart:", err);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [items, businessSlug]);

  /* ----------------------------- Actions -------------------------------- */
  const addItem = React.useCallback(
    (newItem: Omit<CartItem, "quantity">, qty = 1) => {
      if (qty <= 0) return;
      setItems((prev) => {
        const existing = prev.find((i) => i.id === newItem.id && i.bulkPriceId === newItem.bulkPriceId && i.variantId === newItem.variantId);
        if (existing) {
          return prev.map((i) =>
            (i.id === newItem.id && i.bulkPriceId === newItem.bulkPriceId && i.variantId === newItem.variantId) ? { ...i, quantity: i.quantity + qty } : i,
          );
        }
        return [...prev, { ...newItem, quantity: qty }];
      });
    },
    [],
  );

  const removeItem = React.useCallback((id: string, bulkPriceId?: string, variantId?: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.bulkPriceId === bulkPriceId && i.variantId === variantId)));
  }, []);

  const updateQuantity = React.useCallback((id: string, qty: number, bulkPriceId?: string, variantId?: string) => {
    setItems((prev) =>
      prev.flatMap((i) => {
        if (!(i.id === id && i.bulkPriceId === bulkPriceId && i.variantId === variantId)) return i;
        if (qty <= 0) return []; // treat zero/negative as remove
        if (qty === i.quantity) return i;
        return { ...i, quantity: qty };
      }),
    );
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);

  /* --------------------------- Derived data ----------------------------- */
  const itemCount = React.useMemo(
    () => items.reduce((t, i) => t + i.quantity, 0),
    [items],
  );

  const subtotal = React.useMemo(
    () => items.reduce((t, i) => t + (i.price * markup) * i.quantity, 0),
    [items, markup],
  );

  /* ----------------------------- Context value -------------------------- */
  const value = React.useMemo<CartContextType>(
    () => ({
      addItem,
      clearCart,
      itemCount,
      items,
      removeItem,
      subtotal,
      updateQuantity,
    }),
    [
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/* -------------------------------------------------------------------------- */
/*                                 Hook                                      */
/* -------------------------------------------------------------------------- */

export function useCart(): CartContextType {
  const ctx = React.use(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export { getStorageKey };
