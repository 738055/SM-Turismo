export const dynamic = 'force-dynamic';
export const revalidate = 0;
import React from 'react';
import { supabase } from '@/lib/supabase';
import ProductDetailContent from './ProductDetailContent';
import { Metadata } from 'next';

type Props = {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: product } = await supabase.from('products').select('*').eq('id', params.id).single();
  
  if (!product) {
    console.log('Produto não encontrado para o ID (generateMetadata):', params.id);
    return { title: 'Passeio não encontrado' };
  }
  
  return {
    title: product.title,
    description: product.description,
  }
}

export default async function Page({ params }: Props) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !product) {
    console.log('Erro ao buscar produto:', { id: params.id, error: error?.message });
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Opa! Algo deu errado.</h1>
        <p className="mb-2 text-lg">Não conseguimos carregar o passeio que você está procurando.</p>
        <p className="text-sm text-gray-500 mb-6">Isso pode ser um problema temporário ou o link pode estar quebrado.</p>
        <div className="bg-gray-100 p-4 rounded-lg text-left text-xs text-gray-700">
          <p><strong>ID do Passeio:</strong> {params.id}</p>
          {error && <p><strong>Erro do Banco de Dados:</strong> {error.message}</p>}
          {!product && !error && <p><strong>Status:</strong> Produto não encontrado.</p>}
        </div>
      </div>
    );
  }

  return <ProductDetailContent product={product} />;
}
