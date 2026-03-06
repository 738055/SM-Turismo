'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { Star, MapPin } from 'lucide-react';
import Link from 'next/link';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const installmentValue = (product.price / 10).toFixed(2);

  return (
    <div className="group flex flex-col h-full bg-white rounded-sm overflow-hidden transition-all duration-300">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <img 
          src={product.image_url} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
        />
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
            {product.category}
          </span>
        </div>
        {product.is_featured && (
           <div className="absolute bottom-0 left-0 w-full bg-brand-600 text-white text-xs font-bold py-1 px-3 text-center">
             DESTAQUE
           </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-center mb-2">
           <div className="flex items-center text-gray-400 text-xs">
              <MapPin size={12} className="mr-1" />
              {product.location}
           </div>
           {product.rating > 0 && (
             <div className="flex items-center text-yellow-400 text-xs font-bold">
               <Star size={12} className="fill-current mr-1" />
               {product.rating}
             </div>
           )}
        </div>

        <h3 className="text-xl font-extrabold text-dark-900 leading-snug mb-2 line-clamp-2">
          <Link href={`/product/${product.id}`} className="hover:text-brand-600 transition-colors">
            {product.title}
          </Link>
        </h3>
        
        <p className="text-xs text-gray-500 line-clamp-2 mb-4">
           {product.description}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-50">
           <p className="text-xs text-gray-400">A partir de</p>
           <div className="flex items-end gap-1 mb-1">
              <span className="text-sm text-gray-500 font-medium">10x de</span>
              <span className="text-xl font-extrabold text-brand-600">R$ {installmentValue}</span>
           </div>
           <p className="text-[10px] text-gray-400 mb-3">
             ou R$ {product.price.toFixed(2)} à vista
           </p>
           
           <Link 
            href={`/product/${product.id}`}
            className="block w-full text-center bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold text-sm py-3 rounded-none uppercase tracking-wide transition-colors mt-4"
           >
            Comprar Agora
           </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;