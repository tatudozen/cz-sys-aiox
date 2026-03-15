/**
 * CopyZen Brand Config Validation
 * Story 7.1 — AC-6
 *
 * Validates that the CopyZen brand identity (seed data from migrations)
 * produces correct guardrails, tone enforcement, and keyword compliance.
 */

import { describe, it, expect } from 'vitest';
import { buildBrandGuardrails, validateBrandCompliance } from '../brand-guardrails.js';
import type { BrandConfig } from '../brand-config.js';

// Matches seed data from 20260315090000 + 20260315110000 migrations
const copyzenBrand: BrandConfig = {
  id: '00000000-0000-0000-0000-000000000002',
  client_id: '00000000-0000-0000-0000-000000000001',
  primary_color: '#0F172A',
  secondary_color: '#6366F1',
  accent_color: '#F59E0B',
  background_color: '#F8FAFC',
  text_color: '#1E293B',
  heading_font: 'Inter',
  body_font: 'Inter',
  tone_of_voice: 'casual',
  custom_guidelines:
    'Tom conversacional e próximo. Use "você" diretamente. Evite jargão técnico. Foque em benefícios concretos e resultados mensuráveis.',
  logo_url: null,
  slogan: 'Copy que conecta. Resultados que importam.',
  keywords: ['copywriting', 'marketing digital', 'automação', 'funil de vendas', 'leads', 'conversão'],
  reference_images: [],
};

describe('CopyZen Brand — AC-6: guardrails and compliance', () => {
  it('generates a system prompt with casual tone', () => {
    const { systemPromptAddition } = buildBrandGuardrails(copyzenBrand);
    expect(systemPromptAddition).toContain('casual');
    expect(systemPromptAddition.toLowerCase()).toContain('conversacional');
  });

  it('system prompt includes CopyZen keywords', () => {
    const { systemPromptAddition } = buildBrandGuardrails(copyzenBrand);
    expect(systemPromptAddition).toContain('copywriting');
    expect(systemPromptAddition).toContain('conversão');
  });

  it('system prompt includes custom_guidelines text', () => {
    const { systemPromptAddition } = buildBrandGuardrails(copyzenBrand);
    expect(systemPromptAddition).toContain('você');
  });

  it('validates brand compliance for copy containing keywords', () => {
    const compliantCopy =
      'Aprenda copywriting com a nossa automação e aumente sua conversão de leads com marketing digital.';
    const result = validateBrandCompliance(compliantCopy, copyzenBrand);
    expect(result.compliant).toBe(true);
  });

  it('marks non-compliant for copy without any keywords', () => {
    const nonCompliant = 'Este é um texto genérico sem nenhuma palavra relevante do nicho.';
    const result = validateBrandCompliance(nonCompliant, copyzenBrand);
    expect(result.compliant).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('brand_compliant check is case-insensitive', () => {
    const copy = 'Descubra o poder do COPYWRITING para transformar leads em clientes.';
    const result = validateBrandCompliance(copy, copyzenBrand);
    expect(result.compliant).toBe(true);
  });
});
