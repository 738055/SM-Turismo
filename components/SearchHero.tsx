'use client';

import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SearchHero() {
  const router = useRouter();

  return (
    <section className="relative h-screen flex items-center justify-center bg-dark-900">
        <div className="absolute inset-0 overflow-hidden">
          <video autoPlay loop muted playsInline poster="https://narpgktjriwmtubkijdw.supabase.co/storage/v1/object/public/easyvan-media/por-do-sol-nas-cataratas.jpeg" className="w-full h-full object-cover opacity-50">
            <source src="https://kperhxhlwbgjvfatlcpe.supabase.co/storage/v1/object/public/easyvan-media/cataratas-aera.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent opacity-90"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1200px] px-4 pt-16">
          <div className="text-center mb-10 text-white animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-md">
              Conheça Foz do Iguaçu com a <br/> <span className="text-brand-400">Foz Turismo SM</span>
            </h1>
            <p className="text-lg md:text-xl font-medium text-gray-200">
              Passeios, transportes e experiências inesquecíveis na Tríplice Fronteira.
            </p>
          </div>

          <div className="bg-white rounded-none p-4 md:p-6 max-w-4xl mx-auto transform translate-y-12 md:translate-y-20">
             <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">O que você procura?</label>
                   <div className="relative bg-gray-50 border border-gray-200 rounded-none p-3 flex items-center hover:border-brand-300 transition-colors">
                      <Search className="text-brand-500 mr-3" size={20} />
                      <input 
                        type="text" 
                        placeholder="Ex: Cataratas, Itaipu..." 
                        className="bg-transparent w-full focus:outline-none text-gray-700 font-medium placeholder-gray-400"
                        onKeyDown={(e) => e.key === 'Enter' && router.push('/products')}
                      />
                   </div>
                </div>
                <div className="md:col-span-4">
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Quando?</label>
                   <div className="relative bg-gray-50 border border-gray-200 rounded-none p-3 flex items-center hover:border-brand-300 transition-colors">
                      <Calendar className="text-brand-500 mr-3" size={20} />
                      <input type="text" placeholder="Escolha uma data" className="bg-transparent w-full focus:outline-none text-gray-700 font-medium" />
                   </div>
                </div>
                <div className="md:col-span-3">
                   <button onClick={() => router.push('/products')} className="w-full bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold py-3.5 rounded-none transition-all uppercase tracking-wide text-sm">
                     Buscar Agora
                   </button>
                </div>
             </div>
          </div>
        </div>
    </section>
  );
}