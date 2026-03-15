-- Migration: update_copyzen_brand
-- Story 7.1 — AC-1
-- Description: Update CopyZen brand config with final identity:
--   - tone_of_voice: casual (conversacional/profissional)
--   - keywords: copywriting-specific per AC-1
--   - slogan updated
--   - custom_guidelines for casual Brazilian tone

UPDATE brand_configs
SET
  tone_of_voice    = 'casual',
  slogan           = 'Copy que conecta. Resultados que importam.',
  keywords         = ARRAY[
    'copywriting',
    'marketing digital',
    'automação',
    'funil de vendas',
    'leads',
    'conversão'
  ],
  custom_guidelines = 'Tom conversacional e próximo. Use "você" diretamente. Evite jargão técnico. Foque em benefícios concretos e resultados mensuráveis. Linguagem de negócios descomplicada para empreendedores brasileiros.'
WHERE client_id = '00000000-0000-0000-0000-000000000001'::uuid;

COMMENT ON TABLE brand_configs IS 'Brand configurations per client. CopyZen brand: client_id=00000000-0000-0000-0000-000000000001, tone=casual.';
