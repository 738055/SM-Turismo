import React from 'react';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { Plane, ArrowRight, ArrowLeftRight, Frown } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AIRPORTS = [
  { code: 'IGU', name: 'Foz do Iguaçu — IGU' },
  { code: 'IGR', name: 'Puerto Iguazú — IGR' },
  { code: 'AGT', name: 'Ciudad del Este — AGT' },
];

const DESTINATION_ZONES = [
  'Todos',
  'Centro de Foz do Iguaçu',
  'Área das Cataratas — FOZ',
  'Área Itaipu — FOZ',
  'Centro Ciudad del Este — PY',
  'Centro Puerto Iguazú — AR',
];

interface SearchParams {
  origin?: string;
  destination?: string;
  trip?: 'oneway' | 'roundtrip';
}

export default async function TransfersPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const origin = searchParams?.origin ?? '';
  const destination = searchParams?.destination ?? '';
  const isRoundtrip = searchParams?.trip === 'roundtrip';

  // Busca todos os transfers — filtragem por rota ocorre via JS
  // (Supabase JSONB nested array query via JS client requer filter complexo;
  //  para escala, adicionar índice DB + função no Fase 4 avançado)
  const { data: allTransfers } = await supabase
    .from('products')
    .select('*')
    .eq('product_type', 'transfer')
    .order('price', { ascending: true });

  const allProducts: Product[] = allTransfers ?? [];

  // Filtro por origem e destino nos metadados de rota
  const filtered = allProducts.filter(p => {
    const routes = p.metadata?.transferDetails?.routes ?? [];
    if (routes.length === 0) return true; // inclui se não tem rota configurada

    return routes.some(r => {
      const matchesOrigin = !origin || r.origin.code === origin || r.origin.name.includes(origin);
      const matchesDest = !destination || destination === 'Todos' || r.destination.name === destination;
      return matchesOrigin && matchesDest;
    });
  });

  // Filtra por suporte a roundtrip, se selecionado
  const results = isRoundtrip
    ? filtered.filter(p => p.metadata?.transferDetails?.supportsRoundtrip !== false)
    : filtered;

  return (
    <div className="bg-white min-h-screen pb-20">

      {/* Header */}
      <div className="bg-dark-900 text-white pt-24 pb-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Plane size={28} className="text-brand-400" />
          </div>
          <h1 className="text-4xl font-extrabold">Transfer Aeroporto</h1>
          <p className="text-gray-300 mt-2 text-sm">
            Transfers privativos e compartilhados — IGU, IGR, AGT
          </p>
        </div>
      </div>

      {/* Painel de Busca */}
      <div className="bg-white border-b shadow-sm sticky top-20 z-40">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <form method="GET" action="/transfers" className="flex flex-col md:flex-row gap-3 items-end">

            {/* Origem */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Aeroporto de Origem</label>
              <select
                name="origin"
                defaultValue={origin}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="">Qualquer aeroporto</option>
                {AIRPORTS.map(a => (
                  <option key={a.code} value={a.code}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Destino */}
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Destino / Zona</label>
              <select
                name="destination"
                defaultValue={destination}
                className="w-full p-3 border border-gray-200 rounded-lg bg-white text-sm focus:ring-2 focus:ring-brand-500 outline-none"
              >
                {DESTINATION_ZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            {/* Tipo de Viagem */}
            <div className="shrink-0">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Tipo de Viagem</label>
              <div className="flex gap-0 border border-gray-200 rounded-lg overflow-hidden">
                <Link
                  href={`/transfers?origin=${origin}&destination=${destination}&trip=oneway`}
                  className={`px-4 py-3 text-sm font-bold flex items-center gap-1.5 transition-colors ${!isRoundtrip ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <ArrowRight size={14} /> Só Ida
                </Link>
                <Link
                  href={`/transfers?origin=${origin}&destination=${destination}&trip=roundtrip`}
                  className={`px-4 py-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-l ${isRoundtrip ? 'bg-brand-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <ArrowLeftRight size={14} /> Ida e Volta
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="shrink-0 px-6 py-3 bg-dark-900 hover:bg-black text-white font-bold text-sm rounded-lg transition-colors uppercase tracking-wide"
            >
              Buscar
            </button>
          </form>

          {/* Resumo do filtro ativo */}
          {(origin || (destination && destination !== 'Todos')) && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
              <span>Filtrando:</span>
              {origin && <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 font-bold">{origin}</span>}
              {origin && destination && destination !== 'Todos' && <ArrowRight size={10} />}
              {destination && destination !== 'Todos' && <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full border border-brand-100 font-bold">{destination}</span>}
              {isRoundtrip && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100 font-bold">Ida e Volta</span>}
              <Link href="/transfers" className="text-red-500 hover:underline ml-1">Limpar filtros</Link>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="max-w-[1200px] mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-dark-900">
            {results.length > 0
              ? `${results.length} transfer${results.length > 1 ? 's' : ''} disponível${results.length > 1 ? 'is' : ''}`
              : 'Nenhum transfer encontrado'}
          </h2>
          {isRoundtrip && (
            <span className="text-xs text-gray-500 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
              Preços com multiplicador de ida e volta aplicado
            </span>
          )}
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isRoundtrip={isRoundtrip}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Frown size={48} className="text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-600">Nenhum transfer encontrado</h3>
            <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de origem ou destino</p>
            <Link href="/transfers" className="mt-4 text-brand-600 font-bold text-sm hover:underline">
              Ver todos os transfers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
