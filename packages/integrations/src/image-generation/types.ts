/**
 * Image Generation — Types
 * Story 4.3 — AC-1, AC-3, AC-4
 */

export type AspectRatio = '1:1' | '4:5' | '16:9' | '9:16';
export type StylePreset = 'photorealistic' | 'illustration' | 'digital_art' | 'minimalist' | 'corporate';

// AC-3: Input options
export interface ImageOptions {
  aspect_ratio?: AspectRatio;
  style_preset?: StylePreset;
  reference_image_url?: string; // AC-6: Google Drive reference for style transfer
  negative_prompt?: string;
  seed?: number;
  steps?: number;
}

// AC-4: Output result
export interface ImageResult {
  provider_url: string;    // URL returned by image provider
  storage_url: string;     // URL after upload to Supabase Storage
  width: number;
  height: number;
  generation_id: string;
}

// AC-1: Core interface
export interface ImageGenerator {
  generate(prompt: string, options?: ImageOptions): Promise<ImageResult>;
  readonly providerName: string;
}

// Supabase Storage client minimal interface (injectable for testing)
export interface StorageClient {
  from(bucket: string): {
    upload(
      path: string,
      data: ArrayBuffer | Uint8Array,
      options?: { contentType?: string; upsert?: boolean },
    ): Promise<{ data: { path: string } | null; error: unknown }>;
    getPublicUrl(path: string): { data: { publicUrl: string } };
  };
}

// Image usage log entry (AC-5: cost tracking)
export interface ImageUsageLog {
  provider: string;
  generation_id: string;
  prompt_length: number;
  width: number;
  height: number;
  cost_estimate_usd: number;
  latency_ms: number;
  timestamp: string;
}
