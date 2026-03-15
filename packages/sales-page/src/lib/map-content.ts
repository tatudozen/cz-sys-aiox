/**
 * map-content.ts
 * Story 6.3 — AC-1
 *
 * Maps the SalesPageContent JSON (from Supabase / client-content.json)
 * to the props expected by the SalesPage template.
 */

export interface SalesContentData {
  client_slug: string;
  title?: string;
  description?: string;
  brand?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
    background_color?: string;
    text_color?: string;
    heading_font?: string;
    body_font?: string;
  };
  sections: {
    hero: { headline: string; subheadline: string; cta_text: string };
    problem: { text: string; pain_points: string[] };
    solution: { text: string; value_props: string[] };
    benefits: Array<{ title: string; description: string }>;
    social_proof: Array<{ quote: string; author: string; role: string }>;
    offer: { title: string; items: string[]; price_display: string };
    guarantee: { text: string; duration: string };
    faq: Array<{ question: string; answer: string }>;
    final_cta: { headline: string; urgency: string; button_text: string };
  };
}

/** Extract numeric days from strings like "30 dias" or "7 days" */
function parseDays(duration: string): number {
  const match = duration.match(/\d+/);
  return match ? parseInt(match[0], 10) : 30;
}

/** Map SalesContentData → flat SalesPage template props */
export function mapContentToProps(data: SalesContentData) {
  const { sections, title, description, brand } = data;

  return {
    title: title ?? sections.hero.headline,
    description: description ?? sections.problem.text.slice(0, 160),
    brand: brand ?? {},

    // Hero
    heroHeadline: sections.hero.headline,
    heroSubheadline: sections.hero.subheadline,
    primaryCtaText: sections.hero.cta_text,

    // Problem
    problemBody: sections.problem.text,
    painPoints: sections.problem.pain_points.map((text) => ({ text })),

    // Solution
    solutionBody: sections.solution.text,
    solutionHighlights: sections.solution.value_props,

    // Benefits
    benefits: sections.benefits.map((b) => ({ title: b.title, description: b.description })),

    // Social Proof
    testimonials: sections.social_proof.map((sp) => ({
      name: sp.author,
      role: sp.role,
      text: sp.quote,
    })),

    // Offer
    offerTitle: sections.offer.title,
    price: sections.offer.price_display,
    offerItems: sections.offer.items.map((text) => ({ text })),

    // Guarantee
    guaranteeBody: sections.guarantee.text,
    guaranteeDays: parseDays(sections.guarantee.duration),

    // FAQ
    faqItems: sections.faq,

    // Final CTA
    finalCtaTitle: sections.final_cta.headline,
    finalCtaUrgency: sections.final_cta.urgency,
    finalCtaText: sections.final_cta.button_text,
  };
}
