import React from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import ProductBanners from '@/components/ProductBanners';
import ItineraryModal from '@/components/ItineraryModal';
import Link from 'next/link';
import { Search, Frown, Compass, Map, X } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CITIES = ['Todos', 'Foz do Iguaçu - BR', 'Ciudad del Este - PY', 'Puerto Iguazu - AR'];

const CITY_CONFIG: Record<string, { flag: string; title: string }> = {
  'Foz do Iguaçu - BR': { flag: '🇧🇷', title: 'O que fazer em Foz' },
  'Ciudad del Este - PY': { flag: '🇵🇾', title: 'Compras no Paraguai' },
  'Puerto Iguazu - AR': { flag: '🇦🇷', title: 'Argentina' },
};

export default async function ProductList({
  searchParams,
}: {
  // Next.js 15+: searchParams é Promise
  searchParams?: Promise<{ q?: string; category?: string; city?: string }>;
}) {
  const params = await searchParams;
  const queryTerm = params?.q ?? '';
  const currentCategory = params?.category ?? 'Todos';
  const currentCity = params?.city ?? 'Todos';

  // ── Query Supabase ───────────────────────────────────────────
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
      .eq('active', true),
  ]);

  const products = productsRes.data ?? [];
  const categories = [{ name: 'Todas Categorias', slug: 'Todos' }, ...(categoriesRes.data ?? [])];
  const banners = bannersRes.data ?? [];
  const itineraries = itinerariesRes.data ?? [];

  const hasActiveFilters = queryTerm || currentCategory !== 'Todos' || currentCity !== 'Todos';

  // Helpers para gerar URLs preservando os filtros existentes
  const cityUrl = (city: string) => {
    const p = new URLSearchParams();
    p.set('city', city);
    if (currentCategory !== 'Todos') p.set('category', currentCategory);
    if (queryTerm) p.set('q', queryTerm);
    return `/products?${p.toString()}`;
  };

  const categoryUrl = (slug: string) => {
    const p = new URLSearchParams();
    if (currentCity !== 'Todos') p.set('city', currentCity);
    p.set('category', slug);
    if (queryTerm) p.set('q', queryTerm);
    return `/products?${p.toString()}`;
  };

  return (
    <div className="bg-white min-h-screen pb-20">

      {/* Banner / Header */}
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

      {/* ── Seletor de Cidades (sticky) ─────────────────────────── */}
      <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 overflow-x-auto py-3 custom-scrollbar">
          <div className="flex items-center gap-3">
            {CITIES.map((city) => {
              const isActive = currentCity === city;
              const label = city === 'Todos' ? 'Visão Geral' : city.split('-')[0].trim();
              return (
                <Link
                  key={city}
                  href={cityUrl(city)}
                  className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {city === 'Todos' && <Compass size={15} />}
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">

        {/* Roteiros (apenas em "Todos") */}
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

        {/* ── Filtros de Categoria + Busca ──────────────────────── */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 bg-gray-50/70 p-4 rounded-xl border border-gray-100">

          {/* Pills de categoria */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => {
              const isActive = currentCategory === cat.slug;
              return (
                <Link
                  key={cat.slug}
                  href={categoryUrl(cat.slug)}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg font-bold text-sm border transition-colors ${
                    isActive
                      ? 'bg-dark-900 text-white border-dark-900'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>

          {/* Campo de busca — preserva cidade e categoria no submit */}
          <form action="/products" method="GET" className="relative w-full md:w-80 shrink-0">
            {currentCity !== 'Todos' && (
              <input type="hidden" name="city" value={currentCity} />
            )}
            {currentCategory !== 'Todos' && (
              <input type="hidden" name="category" value={currentCategory} />
            )}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={queryTerm}
              placeholder="Buscar passeios..."
              className="w-full pl-9 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
            />
            {queryTerm && (
              <Link
                href={categoryUrl(currentCategory)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Limpar busca"
              >
                <X size={15} />
              </Link>
            )}
          </form>
        </div>

        {/* Resumo de filtros ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 flex-wrap">
            <span>Mostrando:</span>
            {currentCity !== 'Todos' && (
              <span className="bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 rounded-full font-bold">
                {currentCity.split('-')[0].trim()}
              </span>
            )}
            {currentCategory !== 'Todos' && (
              <span className="bg-dark-900 text-white px-2 py-0.5 rounded-full font-bold">
                {categories.find(c => c.slug === currentCategory)?.name ?? currentCategory}
              </span>
            )}
            {queryTerm && (
              <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-bold">
                "{queryTerm}"
              </span>
            )}
            <Link href="/products" className="text-red-500 hover:underline ml-1">
              Limpar tudo
            </Link>
          </div>
        )}

        {/* ── Grid de Produtos ─────────────────────────────────── */}
        <section>
          <h2 className="text-xl font-bold text-dark-900 mb-5">
            {products.length > 0
              ? `${products.length} resultado${products.length !== 1 ? 's' : ''}`
              : 'Nenhum resultado'}
          </h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Frown size={48} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-600">Nenhum passeio encontrado.</h3>
              <p className="text-sm text-gray-400 mt-1">Tente outros filtros ou termos de busca.</p>
              <Link href="/products" className="mt-4 text-brand-600 font-bold text-sm hover:underline">
                Ver todos os passeios
              </Link>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
