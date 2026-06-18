import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../api/products';

export interface CartItem {
  product: Product;
  quantite: number;
}

interface CartContextType {
  items: CartItem[];
  add: (product: Product, quantite: number) => void;
  remove: (productId: string) => void;
  updateQty: (productId: string, quantite: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const add = (product: Product, quantite: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantite: i.quantite + quantite } : i,
        );
      }
      return [...prev, { product, quantite }];
    });
  };

  const remove = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.product.id !== productId));

  const updateQty = (productId: string, quantite: number) => {
    if (quantite <= 0) { remove(productId); return; }
    setItems((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantite } : i));
  };

  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.product.prix * i.quantite, 0);
  const count = items.reduce((sum, i) => sum + i.quantite, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, updateQty, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
