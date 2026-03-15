/**
 * Copywriter Agent — Output Types
 * Story 3.4 — AC-6
 */

export type CopyMode = 'inception' | 'atracao_fatal';
export type PostType = 'carousel' | 'image';
export type PageType = 'apresentacao' | 'retencao' | 'transformacao';

// AC-6: PostCopy — structured output for social media posts
export interface PostCopy {
  headline: string;
  body: string;
  cta: string;
  hashtags: string[];
  metadata: {
    mode: CopyMode;
    type: PostType;
    brand_compliant: boolean;
  };
}

// Landing page copy for FunWheel A-R-T pages
export interface LandingPageCopy {
  page_type: PageType;
  headline: string;
  subheadline: string;
  body_sections: { title: string; content: string }[];
  cta: string;
  cta_secondary?: string;
  metadata: {
    page_type: PageType;
    brand_compliant: boolean;
  };
}

// Story 5.2: Detailed Apresentação copy structure
export interface JourneyStep {
  step: number;
  title: string;
  description: string;
}

export interface ApresentacaoCopy {
  hero: { headline: string; subheadline: string };
  problem: { text: string; pain_points: string[] };
  journey: JourneyStep[];
  solution: { text: string; value_props: string[] };
  cta: { text: string };
  metadata: { brand_compliant: boolean };
}

// AC-3 Story 4.2: CarouselSlide — single slide in a carousel post
export interface CarouselSlide {
  index: number;
  copy_text: string;
  image_prompt: string;
  image_url: string | null;
  layout_hint: 'cover' | 'content' | 'cta';
}

// Sales page copy
export interface SalesPageCopy {
  hero_headline: string;
  hero_subheadline: string;
  problem_section: string;
  solution_section: string;
  benefits: string[];
  testimonial_placeholders: string[];
  cta_primary: string;
  cta_secondary: string;
  urgency_element: string;
  metadata: {
    brand_compliant: boolean;
  };
}
