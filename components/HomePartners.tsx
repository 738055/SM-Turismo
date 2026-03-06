'use client';

import React, { useState } from 'react';
import { Partner } from '@/lib/types';
import { Camera } from 'lucide-react';
import ImageGalleryModal from './ImageGalleryModal';

export default function HomePartners({ partners }: { partners: Partner[] }) {
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  if (partners.length === 0) return null;

  return (
    <section className="py-10 bg-white border-t border-gray-100">
       <div className="max-w-[1200px] mx-auto px-4">
          <div className="mb-8 text-center">
             <span className="text-brand-600 font-bold uppercase tracking-wider text-[10px]">Qualidade Garantida</span>
             <h2 className="text-2xl font-bold text-dark-900">Nossos Parceiros</h2>
          </div>
          
          {/* Grid de 5 colunas para cards pequenos e compactos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
             {partners.map(partner => (
                <div 
                  key={partner.id} 
                  className="group relative rounded-lg overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all h-40 cursor-pointer"
                  onClick={() => setSelectedPartner(partner)}
                >
                   <img src={partner.vehicle_image_url} alt={partner.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                   
                   {/* Overlay gradiente mais forte no hover */}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                      <h3 className="text-white font-bold text-sm leading-tight mb-0.5">{partner.name}</h3>
                      {partner.description && (
                        <p className="text-gray-300 text-[10px] line-clamp-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                           {partner.description}
                        </p>
                      )}
                      
                      <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                         <Camera size={12} />
                      </div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {selectedPartner && (
         <ImageGalleryModal 
           isOpen={!!selectedPartner} 
           onClose={() => setSelectedPartner(null)} 
           images={[selectedPartner.vehicle_image_url, ...(selectedPartner.gallery || [])]} 
           title={selectedPartner.name}
         />
       )}
    </section>
  );
}