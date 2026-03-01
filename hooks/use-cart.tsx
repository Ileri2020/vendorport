"use client";

import { CartItem } from "@/components/myComponents/subs/cart";
import * as React from "react";
import { useAppContext } from "@/hooks/useAppContext";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

export interface CheckoutData {
  cartId: string;
  tx_ref: string;
  amount: number;
  currency: string;
}

export interface CartContextType {
  // Cart
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  clearCart: () => void;
  itemCount: number;
  items: CartItem[];
  removeItem: (id: string) => void;
  subtotal: number;
  updateQuantity: (id: string, quantity: number) => void;

  // Checkout (Namespace this too if needed, but let's stick to cart first)
  checkoutData: CheckoutData | null;
  setCheckoutData: (data: CheckoutData | null) => void;
  clearCheckoutData: () => void;
}

const CartContext = React.createContext<CartContextType | undefined>(undefined);

/* -------------------------------------------------------------------------- */
/*                         Local-storage helpers                              */
/* -------------------------------------------------------------------------- */

const MULTI_CART_STORAGE_KEY = "v_builder_multi_carts";
const CHECKOUT_STORAGE_KEY = "v_builder_checkout"; // keeping global for now
const DEBOUNCE_MS = 500;

type MultiCartData = Record<string, CartItem[]>;

const loadAllCartsFromStorage = (): MultiCartData => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(MULTI_CART_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load multi-carts:", err);
    return {};
  }
};

const loadCheckoutFromStorage = (): CheckoutData | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load checkout:", err);
    return null;
  }
};

/* -------------------------------------------------------------------------- */
/*                               Provider                                     */
/* -------------------------------------------------------------------------- */

export function CartProvider({ children }: React.PropsWithChildren) {
  const { currentBusiness } = useAppContext();
  const businessId = currentBusiness?.id || "global";

  /* ----------------------------- State ---------------------------------- */
  const [allCarts, setAllCarts] = React.useState<MultiCartData>(loadAllCartsFromStorage);
  const [checkoutData, setCheckoutDataState] = React.useState<CheckoutData | null>(loadCheckoutFromStorage);

  /* -------------------- Active Items ------------------------------------ */
  const items = React.useMemo(() => allCarts[businessId] || [], [allCarts, businessId]);

  /* -------------------- Persist Carts (debounced) ------------------------- */
  const saveTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    saveTimeout.current = setTimeout(() => {
      try {
        localStorage.setItem(MULTI_CART_STORAGE_KEY, JSON.stringify(allCarts));
      } catch (err) {
        console.error("Failed to save carts:", err);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [allCarts]);

  /* -------------------- Persist Checkout --------------------------------- */
  React.useEffect(() => {
    try {
      if (checkoutData) {
        localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkoutData));
      } else {
        localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      }
    } catch (err) {
      console.error("Failed to save checkout:", err);
    }
  }, [checkoutData]);

  const clearCheckoutData = React.useCallback(() => {
    setCheckoutDataState(null);
  }, []);

  const setCheckoutData = React.useCallback((data: CheckoutData | null) => {
    setCheckoutDataState(data);
  }, []);

  /* ----------------------------- Cart Actions ---------------------------- */
  const addItem = React.useCallback(
    (newItem: Omit<CartItem, "quantity">, qty = 1) => {
      if (qty <= 0) return;
      setAllCarts((prev) => {
        const currentItems = prev[businessId] || [];
        const existing = currentItems.find((i) => i.id === newItem.id);
        
        let nextItems;
        if (existing) {
          nextItems = currentItems.map((i) =>
            i.id === newItem.id ? { ...i, quantity: i.quantity + qty } : i
          );
        } else {
          nextItems = [...currentItems, { ...newItem, quantity: qty }];
        }
        
        return { ...prev, [businessId]: nextItems };
      });
      clearCheckoutData();
    },
    [businessId, clearCheckoutData]
  );

  const removeItem = React.useCallback(
    (id: string) => {
      setAllCarts((prev) => {
        const currentItems = prev[businessId] || [];
        const nextItems = currentItems.filter((i) => i.id !== id);
        return { ...prev, [businessId]: nextItems };
      });
      clearCheckoutData();
    },
    [businessId, clearCheckoutData]
  );

  const updateQuantity = React.useCallback(
    (id: string, qty: number) => {
      setAllCarts((prev) => {
        const currentItems = prev[businessId] || [];
        const nextItems = currentItems.flatMap((i) => {
          if (i.id !== id) return i;
          if (qty <= 0) return [];
          return { ...i, quantity: qty };
        });
        return { ...prev, [businessId]: nextItems };
      });
      clearCheckoutData();
    },
    [businessId, clearCheckoutData]
  );

  const clearCart = React.useCallback(() => {
    setAllCarts((prev) => ({ ...prev, [businessId]: [] }));
    clearCheckoutData();
  }, [businessId, clearCheckoutData]);

  /* --------------------------- Derived data ------------------------------ */
  const itemCount = React.useMemo(
    () => items.reduce((t, i) => t + i.quantity, 0),
    [items]
  );

  const subtotal = React.useMemo(
    () => items.reduce((t, i) => t + i.price * i.quantity, 0),
    [items]
  );

  const value = React.useMemo<CartContextType>(
    () => ({
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      items,
      subtotal,
      checkoutData,
      setCheckoutData,
      clearCheckoutData,
    }),
    [
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      items,
      subtotal,
      checkoutData,
      setCheckoutData,
      clearCheckoutData,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
