import React from 'react';
import { supabase } from '@/lib/supabase';
import ProductDetailContent from './ProductDetailContent';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
  params: { id: string }
}

// Gera metadados dinâmicos para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: product, error } = await supabase.from('products').select('*').eq('id', params.id).single();
 
  if (error) {
    console.log('Erro no Supabase (generateMetadata):', error);
  }

  if (!product) {
    console.log('Produto não encontrado para o ID (generateMetadata):', params.id);
    return { title: 'Produto não encontrado' };
  }
 
  return {
    title: product.title,
    description: product.description,
    openGraph: {
      images: [product.image_url],
      title: product.title,
      description: product.description
    }
  }
}

export default async function Page({ params }: Props) {
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (error) {
    console.log('Erro no Supabase:', error);
  }

  if (!product) {
    console.log('Produto não encontrado para o ID:', params.id);
    notFound();
  }

  // O componente de conteúdo é Client, mas recebe os dados do Server
  return <ProductDetailContent product={product} />;
}