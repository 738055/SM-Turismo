import { Product } from './types';

/**
 * FASE 1 — Calcula o menor preço disponível para exibição no card ("A partir de").
 * Prioridade: vehicleConfigs do transfer > pricing_tiers > promo_price > price.
 */
export function calculateBasePrice(product: Product): number {
  const vehicleConfigs = product.metadata?.transferDetails?.vehicleConfigs;
  if (vehicleConfigs && vehicleConfigs.length > 0) {
    return Math.min(...vehicleConfigs.map(v => v.price));
  }

  const tiers = product.pricing_tiers;
  if (tiers && tiers.length > 0) {
    return Math.min(...tiers.map(t => t.price));
  }

  return product.promo_price ?? product.price;
}

/**
 * Formata um valor numérico como moeda BRL.
 */
export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Converte string de centavos (campo input mascarado) para float.
 */
export function parseCurrencyInput(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return 0;
  return Number(digits) / 100;
}
