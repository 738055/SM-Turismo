'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, Plus, Trash2, Globe, Plane, MapPin, Ticket } from 'lucide-react';
import { Product } from '@/lib/types';
import ProductFormWrapper from './ProductFormWrapper';

const TYPE_ICONS: Record<string, React.ReactNode> = {
  transfer: <Plane size={14} className="text-blue-500" />,
  tour: <MapPin size={14} className="text-green-500" />,
  ticket: <Ticket size={14} className="text-purple-500" />,
};

export default function AdminProducts() {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setProductsList(data);
  };

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsWizardOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    await supabase.from('products').delete().eq('id', id);
    fetchData();
  };

  const handleNew = () => {
    setEditingProduct(null);
    setIsWizardOpen(true);
  };

  const handleClose = () => {
    setIsWizardOpen(false);
    setEditingProduct(null);
  };

  const handleSaved = () => {
    setIsWizardOpen(false);
    setEditingProduct(null);
    fetchData();
  };

  if (isWizardOpen) {
    return (
      <div className="max-w-5xl mx-auto py-4">
        <ProductFormWrapper
          editingProduct={editingProduct}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-dark-900">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">{productsList.length} produto(s) cadastrado(s)</p>
        </div>
        <button
          onClick={handleNew}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-3 rounded-lg shadow font-bold flex items-center gap-2 transition-colors"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-900 font-bold border-b">
            <tr>
              <th className="p-4">Produto</th>
              <th className="p-4">Tipo</th>
              <th className="p-4">Cidade</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Preço Base</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {productsList.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold text-dark-900">
                  {p.title}
                  {p.title_en && (
                    <span title="Traduzido">
                      <Globe size={12} className="inline ml-2 text-green-500" />
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span className="flex items-center gap-1.5 text-xs font-bold">
                    {TYPE_ICONS[p.product_type] ?? TYPE_ICONS['tour']}
                    {p.product_type ?? 'tour'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                    {p.city}
                  </span>
                </td>
                <td className="p-4">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs">{p.category}</span>
                </td>
                <td className="p-4 font-bold">
                  R$ {p.price?.toFixed(2).replace('.', ',')}
                </td>
                <td className="p-4 flex gap-3 items-center">
                  <button onClick={() => handleEdit(p)} className="text-blue-600 hover:underline font-bold text-xs">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {productsList.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-400">
                  <Package size={32} className="mx-auto mb-3 text-gray-300" />
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
