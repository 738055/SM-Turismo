'use client';

import React from 'react';
import { Package, Map, Layers, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-dark-900 mb-2">Bem-vindo ao Painel</h1>
      <p className="text-gray-500 mb-8">Gerencie seus produtos, roteiros e configurações do site.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/products" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group">
           <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package size={24} />
           </div>
           <h2 className="text-lg font-bold text-gray-800">Produtos</h2>
           <p className="text-sm text-gray-500 mt-2">Adicione ou edite passeios, preços e fotos.</p>
        </Link>

        <Link href="/admin/itineraries" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group">
           <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 group-hover:text-white transition-colors">
              <Map size={24} />
           </div>
           <h2 className="text-lg font-bold text-gray-800">Roteiros</h2>
           <p className="text-sm text-gray-500 mt-2">Crie itinerários personalizados de múltiplos dias.</p>
        </Link>

        <Link href="/admin/categories" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group">
           <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Layers size={24} />
           </div>
           <h2 className="text-lg font-bold text-gray-800">Categorias</h2>
           <p className="text-sm text-gray-500 mt-2">Organize os tipos de passeios do site.</p>
        </Link>

        <Link href="/admin/banners" className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 group">
           <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <LayoutTemplate size={24} />
           </div>
           <h2 className="text-lg font-bold text-gray-800">Banners</h2>
           <p className="text-sm text-gray-500 mt-2">Altere as imagens de destaque da Home.</p>
        </Link>
      </div>
    </div>
  );
}