/**
 * BrandConfigLoader
 * Story 3.2 — AC-2: Loads brand config from Supabase by client_id with TTL cache.
 * Also enriches with brand_intelligence data (Story 2.6).
 */

import type { BrandConfig } from './brand-config.js';

interface CacheEntry {
  config: BrandConfig;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1_000; // 5 minutes

/**
 * Minimal Supabase REST client interface — avoids coupling to specific SDK.
 * In production, pass the real Supabase client. In tests, pass a mock.
 */
export interface SupabaseRestClient {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        single(): Promise<{ data: unknown; error: unknown }>;
        limit(n: number): Promise<{ data: unknown[]; error: unknown }>;
      };
    };
  };
}

export class BrandConfigLoader {
  private cache = new Map<string, CacheEntry>();

  constructor(private readonly supabase: SupabaseRestClient) {}

  async load(clientId: string): Promise<BrandConfig> {
    const cached = this.cache.get(clientId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.config;
    }

    const { data, error } = await this.supabase
      .from('brand_configs')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error || !data) {
      throw new Error(`BrandConfig not found for client_id: ${clientId}`);
    }

    const config = data as BrandConfig;

    // Enrich with brand_intelligence data if available (Story 2.6)
    const enriched = await this.enrichWithBrandIntelligence(config, clientId);

    this.cache.set(clientId, {
      config: enriched,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return enriched;
  }

  private async enrichWithBrandIntelligence(
    config: BrandConfig,
    clientId: string
  ): Promise<BrandConfig> {
    try {
      const { data } = await this.supabase
        .from('brand_intelligence')
        .select('keywords_extracted, tone_detected, colors_detected')
        .eq('client_id', clientId)
        .limit(1);

      const intel = Array.isArray(data) ? (data[0] as Record<string, unknown>) : null;
      if (!intel) return config;

      const enriched: BrandConfig = { ...config };

      // Enrich keywords if brand_intelligence has more
      if (Array.isArray(intel.keywords_extracted) && intel.keywords_extracted.length > 0) {
        const merged = Array.from(new Set([...config.keywords, ...intel.keywords_extracted])).slice(0, 30);
        enriched.keywords = merged;
      }

      return enriched;
    } catch {
      // brand_intelligence enrichment is optional — don't fail
      return config;
    }
  }

  invalidate(clientId: string): void {
    this.cache.delete(clientId);
  }

  invalidateAll(): void {
    this.cache.clear();
  }
}
