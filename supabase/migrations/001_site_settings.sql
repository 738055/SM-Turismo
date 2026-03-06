-- ============================================================
-- Foz Turismo SM - Tabela de Configurações do Site (Singleton)
-- Execute este script no SQL Editor do painel Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.site_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados da Empresa
  company_name         TEXT NOT NULL DEFAULT 'Foz Turismo SM',
  cnpj                 TEXT,
  address              TEXT,

  -- Contato
  whatsapp_number      TEXT,   -- Formato internacional sem '+': ex: 5545999999999
  contact_email        TEXT,
  contact_phone        TEXT,

  -- Redes Sociais
  instagram_url        TEXT,
  facebook_url         TEXT,

  -- SEO
  seo_default_title       TEXT DEFAULT 'Foz Turismo SM - Sua Viagem Começa Aqui',
  seo_default_description TEXT DEFAULT 'A melhor agência de turismo e transporte de Foz do Iguaçu.',
  seo_keywords            TEXT,  -- Palavras-chave separadas por vírgula

  -- Integrações
  google_pixel_id      TEXT,

  -- Controle
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Inserir a linha singleton com os dados iniciais
INSERT INTO public.site_settings (
  company_name,
  cnpj,
  address,
  whatsapp_number,
  contact_email,
  contact_phone,
  instagram_url,
  facebook_url,
  seo_default_title,
  seo_default_description,
  seo_keywords,
  google_pixel_id
) VALUES (
  'Foz Turismo SM',
  '00.000.000/0001-00',
  'Av. Brasil, 1234 - Centro, Foz do Iguaçu - PR, 85851-000',
  '5545999999999',
  'contato@foztourismosm.com.br',
  '(45) 3025-0000',
  'https://instagram.com/foztourismosm',
  'https://facebook.com/foztourismosm',
  'Foz Turismo SM - Sua Viagem Começa Aqui',
  'A melhor agência de turismo e transporte de Foz do Iguaçu. Passeios, transfers e roteiros personalizados.',
  'Foz Turismo SM, Turismo, Foz do Iguaçu, Cataratas, Compras Paraguai, Van, Transporte',
  NULL
);

-- RLS: apenas leitura pública, escrita somente para usuários autenticados (admins)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "site_settings_auth_update" ON public.site_settings;
CREATE POLICY "site_settings_auth_update"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
