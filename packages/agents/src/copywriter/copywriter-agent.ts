/**
 * Copywriter Agent — Full Implementation
 * Story 3.4 — AC-1 through AC-7
 */

import { Agent } from '../base/agent.js';
import type { AgentConfig } from '../base/agent.js';
import type { BrandConfig } from '@copyzen/core';
import { buildBrandGuardrails, validateBrandCompliance } from '@copyzen/core';
import type { PostCopy, LandingPageCopy, SalesPageCopy, SalesPageContent, CarouselSlide, CopyMode, PostType, PageType, ApresentacaoCopy, JourneyStep } from './types.js';
import { buildApresentacaoPrompt } from './prompts/landing-page-apresentacao.js';
import { buildSalesPagePrompt } from './prompts/sales-page.js';
import type { SalesStrategy } from '../cmo/prompts/sales-strategy.js';

// AC-3: System prompt with brand guardrails
function buildCopywriterSystemPrompt(brandConfig: BrandConfig, mode?: CopyMode): string {
  const { systemPromptAddition } = buildBrandGuardrails(brandConfig);

  const modeInstructions =
    mode === 'inception'
      ? `
MODO INCEPTION (Branding):
- Copy focado em storytelling e autoridade
- Construa antecipação e curiosidade
- SEM CTA agressivo — apenas CTA suave no final ("Saiba mais", "Conheça a história")
- Tom: inspiracional, reflexivo, constrói identidade de marca`
      : mode === 'atracao_fatal'
        ? `
MODO ATRAÇÃO FATAL (Conversão):
- Copy com problem-agitation: identifique a dor → amplifique → ofereça solução
- CTA forte e direto: direcione para o FunWheel ou página de conversão
- Tom: urgente, empático com a dor, transformacional
- Gatilhos: escassez, prova social, transformação rápida`
        : '';

  return `Você é um copywriter especialista em copywriting conversacional para o mercado brasileiro.
Especializado em conteúdo para Instagram, Facebook e páginas de vendas.

${systemPromptAddition}${modeInstructions}

ESTRUTURA DE COPYWRITING:
1. Headline: gancho poderoso (máx 10 palavras para posts)
2. Body: desenvolvimento conversacional, parágrafos curtos, espaçamento aéreo
3. CTA: ação clara e específica
4. Hashtags: relevantes ao nicho (5-10 para posts)

REGRAS:
- Escreva em português do Brasil natural e conversacional
- Use quebras de linha frequentes para posts
- Incorpore as keywords da marca naturalmente
- Retorne JSON válido quando solicitado`;
}

function parseJsonSafe<T>(content: string, fallback: T): T {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallback;
    return JSON.parse(jsonMatch[0]) as T;
  } catch {
    return fallback;
  }
}

export class CopywriterAgent extends Agent {
  constructor(config: AgentConfig) {
    super(config);
  }

  // AC-2, AC-4, AC-5, AC-6: generatePostCopy
  async generatePostCopy(
    brief: string,
    brandConfig: BrandConfig,
    mode: CopyMode,
    type: PostType,
  ): Promise<PostCopy> {
    const systemPrompt = buildCopywriterSystemPrompt(brandConfig, mode);

    const typeInstructions =
      type === 'carousel'
        ? 'Crie copy para um post carrossel. O campo "body" deve conter os slides separados por "---SLIDE---".'
        : 'Crie copy para um post de imagem única. O body deve ser completo para a legenda.';

    const userPrompt = `${typeInstructions}

BRIEFING:
${brief}

Retorne JSON com esta estrutura:
{
  "headline": "Gancho principal para o post",
  "body": "Corpo do texto completo",
  "cta": "Call to action",
  "hashtags": ["hashtag1", "hashtag2"]
}`;

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 1200,
      temperature: 0.7,
    });

    const parsed = parseJsonSafe<Omit<PostCopy, 'metadata'>>(response.content, {
      headline: 'Transforme seu negócio hoje',
      body: response.content.slice(0, 500),
      cta: 'Saiba mais',
      hashtags: brandConfig.keywords.slice(0, 5).map((k) => k.replace(/\s+/g, '')),
    });

    const compliance = validateBrandCompliance(parsed.body, brandConfig);

    return {
      ...parsed,
      metadata: { mode, type, brand_compliant: compliance.compliant },
    };
  }

  // AC-2: generateLandingPageCopy
  async generateLandingPageCopy(
    brief: string,
    brandConfig: BrandConfig,
    pageType: PageType,
  ): Promise<LandingPageCopy> {
    const systemPrompt = buildCopywriterSystemPrompt(brandConfig, 'atracao_fatal');

    const pageDescriptions: Record<PageType, string> = {
      apresentacao:
        'Página de Apresentação (A): Introdução da marca/produto, desperta curiosidade, CTA para próxima página',
      retencao:
        'Página de Retenção (R): Aprofunda o problema, apresenta solução, builds desejo, CTA para transformação',
      transformacao:
        'Página de Transformação (T): Proposta de valor clara, prova social, CTA forte para conversão final',
    };

    const userPrompt = `Crie copy para ${pageDescriptions[pageType]}.

BRIEFING:
${brief}

Retorne JSON:
{
  "headline": "Headline principal",
  "subheadline": "Subheadline complementar",
  "body_sections": [
    {"title": "Seção 1", "content": "Conteúdo da seção"}
  ],
  "cta": "Call to action principal",
  "cta_secondary": "CTA secundário opcional"
}`;

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 1500,
      temperature: 0.6,
    });

    const parsed = parseJsonSafe<Omit<LandingPageCopy, 'page_type' | 'metadata'>>(
      response.content,
      {
        headline: 'Descubra como transformar seu negócio',
        subheadline: 'A solução que você estava procurando',
        body_sections: [{ title: 'Por que agora?', content: response.content.slice(0, 300) }],
        cta: 'Quero saber mais',
        cta_secondary: 'Fale conosco',
      },
    );

    const compliance = validateBrandCompliance(parsed.headline + ' ' + parsed.body_sections.map((s) => s.content).join(' '), brandConfig);

    return {
      page_type: pageType,
      ...parsed,
      metadata: { page_type: pageType, brand_compliant: compliance.compliant },
    };
  }

  // Story 5.2: generateApresentacaoCopy — specialized for FunWheel Stage A
  async generateApresentacaoCopy(brief: string, brandConfig: BrandConfig): Promise<ApresentacaoCopy> {
    const systemPrompt = buildCopywriterSystemPrompt(brandConfig, 'inception');
    const userPrompt = buildApresentacaoPrompt(brief, brandConfig);

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 2000,
      temperature: 0.65,
    });

    const fallbackJourney: JourneyStep[] = [
      { step: 1, title: 'O Diagnóstico', description: 'Identificamos onde você está.' },
      { step: 2, title: 'O Plano', description: 'Estruturamos o caminho para a mudança.' },
      { step: 3, title: 'A Execução', description: 'Implementamos com suporte dedicado.' },
      { step: 4, title: 'A Transformação', description: 'Você alcança resultados mensuráveis.' },
    ];

    const parsed = parseJsonSafe<ApresentacaoCopy>(response.content, {
      hero: {
        headline: 'Descubra o Poder da Transformação',
        subheadline: 'Seu guia de 3 passos para o sucesso.',
      },
      problem: {
        text: 'Muitos profissionais enfrentam os mesmos desafios todos os dias.',
        pain_points: ['Falta de clareza no posicionamento', 'Dificuldade em atrair clientes', 'Sem sistema de follow-up'],
      },
      journey: fallbackJourney,
      solution: {
        text: 'Nossa metodologia foi desenvolvida para transformar esses desafios em oportunidades.',
        value_props: ['Estratégia comprovada', 'Suporte personalizado', 'Resultados mensuráveis'],
      },
      cta: { text: 'Quero Saber Mais →' },
      metadata: { brand_compliant: false },
    });

    const allText = [
      parsed.hero.headline,
      parsed.hero.subheadline,
      parsed.problem.text,
      parsed.solution.text,
    ].join(' ');
    const compliance = validateBrandCompliance(allText, brandConfig);

    return { ...parsed, metadata: { brand_compliant: compliance.compliant } };
  }

  // AC-2: generateSalesPageCopy
  async generateSalesPageCopy(brief: string, brandConfig: BrandConfig): Promise<SalesPageCopy> {
    const systemPrompt = buildCopywriterSystemPrompt(brandConfig, 'atracao_fatal');

    const userPrompt = `Crie copy completo para uma página de vendas de alta conversão.

BRIEFING:
${brief}

Retorne JSON:
{
  "hero_headline": "Headline do hero",
  "hero_subheadline": "Subheadline do hero",
  "problem_section": "Seção de problema/dor",
  "solution_section": "Seção de solução",
  "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"],
  "testimonial_placeholders": ["[Depoimento de X]", "[Resultado de Y]"],
  "cta_primary": "CTA principal",
  "cta_secondary": "CTA secundário",
  "urgency_element": "Elemento de urgência/escassez"
}`;

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 2000,
      temperature: 0.6,
    });

    const parsed = parseJsonSafe<Omit<SalesPageCopy, 'metadata'>>(response.content, {
      hero_headline: 'Transforme seu negócio com resultados reais',
      hero_subheadline: 'A plataforma que automatiza seu marketing',
      problem_section: 'Você está perdendo clientes todos os dias...',
      solution_section: 'Nossa solução resolve isso de forma definitiva.',
      benefits: ['Aumento de leads', 'Copy personalizado', 'Resultados mensuráveis'],
      testimonial_placeholders: ['[Depoimento do cliente A]', '[Resultado do cliente B]'],
      cta_primary: 'Quero começar agora',
      cta_secondary: 'Falar com especialista',
      urgency_element: 'Vagas limitadas para este mês',
    });

    const contentToCheck = `${parsed.hero_headline} ${parsed.problem_section} ${parsed.solution_section}`;
    const compliance = validateBrandCompliance(contentToCheck, brandConfig);

    return {
      ...parsed,
      metadata: { brand_compliant: compliance.compliant },
    };
  }

  // Story 6.2 — AC-2: generateSalesPageContent (full 9-section version)
  async generateSalesPageContent(
    brief: string,
    brandConfig: BrandConfig,
    strategy?: SalesStrategy,
    leadCount?: number,
  ): Promise<SalesPageContent> {
    const systemPrompt = buildCopywriterSystemPrompt(brandConfig, 'atracao_fatal');
    const userPrompt = buildSalesPagePrompt(brief, brandConfig, strategy, leadCount);

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 3500,
      temperature: 0.65,
    });

    const fallback: Omit<SalesPageContent, 'metadata'> = {
      hero: {
        headline: 'Transforme Seu Negócio com Nossa Solução',
        subheadline: 'O método comprovado para resultados reais e consistentes.',
        cta_text: 'Quero Começar Agora →',
      },
      problem: {
        text: 'Você está trabalhando muito mas os resultados não acompanham o esforço.',
        pain_points: ['Falta de clareza na mensagem', 'Leads desqualificados', 'Baixa taxa de conversão', 'Tempo desperdiçado'],
      },
      solution: {
        text: 'Nossa solução resolve os principais obstáculos que impedem seu crescimento.',
        value_props: ['Método comprovado', 'Suporte dedicado', 'Resultados mensuráveis', 'Implementação rápida'],
      },
      benefits: [
        { title: 'Mais Clientes', description: 'Atraia clientes qualificados que realmente querem comprar.' },
        { title: 'Mais Conversões', description: 'Aumente sua taxa de fechamento com as técnicas certas.' },
        { title: 'Mais Autoridade', description: 'Posicione-se como referência no seu nicho.' },
        { title: 'Mais Tempo', description: 'Automatize processos e foque no que importa.' },
      ],
      social_proof: [
        { quote: 'Transformei meu negócio completamente em 3 meses.', author: 'Cliente A', role: 'Empresário' },
        { quote: 'Os resultados superaram minhas expectativas.', author: 'Cliente B', role: 'Consultor' },
        { quote: 'Melhor investimento que fiz para minha carreira.', author: 'Cliente C', role: 'Profissional Liberal' },
      ],
      offer: {
        title: 'O Que Está Incluído',
        items: ['Acesso completo ao método', 'Suporte por 30 dias', 'Materiais bônus', 'Acesso à comunidade'],
        price_display: 'Consulte',
      },
      guarantee: { text: 'Garantia total de satisfação. Se não ficar satisfeito, devolvemos 100%.', duration: '30 dias' },
      faq: [
        { question: 'Para quem é?', answer: 'Para profissionais que querem crescer.' },
        { question: 'Em quanto tempo vejo resultados?', answer: 'A maioria dos clientes vê resultados nas primeiras 2 semanas.' },
        { question: 'E se não funcionar?', answer: 'Você tem 30 dias de garantia total.' },
      ],
      final_cta: {
        headline: 'A Hora de Mudar é Agora',
        urgency: 'Vagas limitadas. Não deixe para depois.',
        button_text: 'Garantir Minha Vaga →',
      },
    };

    const parsed = parseJsonSafe<Omit<SalesPageContent, 'metadata'>>(response.content, fallback);

    const contentToCheck = `${parsed.hero.headline} ${parsed.problem.text} ${parsed.solution.text}`;
    const compliance = validateBrandCompliance(contentToCheck, brandConfig);

    return { ...parsed, metadata: { brand_compliant: compliance.compliant } };
  }

  // Story 4.2 — AC-1, AC-4, AC-5: generateCarouselCopy
  async generateCarouselCopy(
    brief: string,
    brandConfig: BrandConfig,
    mode: CopyMode,
    slideCount = 5,
  ): Promise<CarouselSlide[]> {
    const systemPrompt = buildCopywriterSystemPrompt(brandConfig, mode);

    const ctaInstruction =
      mode === 'inception'
        ? `Slide final: convite suave tipo "Salva esse post" ou "Conta pra gente nos comentários"`
        : `Slide final: CTA forte e direto como "Clique no link da bio" ou "Acesse agora"`;

    const userPrompt = `Crie um carrossel para Instagram de ${slideCount} slides no modo ${mode}.

BRIEFING: ${brief}

ESTRUTURA:
- Slide 0 (CAPA): headline poderosa que para o scroll — máx 8 palavras
- Slides 1 a ${slideCount - 2}: copy conciso por slide, aprofundando um ponto específico — máx 3 linhas cada
- ${ctaInstruction}

Retorne um array JSON com ${slideCount} objetos:
[
  { "index": 0, "copy_text": "...", "layout_hint": "cover" },
  { "index": 1, "copy_text": "...", "layout_hint": "content" },
  ...
  { "index": ${slideCount - 1}, "copy_text": "...", "layout_hint": "cta" }
]`;

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 1500,
      temperature: 0.7,
    });

    // Parse JSON array
    let slides: Array<{ index: number; copy_text: string; layout_hint: CarouselSlide['layout_hint'] }>;
    try {
      const jsonMatch = response.content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON array found');
      slides = JSON.parse(jsonMatch[0]);
    } catch {
      // Fallback: generate basic structure
      slides = Array.from({ length: slideCount }, (_, i) => ({
        index: i,
        copy_text: i === 0
          ? 'Descubra como transformar seu negócio'
          : i === slideCount - 1
            ? (mode === 'inception' ? 'Salva esse post para lembrar!' : 'Acesse agora — link na bio!')
            : `Ponto ${i}: ${brief.slice(0, 50)}`,
        layout_hint: (i === 0 ? 'cover' : i === slideCount - 1 ? 'cta' : 'content') as CarouselSlide['layout_hint'],
      }));
    }

    return slides.map((slide) => ({
      ...slide,
      image_prompt: '',  // Filled by DesignerAgent.generateCarouselVisuals
      image_url: null,
    }));
  }

  // AC-7: revise — accepts feedback and produces revised copy
  async revise(original: string, feedback: string, brandConfig: BrandConfig): Promise<string> {
    const { systemPromptAddition } = buildBrandGuardrails(brandConfig);

    const systemPrompt = `Você é um copywriter especialista em revisão de conteúdo.
${systemPromptAddition}

Sua tarefa: revisar o copy fornecido com base no feedback, mantendo o tom de voz e keywords da marca.`;

    const userPrompt = `COPY ORIGINAL:
${original}

FEEDBACK PARA REVISÃO:
${feedback}

Retorne APENAS o copy revisado, sem explicações adicionais.`;

    const response = await this.callLLM(systemPrompt, userPrompt, {
      maxTokens: 1500,
      temperature: 0.5,
    });

    return response.content.trim();
  }
}
