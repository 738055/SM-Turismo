'use client';

import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title?: string;
}

export default function ImageGalleryModal({ isOpen, onClose, images, title }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen || images.length === 0) return null;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in" onClick={onClose}>
      
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
      >
        <X size={32} />
      </button>

      {title && (
        <div className="absolute top-6 left-6 text-white font-bold text-xl drop-shadow-md z-40">
          {title} <span className="text-sm font-normal text-gray-400 ml-2">({currentIndex + 1}/{images.length})</span>
        </div>
      )}

      <div className="relative w-full h-full flex items-center justify-center p-4 md:p-10">
        <img 
          src={images[currentIndex]} 
          alt={`Foto ${currentIndex + 1}`} 
          className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
          onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar na imagem
        />

        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage} 
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm transition-all"
            >
              <ChevronLeft size={32} />
            </button>
            <button 
              onClick={nextImage} 
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white backdrop-blur-sm transition-all"
            >
              <ChevronRight size={32} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails na parte inferior */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] p-2 custom-scrollbar" onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentIndex(idx)}
              className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-brand-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
            >
              <img src={img} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
}