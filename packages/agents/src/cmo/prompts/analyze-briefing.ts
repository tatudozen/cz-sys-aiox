/**
 * CMO Agent — Analyze Briefing Prompt
 *
 * Story 2.3 — AC-2: Formats briefing data for Claude API call
 * Returns a structured package recommendation for the client.
 */

export interface BriefingData {
  nome_negocio: string;
  segmento: string;
  publico_alvo: string;
  objetivo_principal: string;
  orcamento_estimado?: string;
  canal_comunicacao: 'WhatsApp' | 'Email';
  urls_redes_sociais?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    site?: string;
  };
}

export interface CMOAnalysisResult {
  recommended_package: 'ia' | 'art' | 'e' | 'combo_leads' | 'combo_cash';
  reasoning: string;
  estimated_timeline: string;
  estimated_cost_range: string;
  priority_systems: ('content' | 'funwheel' | 'sales_page')[];
  confidence: number;
  needs_more_info: boolean;
  missing_info?: string[];
}

const PACKAGES_DESCRIPTION = `
PACOTES DISPONÍVEIS:
- **IA** (Inteligência Artificial básica): Geração de conteúdo AI para redes sociais. Ideal para negócios iniciando marketing digital com orçamento enxuto.
- **ART** (Atração, Retenção, Transformação): Sistema FunWheel completo com conteúdo + página viral de leads. Ideal para negócios que querem gerar leads de forma automatizada.
- **E** (Enterprise): Conteúdo + FunWheel + páginas de vendas personalizadas. Para negócios estabelecidos que querem automatizar todo o funil.
- **Combo Leads**: IA + ART combinados. Máximo volume de leads com IA acelerada.
- **Combo Cash**: ART + E combinados. Lead generation + conversão otimizada.
`.trim();

const SYSTEMS_DESCRIPTION = `
SISTEMAS DO PROJETO:
- **content**: Geração de posts (carrossel/imagem) para Instagram/Facebook
- **funwheel**: Páginas A-R-T (Apresentação → Retenção → Transformação) com sistema de indicações e acesso VIP
- **sales_page**: Páginas de vendas personalizadas com Astro + Tailwind
`.trim();

export function buildAnalyzeBriefingSystemPrompt(): string {
  return `Você é o CMO (Chief Marketing Officer) da CopyZen, uma plataforma de marketing inteligente.

Sua função é analisar briefings de clientes e recomendar o melhor pacote de serviços para atingir os objetivos deles.

${PACKAGES_DESCRIPTION}

${SYSTEMS_DESCRIPTION}

CRITÉRIOS DE ANÁLISE:
1. **Orçamento**: Pacotes mais simples para orçamentos menores (IA < ART < E < Combos)
2. **Objetivo**: Lead generation → ART/Combo Leads; Vendas diretas → E/Combo Cash; Presença digital → IA
3. **Maturidade digital**: Negócios iniciando → IA; Crescimento acelerado → ART; Escala → E ou Combos
4. **Segmento**: Serviços locais → ART; E-commerce → E/Combo Cash; Infoprodutos → Combo Leads

GUARDRAILS:
- Responda SEMPRE em português do Brasil
- Se informações insuficientes: retorne needs_more_info=true com campos faltantes
- Confidence < 0.7 indica briefing incompleto — use needs_more_info=true
- Seja específico e objetivo na justificativa (2-3 frases máximo)

Retorne sua análise como JSON válido no formato especificado pelo usuário.`;
}

export function buildAnalyzeBriefingUserPrompt(briefing: BriefingData): string {
  const socialUrls = briefing.urls_redes_sociais
    ? Object.entries(briefing.urls_redes_sociais)
        .filter(([, url]) => url)
        .map(([platform, url]) => `  - ${platform}: ${url}`)
        .join('\n')
    : '  Nenhuma informada';

  return `Analise o seguinte briefing e recomende o melhor pacote CopyZen:

**BRIEFING DO CLIENTE:**
- **Nome do negócio:** ${briefing.nome_negocio}
- **Segmento/nicho:** ${briefing.segmento}
- **Público-alvo:** ${briefing.publico_alvo}
- **Objetivo principal:** ${briefing.objetivo_principal}
- **Orçamento estimado:** ${briefing.orcamento_estimado || 'Não informado'}
- **Canal preferido:** ${briefing.canal_comunicacao}
- **Presença digital existente:**
${socialUrls}

Retorne um JSON válido com esta estrutura exata:
{
  "recommended_package": "ia" | "art" | "e" | "combo_leads" | "combo_cash",
  "reasoning": "Justificativa em 2-3 frases explicando a recomendação",
  "estimated_timeline": "Ex: 7-10 dias úteis",
  "estimated_cost_range": "Ex: R$ 1.500 - R$ 2.000/mês",
  "priority_systems": ["content", "funwheel", "sales_page"],
  "confidence": 0.0 a 1.0,
  "needs_more_info": false,
  "missing_info": []
}`;
}
