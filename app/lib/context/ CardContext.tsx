"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface CartItem {
  id_detalle?: number;
  id_producto: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  imagen?: string;
  artesano?: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id_producto: number) => void;
  updateQty: (id_producto: number, cantidad: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Persist to localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mm_carrito");
    if (saved) setItems(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("mm_carrito", JSON.stringify(items));
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id_producto === item.id_producto);
      if (existing) {
        return prev.map((i) =>
          i.id_producto === item.id_producto
            ? { ...i, cantidad: i.cantidad + item.cantidad }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const removeItem = (id_producto: number) => {
    setItems((prev) => prev.filter((i) => i.id_producto !== id_producto));
  };

  const updateQty = (id_producto: number, cantidad: number) => {
    if (cantidad <= 0) return removeItem(id_producto);
    setItems((prev) =>
      prev.map((i) => (i.id_producto === id_producto ? { ...i, cantidad } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("mm_carrito");
  };

  const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);
  const total = items.reduce((sum, i) => sum + i.precio_unitario * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}