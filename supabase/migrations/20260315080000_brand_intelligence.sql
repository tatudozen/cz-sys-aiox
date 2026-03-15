-- ============================================================================
-- Migration: 20260315080000_brand_intelligence
-- Description: Brand Intelligence table for digital asset scraping results.
--              Stores scraped colors, fonts, tone, keywords from client URLs.
-- Author: Dex (Dev Agent)
-- Date: 2026-03-15
-- Dependencies: 20260314020000_core_tables
-- Story: 2.6 — Brand Intelligence (AC-4)
-- ============================================================================

CREATE TABLE brand_intelligence (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id         UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    source_url        TEXT        NOT NULL,
    source_type       TEXT        NOT NULL
                                  CHECK (source_type IN (
                                      'website', 'instagram', 'facebook',
                                      'linkedin', 'landing_page', 'reference'
                                  )),
    colors_detected   JSONB,      -- [{ hex: '#FF5500', percentage: 0.35, name: 'primary' }]
    fonts_detected    JSONB,      -- ['Inter', 'Roboto']
    tone_detected     TEXT,       -- 'formal' | 'casual' | 'technical' (Claude analysis)
    keywords_extracted TEXT[],    -- Top 20 keywords found
    screenshot_url    TEXT,       -- Supabase Storage URL
    content_structure JSONB,      -- { headings, cta_count, images_count, text_length }
    confidence_scores JSONB,      -- { colors: 0.9, tone: 0.7, keywords: 0.85 }
    raw_data          JSONB,      -- Full scraper output
    status            TEXT        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN (
                                      'pending', 'processing', 'complete',
                                      'failed', 'needs_review'
                                  )),
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_brand_intel_client ON brand_intelligence (client_id);
CREATE INDEX idx_brand_intel_status ON brand_intelligence (status);
CREATE INDEX idx_brand_intel_source_type ON brand_intelligence (source_type);
CREATE INDEX idx_brand_intel_created ON brand_intelligence (created_at DESC);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_brand_intelligence_updated_at
    BEFORE UPDATE ON brand_intelligence
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- RLS
ALTER TABLE brand_intelligence ENABLE ROW LEVEL SECURITY;

-- Service role bypass (same pattern as other tables)
CREATE POLICY "brand_intelligence_service_role_all" ON brand_intelligence
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE brand_intelligence IS 'Scraped brand data from client digital assets. Used by Designer and Copywriter agents for style consistency.';
COMMENT ON COLUMN brand_intelligence.source_type IS 'website=client site, instagram/facebook/linkedin=social, landing_page=existing LP, reference=reference URL from surveys.';
COMMENT ON COLUMN brand_intelligence.confidence_scores IS 'Per-dimension confidence. If any < 0.6, status=needs_review triggers Fernando notification.';
