export interface BrandConfig {
  id: string;
  client_id: string;
  primary_color: string; // hex
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  heading_font: string;
  body_font: string;
  tone_of_voice: 'formal' | 'casual' | 'technical';
  custom_guidelines: string | null;
  logo_url: string | null;
  slogan: string | null;
  keywords: string[];
  reference_images: string[]; // URLs
}
