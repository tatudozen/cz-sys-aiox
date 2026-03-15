-- Migration: seed_copyzen_briefing
-- Story 7.1 — AC-3, AC-4, AC-5
-- Description: Seed CopyZen self-dogfooding briefing, approved proposal (Combo Cash),
--              and active project plan covering all 3 systems.

-- ────────────────────────────────────────────────────────────────
-- Briefing: CopyZen self-dogfooding
-- ────────────────────────────────────────────────────────────────
INSERT INTO briefings (id, client_id, raw_data, source, status)
VALUES (
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '{
    "negocio": "CopyZen — plataforma de copywriting com IA para empreendedores e profissionais brasileiros",
    "publico_alvo": "Consultores, coaches, infoprodutores, freelancers entre 25-45 anos que querem vender mais com as palavras certas",
    "objetivo_principal": "Demonstrar a CopyZen usando a própria plataforma (dogfooding) — gerar conteúdo, FunWheel e página de vendas para o CopyZen Pro",
    "produto_servico": "CopyZen Pro — sistema completo de copywriting com IA + templates + comunidade",
    "diferencial": "Único sistema que combina IA avançada com copywriting humano especializado para o mercado digital brasileiro",
    "canais": ["Instagram", "Email Marketing", "WhatsApp"],
    "dores_publico": [
      "Dificuldade em escrever textos que vendem",
      "Muito tempo gasto em conteúdo com pouco retorno",
      "Copy genérico que não reflete a personalidade da marca",
      "Não saber como precificar e apresentar o produto"
    ],
    "meta_leads_mensal": 200,
    "preco_produto": "R$ 997",
    "urgencia": "alta"
  }'::jsonb,
  'ghl_survey',
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- Proposal: Combo Cash — all 3 systems
-- ────────────────────────────────────────────────────────────────
INSERT INTO proposals (id, briefing_id, client_id, package, reasoning, timeline, cost_range, status)
VALUES (
  '00000000-0000-0000-0000-000000000011'::uuid,
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'combo_cash',
  'CopyZen tem produto definido, público claro e objetivo de conversão imediata. Combo Cash (Sistema 1 + FunWheel + Página de Vendas) maximiza conversão: conteúdo gera tráfego, FunWheel captura e segmenta leads, Página de Vendas converte. Ideal para dogfooding end-to-end.',
  '4 semanas',
  'Interno (dogfooding)',
  'approved'
)
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- System Surveys (3 systems)
-- ────────────────────────────────────────────────────────────────
INSERT INTO system_surveys (id, briefing_id, client_id, system, responses, status)
VALUES
  (
    '00000000-0000-0000-0000-000000000012'::uuid,
    '00000000-0000-0000-0000-000000000010'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'content',
    '{
      "frequencia_posts": "3x por semana",
      "plataformas": ["Instagram"],
      "formatos": ["carousel", "image"],
      "temas_principais": ["copywriting", "automação", "resultados de clientes"],
      "modo": "atracao_fatal"
    }'::jsonb,
    'complete'
  ),
  (
    '00000000-0000-0000-0000-000000000013'::uuid,
    '00000000-0000-0000-0000-000000000010'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'funwheel',
    '{
      "segmento": "profissionais de marketing digital",
      "oferta_gratis": "Diagnóstico gratuito de copywriting",
      "sequencia_etapas": ["apresentacao", "retencao", "transformacao"],
      "meta_vip": 3
    }'::jsonb,
    'complete'
  ),
  (
    '00000000-0000-0000-0000-000000000014'::uuid,
    '00000000-0000-0000-0000-000000000010'::uuid,
    '00000000-0000-0000-0000-000000000001'::uuid,
    'sales_page',
    '{
      "produto": "CopyZen Pro",
      "preco": "R$ 997",
      "garantia_dias": 30,
      "dominio": "venda.copyzen.com.br",
      "target_deploy": "kvm4"
    }'::jsonb,
    'complete'
  )
ON CONFLICT (id) DO NOTHING;

-- ────────────────────────────────────────────────────────────────
-- Project Plan: Combo Cash — all 3 systems active
-- ────────────────────────────────────────────────────────────────
INSERT INTO project_plans (id, briefing_id, client_id, package, systems, status)
VALUES (
  '00000000-0000-0000-0000-000000000015'::uuid,
  '00000000-0000-0000-0000-000000000010'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'combo_cash',
  '[
    {
      "system": "content",
      "config": {
        "posts_per_week": 3,
        "platforms": ["instagram"],
        "modes": ["inception", "atracao_fatal"],
        "formats": ["carousel", "image"]
      },
      "deliverables": ["12 posts/month", "copy + image prompts"]
    },
    {
      "system": "funwheel",
      "config": {
        "stages": ["apresentacao", "retencao", "transformacao"],
        "vip_threshold": 3,
        "client_slug": "copyzen",
        "deploy_target": "kvm4"
      },
      "deliverables": ["FunWheel 3-stage funnel", "GHL integration", "referral system"]
    },
    {
      "system": "sales_page",
      "config": {
        "product": "CopyZen Pro",
        "price": "R$ 997",
        "guarantee_days": 30,
        "domain": "venda.copyzen.com.br",
        "deploy_target": "kvm4"
      },
      "deliverables": ["9-section sales page", "brand-compliant design", "SEO-optimized"]
    }
  ]'::jsonb,
  'active'
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE briefings IS 'Incoming briefings. CopyZen self-dogfooding: id=00000000-0000-0000-0000-000000000010.';
COMMENT ON TABLE project_plans IS 'Execution plans. CopyZen Combo Cash plan: id=00000000-0000-0000-0000-000000000015.';
