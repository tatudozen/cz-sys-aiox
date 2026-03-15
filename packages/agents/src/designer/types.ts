/**
 * Designer Agent — Types
 * Story 3.5 — AC-2, AC-4
 */

import type { BrandTheme } from '@copyzen/core';
import type { ReviewResult } from '../cmo/types.js';

export type ImageFormat = 'post' | 'carousel_slide' | 'hero' | 'background';

// AC-4: Extended BrandTheme with font imports
export interface DesignerBrandTheme extends BrandTheme {
  fontImports: string[]; // Google Fonts URLs
}

// Designer output for image generation
export interface DesignerOutput {
  image_prompt: string;
  format: ImageFormat;
  brand_colors: string[];
  style_notes: string;
}

export type { ReviewResult };
