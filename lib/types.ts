export type Language = 'pt' | 'en' | 'es';

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

// --- NOVAS INTERFACES ---
export interface FleetItem {
  id: string;
  title: string;
  description: string;
  capacity: string;
  image_url: string;
  gallery?: string[]; // Nova propriedade
  active: boolean;
}

export interface Partner {
  id: string;
  name: string;
  description: string;
  vehicle_image_url: string;
  gallery?: string[]; // Nova propriedade
  active: boolean;
}
// -----------------------

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

export interface Product {
  id: string;
  title: string;
  title_en?: string;
  title_es?: string;
  
  description: string;
  description_en?: string;
  description_es?: string;
  
  full_description: string;
  full_description_en?: string;
  full_description_es?: string;

  price: number;
  promo_price?: number;
  image_url: string;
  gallery: string[];
  rating: number;
  reviews_count: number;
  
  duration: string;
  duration_en?: string;
  duration_es?: string;

  capacity: string;
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
  languages: string[];
  itinerary: ItineraryTimeItem[];
  
  pricing_type: 'person' | 'vehicle';
  pricing_tiers?: PricingTier[];
  seasonal_pricing?: SeasonalPrice[];
  price_variants?: PriceVariant[];
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