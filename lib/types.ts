export type Language = 'pt' | 'en' | 'es';

// ============================================================
// FASE 1: Tipagem de Produtos por Tipo
// ============================================================

export type ProductType = 'tour' | 'transfer' | 'ticket';

export type LocationType = 'airport' | 'hotel' | 'landmark' | 'city';

export interface TransferEndpoint {
  type: LocationType;
  name: string;
  code?: string; // IATA para aeroportos
}

export interface TransferRoute {
  id: string;
  origin: TransferEndpoint;
  destination: TransferEndpoint;
  supportsRoundtrip: boolean;
  roundtripMultiplier: number; // ex: 1.8 = cobra 80% a mais na volta
}

export interface VehicleConfig {
  id: string;
  label: string;           // "Sedan Executivo", "Van Luxo"
  maxPassengers: number;
  maxLargeLuggage: number;
  maxHandLuggage: number;
  requiresFlightNumber: boolean;
  price: number;
}

export interface TransferDetails {
  routes: TransferRoute[];
  vehicleConfigs: VehicleConfig[];
  supportsRoundtrip: boolean;
  roundtripMultiplier: number;
}

export interface TourDetails {
  meetingPoint?: string;
  whatToBring?: string[];
}

export interface ProductMetadata {
  is_free_cancellation?: boolean;
  transferDetails?: TransferDetails;
  tourDetails?: TourDetails;
}

// ============================================================
// Interfaces existentes (mantidas)
// ============================================================

export interface PriceVariant {
  label: string;
  price: number;
  quantity?: number;
}

export interface CartItemSelection {
  label: string;
  price: number;
  quantity: number;
}

export interface FleetItem {
  id: string;
  title: string;
  description: string;
  capacity: string;
  image_url: string;
  gallery?: string[];
  active: boolean;
}

export interface Partner {
  id: string;
  name: string;
  description: string;
  vehicle_image_url: string;
  gallery?: string[];
  active: boolean;
}

export interface ItineraryItem {
  id?: string;
  itinerary_id?: string;
  product_id: string;
  day_number: number;
  period: string;
  product?: Product;
}

export interface Itinerary {
  id: string;
  title: string;
  title_en?: string;
  title_es?: string;
  description: string;
  description_en?: string;
  description_es?: string;
  image_url: string;
  active: boolean;
  items?: ItineraryItem[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
}

export interface ItineraryTimeItem {
  time?: string;
  title: string;
  title_en?: string;
  title_es?: string;
  description: string;
  description_en?: string;
  description_es?: string;
}

export interface Banner {
  id: string;
  desktop_url: string;
  mobile_url: string;
  title: string;
  title_en?: string;
  title_es?: string;
  link: string;
  active?: boolean;
}

export interface PricingTier {
  label?: string; // ex: "Sedan", "Van" para veículos
  min_pax: number;
  max_pax: number;
  price: number;
}

export interface SeasonalPrice {
  start_date: string;
  end_date: string;
  price?: number;
  tiers?: PricingTier[];
}

export interface Category {
  id: string;
  name: string;
  name_en?: string;
  name_es?: string;
  slug: string;
  icon?: string;
  image_url?: string;
  active: boolean;
}

// ============================================================
// FASE 1: Product com novos campos e tipagem robusta
// ============================================================

export interface Product {
  id: string;

  // Discriminador de tipo — controla o wizard e a renderização do card
  product_type: ProductType;

  title: string;
  title_en?: string;
  title_es?: string;

  description: string;
  description_en?: string;
  description_es?: string;

  full_description: string;
  full_description_en?: string;
  full_description_es?: string;

  // "A partir de" — deve refletir o menor tier de preço disponível
  price: number;
  promo_price?: number;

  image_url: string;
  gallery: string[];

  // FASE 1: Nullable — null/undefined = "Novo Produto" (sem estrelas)
  rating?: number | null;
  reviews_count?: number | null;

  duration?: string;
  duration_en?: string;
  duration_es?: string;

  capacity?: string;
  location: string;
  city: string;

  amenities: string[];
  amenities_en?: string[];
  amenities_es?: string[];

  excludes?: string[];
  excludes_en?: string[];
  excludes_es?: string[];

  category: string;
  tags: string[];
  is_featured?: boolean;

  // FASE 1: Substituir validação string por booleano real
  is_free_cancellation: boolean;

  languages: string[];
  itinerary: ItineraryTimeItem[];

  pricing_type: 'person' | 'vehicle';
  pricing_tiers?: PricingTier[];
  seasonal_pricing?: SeasonalPrice[];
  price_variants?: PriceVariant[];

  // FASE 1: Metadados tipados por tipo de produto
  metadata?: ProductMetadata;
}

export interface CitySuggestion {
  id: string;
  city: string;
  title: string;
  title_en?: string;
  title_es?: string;
  description: string;
  description_en?: string;
  description_es?: string;
  image_url: string;
}

export interface CartItem extends Product {
  selections: CartItemSelection[];
  totalItemPrice: number;
  quantity: number;
  selectedDate?: string;
  sourceItinerary?: string;
  isRoundtrip?: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

export interface SiteSettings {
  id: string;
  company_name: string;
  cnpj: string | null;
  address: string | null;
  whatsapp_number: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  seo_default_title: string | null;
  seo_default_description: string | null;
  seo_keywords: string | null;
  google_pixel_id: string | null;
  created_at: string;
  updated_at: string;
}
