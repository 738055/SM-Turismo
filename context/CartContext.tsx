'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product, CartItemSelection } from '@/lib/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, selections: CartItemSelection[], date?: string) => void;
  addManyToCart: (newItems: CartItem[]) => void;
  removeFromCart: (productId: string, selectedDate?: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do localStorage ao iniciar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('foztursm_cart');
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          const validItems = Array.isArray(parsed) ? parsed : [];
          setItems(validItems);
        } catch (e) { 
          console.error("Erro ao carregar carrinho", e);
          setItems([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('foztursm_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Função auxiliar para mesclar itens idênticos (mesmo ID e mesma DATA)
  const mergeCartItems = (currentItems: CartItem[], newItem: CartItem): CartItem[] => {
    // Procura se já existe um item com mesmo ID e mesma DATA
    const existingIndex = currentItems.findIndex(item => 
      item.id === newItem.id && item.selectedDate === newItem.selectedDate
    );

    if (existingIndex >= 0) {
      const updatedItems = [...currentItems];
      const currentItem = updatedItems[existingIndex];
      
      // Cria cópias para não mutar estado diretamente
      const currentSelections = currentItem.selections || [];
      const updatedSelections = [...currentSelections];

      // Mescla as seleções (ex: somar quantidade de Adultos se já existir)
      newItem.selections.forEach(newSel => {
        const selIndex = updatedSelections.findIndex(s => s.label === newSel.label);
        if (selIndex >= 0) {
          updatedSelections[selIndex].quantity += newSel.quantity;
        } else {
          updatedSelections.push(newSel);
        }
      });

      // Recalcula totais
      const newTotalItemPrice = updatedSelections.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      const newTotalItemQuantity = updatedSelections.reduce((acc, curr) => acc + curr.quantity, 0);

      updatedItems[existingIndex] = {
        ...currentItem,
        selections: updatedSelections,
        totalItemPrice: newTotalItemPrice,
        quantity: newTotalItemQuantity
      };
      return updatedItems;
    }

    // Se não existir igual, adiciona novo
    return [...currentItems, newItem];
  };

  const addToCart = (product: Product, selections: CartItemSelection[], date?: string) => {
    const totalSelectionPrice = selections.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    const totalSelectionQuantity = selections.reduce((acc, curr) => acc + curr.quantity, 0);

    const newItem: CartItem = { 
      ...product, 
      selections, 
      totalItemPrice: totalSelectionPrice,
      quantity: totalSelectionQuantity,
      selectedDate: date
    };

    setItems(prev => mergeCartItems(prev, newItem));
  };

  const addManyToCart = (newItems: CartItem[]) => {
    setItems(prev => {
      let updatedCart = [...prev];
      newItems.forEach(item => {
        updatedCart = mergeCartItems(updatedCart, item);
      });
      return updatedCart;
    });
  };

  const removeFromCart = (productId: string, selectedDate?: string) => {
    setItems(prev => prev.filter(item => {
      // Remove apenas se o ID E a DATA coincidirem (ou ambos não tiverem data)
      const sameId = item.id === productId;
      const sameDate = item.selectedDate === selectedDate;
      return !(sameId && sameDate);
    }));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + (item.totalItemPrice || 0), 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addToCart, addManyToCart, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};