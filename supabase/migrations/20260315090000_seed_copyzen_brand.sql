-- ============================================================================
-- Migration: 20260315090000_seed_copyzen_brand
-- Description: Seed data — CopyZen internal brand config as example/template.
--              Used for testing and as reference for agent development.
-- Author: Dex (Dev Agent)
-- Date: 2026-03-15
-- Story: 3.2 — Brand Config System (AC-5)
-- ============================================================================

-- Insert CopyZen internal client record
INSERT INTO clients (id, name, email, business_type, status)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'CopyZen',
    'system@copyzen.com.br',
    'saas',
    'active'
)
ON CONFLICT (id) DO NOTHING;

-- Insert CopyZen brand config
INSERT INTO brand_configs (
    id,
    client_id,
    primary_color,
    secondary_color,
    accent_color,
    background_color,
    text_color,
    heading_font,
    body_font,
    tone_of_voice,
    custom_guidelines,
    logo_url,
    slogan,
    keywords,
    reference_images
)
VALUES (
    '00000000-0000-0000-0000-000000000002'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    '#0F172A',      -- slate-900
    '#6366F1',      -- indigo-500
    '#F59E0B',      -- amber-500
    '#F8FAFC',      -- slate-50
    '#1E293B',      -- slate-800
    'Inter',
    'Inter',
    'technical',
    'Mantenha linguagem voltada para donos de negócio e empreendedores. Foque em resultados práticos e métricas. Evite jargões de marketing genérico.',
    NULL,
    'Marketing inteligente com IA',
    ARRAY['marketing', 'inteligência artificial', 'automação', 'copy', 'vendas', 'leads', 'conteúdo', 'estratégia'],
    ARRAY[]::text[]
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE brand_configs IS 'Brand configurations per client. Seed includes CopyZen internal brand (client_id=00000000-0000-0000-0000-000000000001).';
