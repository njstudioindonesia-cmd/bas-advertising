"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number, notes?: string, openDrawer?: boolean) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  getItemQuantity: (productId: string) => number;
  clearCart: () => void;
  validateCartWithServer: () => Promise<{ hasChanges: boolean; removedCount: number }>;
  totalItems: number;
  subtotal: number;
  formatRupiah: (amount: number) => string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isLoaded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function parsePriceToNumber(priceStr: string | number): number {
  if (typeof priceStr === "number") return priceStr;
  if (!priceStr) return 0;
  const digits = String(priceStr).replace(/[^0-9]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

export function formatNumberToRupiah(amount: number): string {
  return "Rp " + Math.round(amount).toLocaleString("id-ID");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bas_cart_v2") || localStorage.getItem("bas_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage on cart change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("bas_cart_v2", JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save cart to localStorage", e);
      }
    }
  }, [cart, isLoaded]);

  // Validate cart against server database prices and availability
  const validateCartWithServer = useCallback(async (): Promise<{ hasChanges: boolean; removedCount: number }> => {
    if (cart.length === 0) return { hasChanges: false, removedCount: 0 };

    try {
      const itemsPayload = cart.map((it) => ({
        productId: it.product.id,
        qty: it.quantity,
        clientPrice: parsePriceToNumber(it.product.price),
        designNote: it.notes || "",
      }));

      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: itemsPayload }),
      });

      if (!res.ok) return { hasChanges: false, removedCount: 0 };
      const data = await res.json();

      if (data.success && Array.isArray(data.items)) {
        const validatedMap = new Map<string, any>(data.items.map((i: any) => [i.productId, i]));
        let hasChanges = data.hasChanges || false;
        let removedCount = data.unavailableItems?.length || 0;

        const nextCart: CartItem[] = [];
        for (const item of cart) {
          const fresh = validatedMap.get(item.product.id);
          if (fresh) {
            nextCart.push({
              product: {
                ...item.product,
                price: fresh.price,
                title: fresh.title || item.product.title,
                img: fresh.imageUrl || item.product.img,
                imageUrl: fresh.imageUrl,
              },
              quantity: item.quantity,
              notes: item.notes,
            });
          }
        }

        setCart(nextCart);
        return { hasChanges, removedCount };
      }
    } catch (err) {
      console.warn("Cart server validation skipped:", err);
    }

    return { hasChanges: false, removedCount: 0 };
  }, [cart]);

  // Auto validate when cart opens
  useEffect(() => {
    if (isCartOpen && isLoaded && cart.length > 0) {
      validateCartWithServer();
    }
  }, [isCartOpen, isLoaded, validateCartWithServer, cart.length]);

  const addToCart = (product: any, quantity: number = 1, notes: string = "", openDrawer: boolean = false) => {
    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        if (notes) updated[existingIndex].notes = notes;
        return updated;
      }
      return [...prev, { product, quantity, notes }];
    });
    if (openDrawer) {
      setIsCartOpen(true);
    }
  };

  const getItemQuantity = (productId: string): number => {
    const item = cart.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem("bas_cart_v2");
    } catch {}
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const unitPrice = parsePriceToNumber(item.product.price);
    return sum + unitPrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        getItemQuantity,
        clearCart,
        validateCartWithServer,
        totalItems,
        subtotal,
        formatRupiah: formatNumberToRupiah,
        isCartOpen,
        setIsCartOpen,
        isLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
