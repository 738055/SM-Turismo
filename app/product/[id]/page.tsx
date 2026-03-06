export const dynamic = 'force-dynamic';
export const revalidate = 0;
import React from 'react';
import { supabase } from '@/lib/supabase';
import ProductDetailContent from './ProductDetailContent';
import { Metadata } from 'next';

// Suporta tanto Next.js 14 (objeto) quanto Next.js 15 (Promise)
type Props = {
  params: Promise<{ id: string }> | { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  if (!id || id === 'undefined') {
    return { title: 'ID de passeio inválido' };
  }

  const { data: product } = await supabase.from('products').select('title, description').eq('id', id).single();
  
  if (!product) {
    return { title: 'Passeio não encontrado' };
  }
  
  return {
    title: product.title,
    description: product.description,
  }
}

export default async function Page({ params }: Props) {
  // 1. Extraímos o ID de forma segura para qualquer versão do Next.js
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // 2. Proteção contra URLs com '/product/undefined'
  if (!id || id === 'undefined') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">ID do Passeio Inválido.</h1>
        <p className="mb-2 text-lg">A URL parece estar incorreta.</p>
        <p className="text-sm text-gray-500">O ID do passeio está ausente ou é 'undefined'.</p>
      </div>
    );
  }

  // 3. Busca no Supabase com o ID validado
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !product) {
    console.log('Erro ao buscar produto:', { id: id, error: error?.message });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Opa! Algo deu errado.</h1>
        <p className="mb-2 text-lg">Não conseguimos carregar o passeio que você está procurando.</p>
        <p className="text-sm text-gray-500 mb-6">Isso pode ser um problema temporário ou o link pode estar quebrado.</p>
        <div className="bg-gray-100 p-4 rounded-lg text-left text-xs text-gray-700">
          <p><strong>ID do Passeio:</strong> {id}</p>
          {error && <p><strong>Erro do Banco de Dados:</strong> {error.message}</p>}
          {!product && !error && <p><strong>Status:</strong> Produto não encontrado.</p>}
        </div>
      </div>
    );
  }

  return <ProductDetailContent product={product} />;
}
