/**
 * Brand theme system for Sales Page
 * Story 6.1 — mirrors funwheel theme approach
 */

export interface SalesPageBrand {
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  text_color?: string;
  heading_font?: string;
  body_font?: string;
}

const DEFAULTS: Required<SalesPageBrand> = {
  primary_color: '#08164a',
  secondary_color: '#38bafc',
  accent_color: '#f59e0b',
  background_color: '#ffffff',
  text_color: '#0f172a',
  heading_font: 'Montserrat',
  body_font: 'Open Sans',
};

export function generateSalesThemeCSS(brand: SalesPageBrand = {}): string {
  const b = { ...DEFAULTS, ...brand };
  return `:root {
  --sp-primary: ${b.primary_color};
  --sp-secondary: ${b.secondary_color};
  --sp-accent: ${b.accent_color};
  --sp-bg: ${b.background_color};
  --sp-text: ${b.text_color};
  --sp-gradient: linear-gradient(135deg, ${b.primary_color} 0%, ${b.secondary_color} 100%);
  --sp-heading-font: '${b.heading_font}', system-ui, sans-serif;
  --sp-body-font: '${b.body_font}', system-ui, sans-serif;
}`;
}

export function googleFontsUrl(brand: SalesPageBrand = {}): string {
  const b = { ...DEFAULTS, ...brand };
  const families = [b.heading_font, b.body_font].filter(Boolean);
  const unique = [...new Set(families)];
  const params = unique
    .map(f => `family=${encodeURIComponent(f)}:wght@400;600;700;800`)
    .join('&');
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}
