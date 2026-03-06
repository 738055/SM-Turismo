import React from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductBanners from '@/components/ProductBanners';
import ItineraryModal from '@/components/ItineraryModal';
import Link from 'next/link';
import { Search, Frown, Compass, Map } from 'lucide-react';

export const dynamic = 'force-dynamic';

const CITIES = ['Todos', 'Foz do Iguaçu - BR', 'Ciudad del Este - PY', 'Puerto Iguazu - AR'];

const CITY_CONFIG: Record<string, any> = {
  'Foz do Iguaçu - BR': { flag: '🇧🇷', title: 'O que fazer em Foz' },
  'Ciudad del Este - PY': { flag: '🇵🇾', title: 'Compras no Paraguai' },
  'Puerto Iguazu - AR': { flag: '🇦🇷', title: 'Argentina' }
};

export default async function ProductList({
  searchParams,
}: {
  searchParams?: { q?: string; category?: string; city?: string };
}) {
  const queryTerm = searchParams?.q || '';
  const currentCategory = searchParams?.category || 'Todos';
  const currentCity = searchParams?.city || 'Todos';

  let productQuery = supabase.from('products').select('*');
  
  if (queryTerm) productQuery = productQuery.ilike('title', `%${queryTerm}%`);
  if (currentCategory !== 'Todos') productQuery = productQuery.eq('category', currentCategory);
  if (currentCity !== 'Todos') productQuery = productQuery.eq('city', currentCity);

  const [productsRes, categoriesRes, bannersRes, itinerariesRes] = await Promise.all([
    productQuery,
    supabase.from('categories').select('name, slug').eq('active', true).order('name'),
    supabase.from('banners').select('*').eq('active', true),
    supabase.from('itineraries')
      .select('*, items:itinerary_items(*, product:products(*))')
      .eq('active', true)
  ]);

  const products = productsRes.data || [];
  const categories = [{ name: 'Todas Categorias', slug: 'Todos' }, ...(categoriesRes.data || [])];
  const banners = bannersRes.data || [];
  const itineraries = itinerariesRes.data || [];

  return (
    <div className="bg-white min-h-screen pb-20">
      
      <div className="pt-20">
         {currentCity === 'Todos' ? (
            <ProductBanners banners={banners} />
         ) : (
            <div className="bg-dark-900 text-white py-12 text-center">
               <span className="text-4xl block mb-2">{CITY_CONFIG[currentCity]?.flag}</span>
               <h1 className="text-3xl font-bold">{CITY_CONFIG[currentCity]?.title}</h1>
            </div>
         )}
      </div>

      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
         <div className="max-w-[1440px] mx-auto px-4 md:px-8 overflow-x-auto py-4 custom-scrollbar">
            <div className="flex items-center gap-4">
               {CITIES.map((city) => {
                 const isActive = currentCity === city;
                 const label = city === 'Todos' ? 'Visão Geral' : city.split('-')[0].trim();
                 return (
                   <Link 
                     key={city}
                     href={`/products?city=${encodeURIComponent(city)}`}
                     className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                       isActive ? 'bg-brand-600 text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                     }`}
                   >
                     {city === 'Todos' ? <Compass size={16}/> : null}
                     {label}
                   </Link>
                 );
               })}
            </div>
         </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
        
        {currentCity === 'Todos' && itineraries.length > 0 && (
           <section className="mb-12 animate-fade-in">
              <h2 className="text-2xl font-bold text-dark-900 mb-6 flex items-center gap-2">
                 <Map className="text-brand-500" /> Roteiros Prontos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {itineraries.map(it => (
                    <ItineraryModal key={it.id} itinerary={it} />
                 ))}
              </div>
           </section>
        )}

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
           <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
             {categories.map(cat => (
               <Link 
                 key={cat.slug} 
                 href={`/products?city=${encodeURIComponent(currentCity)}&category=${cat.slug}&q=${queryTerm}`} 
                 className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold text-sm border transition-colors ${currentCategory === cat.slug ? 'bg-dark-900 text-white' : 'bg-white border-gray-200 hover:border-gray-300'}`}
               >
                 {cat.name}
               </Link>
             ))}
           </div>
           
           <form action="/products" method="GET" className="relative w-full md:w-80">
              <input name="city" type="hidden" value={currentCity} />
              <input name="category" type="hidden" value={currentCategory} />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                name="q" 
                defaultValue={queryTerm} 
                placeholder="Buscar passeios..." 
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-brand-500" 
              />
           </form>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-dark-900 mb-6">Passeios Avulsos</h2>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-fade-in">
              {products.map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl">
              <Frown size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600">Nenhum passeio encontrado.</h3>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}