import React from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import SearchHero from '@/components/SearchHero';
import HomeFleet from '@/components/HomeFleet';
import HomePartners from '@/components/HomePartners';
import Link from 'next/link';
import { 
  ChevronRight, MapPin, Bus, Ticket, Utensils, Hotel, Camera, 
  Briefcase, Star, ShoppingBag, Plane, LucideIcon 
} from 'lucide-react';

export const revalidate = 60;

const ICON_COMPONENTS: Record<string, LucideIcon> = {
  'Ticket': Ticket, 'Bus': Bus, 'Utensils': Utensils, 'ShoppingBag': ShoppingBag,
  'Camera': Camera, 'Hotel': Hotel, 'Briefcase': Briefcase, 'Plane': Plane, 'Star': Star
};

const ICON_COLORS: Record<string, string> = {
  'Ticket': 'bg-purple-100 text-purple-600', 'Bus': 'bg-green-100 text-green-600',
  'Utensils': 'bg-orange-100 text-orange-600', 'ShoppingBag': 'bg-yellow-100 text-yellow-600',
  'Camera': 'bg-blue-100 text-blue-600', 'Hotel': 'bg-teal-100 text-teal-600',
  'Briefcase': 'bg-gray-100 text-gray-600', 'Plane': 'bg-sky-100 text-sky-600', 'Star': 'bg-brand-50 text-brand-600'
};

export default async function Home() {
  const [productsRes, categoriesRes, fleetRes, partnersRes] = await Promise.all([
    supabase.from('products').select('*'),
    supabase.from('categories').select('*').eq('active', true).order('name'),
    supabase.from('fleet').select('*').eq('active', true).order('created_at', { ascending: false }),
    supabase.from('partners').select('*').eq('active', true).order('created_at', { ascending: false })
  ]);
  
  const products = productsRes.data || [];
  const categories = categoriesRes.data || [];
  const fleet = fleetRes.data || [];
  const partners = partnersRes.data || [];

  const featuredProducts = products.filter(p => p.is_featured).slice(0, 4);
  const offerProducts = products.filter(p => {
    const catSlug = p.category ? p.category.toLowerCase() : '';
    return catSlug.includes('compra') || catSlug.includes('gastro');
  }).slice(0, 4);

  return (
    <div className="bg-white min-h-screen font-sans pb-20">
      
      <SearchHero />

      {/* Categorias */}
      <section className="pt-24 md:pt-32 pb-12 bg-gray-50 border-b border-gray-200">
         <div className="max-w-[1200px] mx-auto px-4">
            <div className="text-center mb-8">
               <span className="text-brand-500 font-bold uppercase text-xs tracking-widest">Explore por Categoria</span>
               <h2 className="text-2xl font-bold text-dark-900 mt-2">O que você quer viver hoje?</h2>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-6 text-center">
               {categories.map((cat) => {
                  const IconComponent = ICON_COMPONENTS[cat.icon || 'Star'] || Star;
                  const colorClass = ICON_COLORS[cat.icon || 'Star'] || 'bg-gray-100 text-gray-600';
                  return (
                    <Link href={`/products?category=${cat.slug}`} key={cat.id} className="group flex flex-col items-center gap-3 cursor-pointer">
                       <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300 ${colorClass} bg-white border border-gray-100 overflow-hidden`}>
                          <IconComponent size={28} strokeWidth={1.5} />
                       </div>
                       <span className="text-sm font-bold text-gray-600 group-hover:text-brand-600 transition-colors">{cat.name}</span>
                    </Link>
                  );
               })}
            </div>
         </div>
      </section>

      {/* Destaques */}
      <section className="py-16 bg-white">
         <div className="max-w-[1200px] mx-auto px-4">
            <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-4">
               <div>
                  <h2 className="text-3xl font-bold text-dark-900">Favoritos Foz Turismo SM</h2>
                  <p className="text-gray-500 mt-1">Os passeios mais amados pelos nossos clientes.</p>
               </div>
               <Link href="/products" className="hidden md:flex items-center text-brand-600 font-bold hover:underline">
                  Ver todas as atrações <ChevronRight size={16} />
               </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.length > 0 ? featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              )) : <p className="col-span-4 text-center text-gray-400">Nenhum destaque encontrado.</p>}
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-10 bg-brand-600 text-white relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
         <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shadow-inner"><MapPin size={28} /></div>
               <div>
                  <h3 className="font-bold text-2xl">Combo Foz Turismo SM</h3>
                  <p className="text-brand-100 text-sm">O melhor de Foz com o melhor preço. Cataratas + Itaipu + Transfer.</p>
               </div>
            </div>
            <Link href="/products" className="bg-white text-brand-700 px-8 py-4 rounded-lg font-bold hover:bg-gray-100 transition-colors shadow-lg uppercase tracking-wide">
               Quero meu Combo
            </Link>
         </div>
      </section>

      {/* COMPONENTES CLIENTE: FROTA E PARCEIROS */}
      <HomeFleet fleet={fleet} />
      <HomePartners partners={partners} />

      {/* Ofertas */}
      {offerProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
           <div className="max-w-[1200px] mx-auto px-4">
              <div className="mb-10 text-center">
                 <h2 className="text-3xl font-bold text-dark-900">Sabores e Compras</h2>
                 <p className="text-gray-500 mt-2 max-w-2xl mx-auto">Dicas exclusivas da Foz Turismo SM para você economizar e comer bem.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {offerProducts.map(product => <ProductCard key={product.id} product={product} />)}
              </div>
           </div>
        </section>
      )}
      
      <section className="py-16 bg-brand-50 border-t border-brand-100">
         <div className="max-w-[1200px] mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-dark-900 mb-4">Vem com a Foz Turismo SM!</h2>
            <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
               Somos apaixonados por Foz do Iguaçu e queremos que você também seja. A <strong>Foz Turismo SM</strong> oferece um serviço de receptivo completo, com vans confortáveis, guias experientes e aquele atendimento que faz você se sentir em casa. Reserve tudo online e pague em até 10x.
            </p>
         </div>
      </section>
    </div>
  );
}