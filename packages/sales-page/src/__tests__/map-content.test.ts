/**
 * map-content tests — Story 7.4 AC-2/3
 *
 * Validates that CTA URL flows correctly from client-content.json
 * and can be overridden via ctaUrlOverride (PUBLIC_CTA_URL env var).
 */

import { describe, it, expect } from 'vitest';
import { mapContentToProps } from '../lib/map-content.js';
import type { SalesContentData } from '../lib/map-content.js';

const minimalContent: SalesContentData = {
  client_slug: 'test',
  sections: {
    hero: { headline: 'Test Headline', subheadline: 'Sub', cta_text: 'Click →' },
    problem: { text: 'Problem text', pain_points: ['Pain 1'] },
    solution: { text: 'Solution text', value_props: ['Prop 1'] },
    benefits: [{ title: 'Benefit', description: 'Desc' }],
    social_proof: [{ quote: 'Great', author: 'Author', role: 'Role' }],
    offer: { title: 'Offer', items: ['Item 1'], price_display: 'R$ 997' },
    guarantee: { text: 'Guarantee text', duration: '30 dias' },
    faq: [{ question: 'Q?', answer: 'A.' }],
    final_cta: { headline: 'Now', urgency: 'Hurry', button_text: 'CTA →' },
  },
};

describe('mapContentToProps — CTA URL routing (Story 7.4 AC-2/3)', () => {
  it('defaults to #oferta when no cta_url and no override', () => {
    const props = mapContentToProps(minimalContent);
    expect(props.primaryCtaUrl).toBe('#oferta');
    expect(props.offerCtaUrl).toBe('#oferta');
    expect(props.finalCtaUrl).toBe('#oferta');
  });

  it('uses cta_url from content when provided', () => {
    const content = { ...minimalContent, cta_url: 'https://wa.me/5511999999999?text=Oi' };
    const props = mapContentToProps(content);
    expect(props.primaryCtaUrl).toBe('https://wa.me/5511999999999?text=Oi');
    expect(props.finalCtaUrl).toBe('https://wa.me/5511999999999?text=Oi');
  });

  it('ctaUrlOverride takes precedence over content cta_url', () => {
    const content = { ...minimalContent, cta_url: 'https://wa.me/5511999999999' };
    const override = 'https://ghl.io/booking/copyzen';
    const props = mapContentToProps(content, override);
    expect(props.primaryCtaUrl).toBe(override);
    expect(props.offerCtaUrl).toBe(override);
    expect(props.finalCtaUrl).toBe(override);
  });

  it('treats null cta_url as absent (falls back to #oferta)', () => {
    const content = { ...minimalContent, cta_url: null };
    const props = mapContentToProps(content);
    expect(props.primaryCtaUrl).toBe('#oferta');
  });

  it('maps all 9 sections correctly', () => {
    const props = mapContentToProps(minimalContent);
    expect(props.heroHeadline).toBe('Test Headline');
    expect(props.painPoints).toHaveLength(1);
    expect(props.benefits).toHaveLength(1);
    expect(props.testimonials).toHaveLength(1);
    expect(props.faqItems).toHaveLength(1);
    expect(props.guaranteeDays).toBe(30);
  });
});
