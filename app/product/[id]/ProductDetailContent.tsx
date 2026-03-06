'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Star, Clock, Users, MapPin, ShieldCheck, Camera, Check, Plus, Minus, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Product, CartItemSelection } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function ProductDetailContent({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  
  const [activePhoto, setActivePhoto] = useState(0);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image_url];

  // Estado para gerenciar quantidades das variantes
  // Se não tiver variantes no banco, cria uma "Padrão" usando o preço base
  const defaultVariants = product.price_variants && product.price_variants.length > 0 
    ? product.price_variants.map(v => ({ ...v, quantity: 0 }))
    : [{ label: 'Adulto / Unidade', price: product.promo_price || product.price, quantity: 1 }];

  const [selections, setSelections] = useState(defaultVariants);

  // Atualiza quantidade de uma variante específica
  const updateQuantity = (index: number, delta: number) => {
    setSelections(prev => {
      const newSel = [...prev];
      const newVal = newSel[index].quantity + delta;
      if (newVal >= 0) newSel[index].quantity = newVal;
      return newSel;
    });
  };

  // Calcula total atual da seleção
  const currentTotal = selections.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
  const hasItemsSelected = selections.some(s => s.quantity > 0);

  const handleAddToCart = (redirect: boolean) => {
    // Filtra apenas o que tem quantidade > 0
    const finalSelections: CartItemSelection[] = selections
      .filter(s => s.quantity > 0)
      .map(s => ({ label: s.label, price: s.price, quantity: s.quantity }));

    addToCart(product, finalSelections);
    
    if (redirect) {
      router.push('/cart');
    } else {
      // Reset ou Feedback visual
      alert('Adicionado ao carrinho! Você pode continuar navegando.');
      setSelections(prev => prev.map(s => ({ ...s, quantity: 0 }))); // Opcional: limpa seleção
    }
  };

  // --- SEO: SCHEMA.ORG JSON-LD ---
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image_url,
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? window.location.href : '',
      priceCurrency: 'BRL',
      price: product.promo_price || product.price,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviews_count
    }
  };

  return (
    <article className="min-h-screen bg-white pt-24 pb-12 font-sans">
      {/* Script de SEO Injetado */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
        {/* Breadcrumb Otimizado */}
        <nav className="flex items-center text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
           <Link href="/" className="hover:text-brand-600">Home</Link> 
           <span className="mx-2">/</span>
           <Link href={`/products?category=${product.category}`} className="hover:text-brand-600">{product.category}</Link>
           <span className="mx-2">/</span>
           <span className="text-gray-800 font-medium truncate" aria-current="page">{product.title}</span>
        </nav>

        {/* Header do Produto */}
        <header className="mb-6">
           <h1 className="text-3xl md:text-4xl font-extrabold text-dark-900 mb-2">{product.title}</h1>
           <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1" title={`Avaliação: ${product.rating} de 5`}>
                 <div className="flex text-yellow-400">
                    <Star size={16} fill="currentColor" />
                 </div>
                 <span className="font-bold text-dark-900">{product.rating}</span>
                 <span className="text-gray-500">({product.reviews_count} avaliações)</span>
              </div>
              <span className="flex items-center gap-1 text-gray-500"><MapPin size={16} /> {product.location}</span>
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Coluna Esquerda: Mídia e Info */}
          <div className="lg:col-span-3 space-y-8">
             {/* Galeria */}
             <div className="space-y-2">
                <div className="relative aspect-video rounded-none overflow-hidden bg-gray-100">
                   <img 
                     src={gallery[activePhoto]} 
                     className="w-full h-full object-cover transition-opacity duration-300" 
                     alt={`Foto ${activePhoto + 1} de ${product.title}`} 
                   />
                   <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                      <Camera size={14} /> {activePhoto + 1} / {gallery.length}
                   </div>
                </div>
                {gallery.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                     {gallery.map((img, idx) => (
                        <button key={idx} onClick={() => setActivePhoto(idx)} className={`w-20 h-20 flex-shrink-0 rounded-none overflow-hidden border-2 transition-all ${activePhoto === idx ? 'border-brand-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                           <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${idx}`} />
                        </button>
                     ))}
                  </div>
                )}
             </div>

             {/* Icons Info */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-none border border-gray-100 text-center">
                   <Clock className="w-6 h-6 mx-auto text-brand-500 mb-2" />
                   <div className="text-xs text-gray-500 font-bold uppercase">Duração</div>
                   <div className="text-sm font-bold text-dark-900">{product.duration}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-none border border-gray-100 text-center">
                   <Users className="w-6 h-6 mx-auto text-brand-500 mb-2" />
                   <div className="text-xs text-gray-500 font-bold uppercase">Capacidade</div>
                   <div className="text-sm font-bold text-dark-900">{product.capacity}</div>
                </div>
             </div>

             {/* Descrição */}
             <section>
                <h2 className="text-2xl font-bold text-dark-900 mb-4">Sobre esta atividade</h2>
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: product.full_description?.replace(/\n/g, '<br/>') || product.description }}></div>
             </section>
             
             {/* Inclusos */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50 p-6 rounded-none border border-gray-100">
               {product.amenities && product.amenities.length > 0 && (
                 <div>
                   <h3 className="font-bold text-dark-900 mb-3 flex items-center gap-2"><Check size={18} className="text-green-500"/> O que está incluso</h3>
                   <ul className="space-y-2">
                     {product.amenities.map((item, idx) => (
                       <li key={idx} className="flex gap-2 text-sm text-gray-600 items-start">
                         <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0"></span> {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
               {product.excludes && product.excludes.length > 0 && (
                 <div>
                   <h3 className="font-bold text-dark-900 mb-3 flex items-center gap-2"><ShieldCheck size={18} className="text-red-500"/> Não incluso</h3>
                   <ul className="space-y-2">
                     {product.excludes.map((item, idx) => (
                       <li key={idx} className="flex gap-2 text-sm text-gray-600 items-start">
                         <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 shrink-0"></span> {item}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}
             </div>
          </div>

          {/* Coluna Direita: Sticky Checkout Widget */}
          <aside className="lg:col-span-1">
             <div className="sticky top-28 bg-white border-2 border-dark-900 rounded-none p-6 overflow-hidden">
                <div className="mb-6 border-b border-gray-100 pb-4">
                   <p className="text-gray-500 text-sm mb-1">{t('from')}</p>
                   {product.promo_price ? (
                      <div>
                         <span className="text-gray-400 line-through text-sm">R$ {product.price.toFixed(2)}</span>
                         <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-extrabold text-brand-600">R$ {product.promo_price.toFixed(2)}</span>
                            <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-xs">OFERTA</span>
                         </div>
                      </div>
                   ) : (
                      <span className="text-4xl font-extrabold text-brand-600">R$ {product.price.toFixed(2)}</span>
                   )}
                </div>

                {/* SELETOR DE QUANTIDADE (ADULTO / CRIANÇA) */}
                <div className="space-y-4 mb-6">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Selecione os ingressos:</h3>
                  {selections.map((variant, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm text-dark-900">{variant.label}</p>
                        <p className="text-xs text-gray-500">R$ {variant.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-50 rounded-none p-1 border border-gray-200">
                        <button 
                          onClick={() => updateQuantity(idx, -1)} 
                          className={`w-8 h-8 flex items-center justify-center rounded-none bg-white shadow-sm transition-colors ${variant.quantity <= 0 ? 'text-gray-300' : 'text-brand-600 hover:bg-gray-50'}`}
                          disabled={variant.quantity <= 0}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-4 text-center font-bold text-dark-900">{variant.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(idx, 1)} 
                          className="w-8 h-8 flex items-center justify-center rounded-none bg-white shadow-sm text-brand-600 hover:bg-gray-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumo do Total */}
                <div className="bg-brand-50 p-4 rounded-none mb-6 flex justify-between items-center">
                  <span className="text-sm font-bold text-brand-900">Total Previsto:</span>
                  <span className="text-xl font-extrabold text-brand-600">R$ {currentTotal.toFixed(2)}</span>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3">
                  <button 
                    onClick={() => handleAddToCart(true)} 
                    disabled={!hasItemsSelected} 
                    className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-dark-900 font-bold py-4 rounded-none text-xl uppercase tracking-wide transition-all flex items-center justify-center gap-2"
                  >
                    Comprar Agora
                  </button>
                  <button 
                    onClick={() => handleAddToCart(false)} 
                    disabled={!hasItemsSelected} 
                    className="w-full bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50 disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed font-bold py-3 rounded-none transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={18} /> Adicionar e Continuar
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                   <ShieldCheck size={14} className="text-green-500" /> Compra 100% Segura via WhatsApp
                </div>
             </div>
          </aside>
        </div>
      </div>
    </article>
  );
}