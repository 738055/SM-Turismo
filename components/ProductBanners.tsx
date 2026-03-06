'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Banner } from '@/lib/types';

interface ProductBannersProps {
  banners: Banner[];
}

export default function ProductBanners({ banners }: ProductBannersProps) {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };
  
  const prevBanner = () => {
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  if (!banners || banners.length === 0) return null;

  return (
    <div className="relative w-full h-[250px] md:h-[400px] overflow-hidden mb-8 group">
      {banners.map((banner, index) => (
        <div 
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Link href={banner.link} className="block w-full h-full relative">
             {/* CORREÇÃO: desktop_url e mobile_url */}
             <img 
                src={banner.desktop_url} 
                alt={banner.title} 
                className="hidden md:block w-full h-full object-cover"
             />
             <img 
                src={banner.mobile_url} 
                alt={banner.title} 
                className="block md:hidden w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 md:p-16">
                <div className="text-white max-w-2xl animate-slide-up">
                   <h2 className="text-2xl md:text-4xl font-bold mb-2">{banner.title}</h2>
                   <span className="inline-block bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded uppercase tracking-wider">
                      Saiba Mais
                   </span>
                </div>
             </div>
          </Link>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm text-white transition-all opacity-0 group-hover:opacity-100">
            <ChevronLeft size={24} />
          </button>
          <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/30 hover:bg-white/50 p-2 rounded-full backdrop-blur-sm text-white transition-all opacity-0 group-hover:opacity-100">
            <ChevronRight size={24} />
          </button>
          
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                className={`w-2 h-2 rounded-full transition-all ${idx === currentBanner ? 'bg-white w-6' : 'bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}