'use client';

import React, { useState } from 'react';
import { FleetItem } from '@/lib/types';
import { Truck, Users, Camera } from 'lucide-react';
import ImageGalleryModal from './ImageGalleryModal';

export default function HomeFleet({ fleet }: { fleet: FleetItem[] }) {
  const [selectedItem, setSelectedItem] = useState<FleetItem | null>(null);

  if (fleet.length === 0) return null;

  return (
    <section className="py-20 bg-dark-900 text-white relative overflow-hidden">
       {/* Background sutil */}
       <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-dark-900 to-dark-800 opacity-50 z-0"></div>
       
       <div className="max-w-[1200px] mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
             <h2 className="text-4xl md:text-5xl font-extrabold mb-2 flex items-center justify-center gap-3">
                <Truck size={36} className="text-brand-500" /> Nossa Frota
             </h2>
             <p className="text-gray-400 text-lg max-w-xl mx-auto">Veículos modernos e higienizados para o seu conforto.</p>
          </div>
          
          {/* Grid mais denso (4 colunas em LG) para cards menores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
             {fleet.map(item => (
                <div 
                  key={item.id} 
                  className="bg-dark-800 rounded-none overflow-hidden border border-gray-700 group hover:border-brand-500 transition-colors cursor-pointer flex flex-col"
                  onClick={() => setSelectedItem(item)}
                >
                   <div className="h-40 overflow-hidden relative shrink-0">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-white/30">
                            <Camera size={12}/> Ver Fotos
                         </span>
                      </div>
                   </div>
                   <div className="p-4 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="text-base font-bold text-white line-clamp-1">{item.title}</h3>
                         <span className="text-[10px] font-bold text-brand-400 bg-brand-900/50 px-2 py-0.5 rounded border border-brand-800 shrink-0 ml-2">
                            {item.capacity}
                         </span>
                      </div>
                      <p className="text-gray-400 text-xs leading-snug line-clamp-2">{item.description}</p>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {selectedItem && (
         <ImageGalleryModal 
           isOpen={!!selectedItem} 
           onClose={() => setSelectedItem(null)} 
           images={[selectedItem.image_url, ...(selectedItem.gallery || [])]} 
           title={selectedItem.title}
         />
       )}
    </section>
  );
}