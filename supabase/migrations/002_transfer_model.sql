-- ============================================================
-- FASE 1: Expansão do modelo de produtos para suportar Transfers
-- Execute no SQL Editor do Supabase
-- ============================================================

-- 1. Discriminador de tipo de produto
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_type TEXT NOT NULL DEFAULT 'tour'
    CONSTRAINT products_type_check CHECK (product_type IN ('tour', 'transfer', 'ticket'));

-- 2. Cancelamento gratuito como booleano real
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_free_cancellation BOOLEAN NOT NULL DEFAULT false;

-- 3. Metadados tipados por tipo de produto (JSONB para indexação eficiente)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. Tornar rating e reviews_count opcionais (null = "Novo Produto")
ALTER TABLE public.products
  ALTER COLUMN rating DROP NOT NULL,
  ALTER COLUMN rating SET DEFAULT NULL;

ALTER TABLE public.products
  ALTER COLUMN reviews_count DROP NOT NULL,
  ALTER COLUMN reviews_count SET DEFAULT NULL;

-- 5. Índice para buscas por tipo de produto
CREATE INDEX IF NOT EXISTS idx_products_product_type
  ON public.products(product_type);

-- 6. Índice GIN para buscas JSONB nos metadados de transfer
CREATE INDEX IF NOT EXISTS idx_products_metadata_gin
  ON public.products USING GIN(metadata);

-- 7. Migrar dados existentes: produtos sem tipo explícito são 'tour'
UPDATE public.products
  SET product_type = 'tour'
  WHERE product_type IS NULL OR product_type = '';

-- ============================================================
-- Estrutura esperada do metadata para Transfer:
-- {
--   "transferDetails": {
--     "supportsRoundtrip": true,
--     "roundtripMultiplier": 1.8,
--     "routes": [
--       {
--         "id": "uuid",
--         "origin": { "type": "airport", "name": "Foz do Iguaçu - IGU", "code": "IGU" },
--         "destination": { "type": "city", "name": "Centro de Foz do Iguaçu" },
--         "supportsRoundtrip": true,
--         "roundtripMultiplier": 1.8
--       }
--     ],
--     "vehicleConfigs": [
--       {
--         "id": "uuid",
--         "label": "Sedan Executivo",
--         "maxPassengers": 3,
--         "maxLargeLuggage": 2,
--         "maxHandLuggage": 3,
--         "requiresFlightNumber": true,
--         "price": 120.00
--       }
--     ]
--   }
-- }
-- ============================================================
