import { describe, it, expect } from 'vitest';
import type { BrandConfig } from '../brand-config';

describe('BrandConfig', () => {
  it('accepts a valid brand config object', () => {
    const config: BrandConfig = {
      id: 'test-id',
      client_id: 'client-1',
      primary_color: '#FF0000',
      secondary_color: '#00FF00',
      accent_color: '#0000FF',
      background_color: '#FFFFFF',
      text_color: '#000000',
      heading_font: 'Inter',
      body_font: 'Inter',
      tone_of_voice: 'casual',
      custom_guidelines: null,
      logo_url: null,
      slogan: null,
      keywords: [],
      reference_images: [],
    };
    expect(config.client_id).toBe('client-1');
    expect(config.tone_of_voice).toBe('casual');
  });
});
