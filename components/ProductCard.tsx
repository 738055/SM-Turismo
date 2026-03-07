'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { calculateBasePrice } from '@/lib/utils';
import { Star, MapPin, Clock, Users, Briefcase, ArrowRight, Globe, BadgeCheck } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  /** Para transfers: se o cliente selecionou ida e volta */
  isRoundtrip?: boolean;
}

// ============================================================
// Sub-componente: Badge de Rating
// ============================================================
function RatingBadge({ rating, reviewsCount }: { rating?: number | null; reviewsCount?: number | null }) {
  if (!rating) {
    return (
      <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
        Novo
      </span>
    );
  }
  return (
    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold">
      <Star size={12} className="fill-current" />
      <span>{rating.toFixed(1)}</span>
      {reviewsCount ? <span className="text-gray-400 font-normal">({reviewsCount})</span> : null}
    </div>
  );
}

// ============================================================
// Sub-componente: Footer do Card de Tour
// ============================================================
function TourCardFooter({ product }: { product: Product }) {
  const basePrice = calculateBasePrice(product);

  return (
    <>
      {/* Duração e idiomas */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {product.duration && (
          <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            <Clock size={10} /> {product.duration}
          </span>
        )}
        {(product.languages ?? []).slice(0, 2).map(lang => (
          <span key={lang} className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
            <Globe size={10} /> {lang}
          </span>
        ))}
      </div>

      {/* Inclusões (primeiras 2) */}
      {(product.amenities ?? []).length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {product.amenities.slice(0, 2).map((a, i) => (
            <span key={i} className="flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full">
              <BadgeCheck size={9} /> {a}
            </span>
          ))}
          {product.amenities.length > 2 && (
            <span className="text-[10px] text-gray-400">+{product.amenities.length - 2} mais</span>
          )}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">A partir de</p>
        <p className="text-2xl font-extrabold text-dark-900">
          R$ {basePrice.toFixed(2).replace('.', ',')}
        </p>
        <p className="text-xs text-gray-500">
          ou 10x de R$ {(basePrice / 10).toFixed(2).replace('.', ',')} sem juros
        </p>
      </div>
    </>
  );
}

// ============================================================
// Sub-componente: Footer do Card de Transfer
// ============================================================
function TransferCardFooter({ product, isRoundtrip }: { product: Product; isRoundtrip?: boolean }) {
  const details = product.metadata?.transferDetails;
  const primaryRoute = details?.routes?.[0];
  const vehicles = details?.vehicleConfigs ?? [];

  const basePrice = calculateBasePrice(product);
  const displayPrice = isRoundtrip && primaryRoute?.supportsRoundtrip
    ? basePrice * (primaryRoute.roundtripMultiplier ?? 1.8)
    : basePrice;

  return (
    <>
      {/* Rota */}
      {primaryRoute && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 mb-3 bg-blue-50 rounded-lg px-3 py-2">
          <span className="text-blue-700">{primaryRoute.origin.code ?? primaryRoute.origin.name}</span>
          <ArrowRight size={12} className="text-blue-400 shrink-0" />
          <span className="text-blue-700 truncate">{primaryRoute.destination.name}</span>
          {isRoundtrip && primaryRoute.supportsRoundtrip && (
            <ArrowRight size={12} className="text-blue-400 shrink-0 rotate-180" />
          )}
        </div>
      )}

      {/* Capacidade dos veículos */}
      {vehicles.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {vehicles.slice(0, 2).map(v => (
            <span key={v.id} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              {v.label}
              <span className="text-gray-400">·</span>
              <Users size={9} /> {v.maxPassengers}
              <span className="text-gray-400">·</span>
              <Briefcase size={9} /> {v.maxLargeLuggage}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-3 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
          {isRoundtrip ? 'Ida e Volta — a partir de' : 'Ida — a partir de'}
        </p>
        <p className="text-2xl font-extrabold text-dark-900">
          R$ {displayPrice.toFixed(2).replace('.', ',')}
        </p>
        {isRoundtrip && (
          <p className="text-xs text-brand-600 font-bold">Inclui retorno</p>
        )}
      </div>
    </>
  );
}

// ============================================================
// Componente principal
// ============================================================
const ProductCard: React.FC<ProductCardProps> = ({ product, isRoundtrip }) => {
  const isTransfer = product.product_type === 'transfer';

  return (
    <div className="group flex flex-col h-full bg-white rounded-sm overflow-hidden transition-all duration-300">

      {/* Imagem — next/image para otimização de LCP */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={product.image_url}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          priority={product.is_featured}
        />

        {/* Badge de categoria */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Badge de cancelamento gratuito */}
        {product.is_free_cancellation && (
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-green-500 text-white text-[9px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
              Canc. Grátis
            </span>
          </div>
        )}

        {/* Banner de destaque */}
        {product.is_featured && (
          <div className="absolute bottom-0 left-0 w-full bg-brand-600 text-white text-xs font-bold py-1 px-3 text-center">
            DESTAQUE
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-4 flex flex-col flex-grow">

        {/* Localização + Rating */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center text-gray-400 text-xs">
            <MapPin size={12} className="mr-1 shrink-0" />
            <span className="truncate">{product.location}</span>
          </div>
          <RatingBadge rating={product.rating} reviewsCount={product.reviews_count} />
        </div>

        {/* Título */}
        <h3 className="text-base font-extrabold text-dark-900 leading-snug mb-1.5 line-clamp-2">
          <Link href={`/product/${product.id}`} className="hover:text-brand-600 transition-colors">
            {product.title}
          </Link>
        </h3>

        {/* Descrição curta */}
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Footer diferenciado por tipo */}
        {isTransfer ? (
          <TransferCardFooter product={product} isRoundtrip={isRoundtrip} />
        ) : (
          <TourCardFooter product={product} />
        )}

        {/* CTA */}
        <Link
          href={`/product/${product.id}`}
          className="block w-full text-center bg-brand-500 hover:bg-brand-600 text-dark-900 font-bold text-sm py-3 rounded-none uppercase tracking-wide transition-colors mt-3"
        >
          {isTransfer ? 'Ver Veículos' : 'Ver Detalhes'}
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
