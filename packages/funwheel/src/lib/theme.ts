/**
 * FunWheel Build-Time Theming System — Story 5.1
 * Converts a BrandConfig into CSS custom properties injected into <head>.
 */

export interface BrandThemeInput {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  heading_font?: string;
  body_font?: string;
  tone_of_voice?: string;
}

export interface BrandThemeCSS {
  /** CSS string to inject into <style> tag in <head> */
  cssVariables: string;
  /** Google Fonts URL for <link> tag */
  fontImportUrl: string;
}

const FONT_IMPORT_BASE = 'https://fonts.googleapis.com/css2?';

/**
 * Map a font family name to its Google Fonts query param.
 */
function buildFontQuery(fontName: string): string {
  const cleaned = fontName.replace(/'/g, '').trim();
  return `family=${cleaned.replace(/ /g, '+')}:wght@400;600;700`;
}

/**
 * Build Google Fonts import URL for heading + body fonts.
 */
function buildFontImportUrl(headingFont: string, bodyFont: string): string {
  const families: string[] = [];
  const headingQuery = buildFontQuery(headingFont);
  families.push(headingQuery);

  if (bodyFont !== headingFont) {
    families.push(buildFontQuery(bodyFont));
  }

  return `${FONT_IMPORT_BASE}${families.join('&')}&display=swap`;
}

/**
 * Generate CSS custom properties from BrandThemeInput.
 * Returns a complete :root { } block ready to inject into <style>.
 */
export function generateThemeCSS(brand: BrandThemeInput): BrandThemeCSS {
  const primary = brand.primary_color ?? '#08164a';
  const secondary = brand.secondary_color ?? '#38bafc';
  const accent = brand.accent_color ?? secondary;
  const background = brand.background_color ?? '#ffffff';
  const text = brand.text_color ?? '#1a202c';
  const headingFont = brand.heading_font ?? 'Montserrat';
  const bodyFont = brand.body_font ?? 'Open Sans';

  const cssVariables = `:root {
  --brand-primary: ${primary};
  --brand-secondary: ${secondary};
  --brand-accent: ${accent};
  --brand-bg: ${background};
  --brand-text: ${text};
  --brand-heading-font: '${headingFont}', sans-serif;
  --brand-body-font: '${bodyFont}', sans-serif;
  --brand-gradient: linear-gradient(135deg, ${primary} 0%, ${secondary} 100%);
  --brand-gradient-dark: linear-gradient(180deg, #1a1a2e 0%, ${primary} 100%);
}`;

  return {
    cssVariables,
    fontImportUrl: buildFontImportUrl(headingFont, bodyFont),
  };
}

/**
 * Default CopyZen brand theme (used as fallback).
 */
export const DEFAULT_THEME: BrandThemeInput = {
  primary_color: '#08164a',
  secondary_color: '#38bafc',
  accent_color: '#38bafc',
  background_color: '#ffffff',
  text_color: '#1a202c',
  heading_font: 'Montserrat',
  body_font: 'Open Sans',
};
