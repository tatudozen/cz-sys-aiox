-- ============================================================================
-- Migration: 20260314020000_core_tables
-- Description: Core entities — clients, brand_configs, brand_intelligence
-- Author: Dara (Data Engineer Agent)
-- Date: 2026-03-14
-- Dependencies: 20260314010000_extensions_and_functions
-- ============================================================================

-- ============================================================================
-- Table: clients
-- Purpose: Multi-tenant root entity. Every data row traces back to a client.
-- Access: RLS by auth.uid() mapped to client_id
-- ============================================================================
CREATE TABLE clients (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name          TEXT        NOT NULL,
    email         TEXT        NOT NULL,
    phone         TEXT,
    business_type TEXT,
    status        TEXT        NOT NULL DEFAULT 'onboarding'
                              CHECK (status IN ('active', 'inactive', 'onboarding')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_clients_email ON clients (email);
CREATE INDEX idx_clients_status ON clients (status);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE clients IS 'Multi-tenant root entity. Each client is a CopyZen customer (business owner).';
COMMENT ON COLUMN clients.status IS 'Lifecycle: onboarding → active → inactive';
COMMENT ON COLUMN clients.business_type IS 'Free-text business category (e.g., "ecommerce", "coaching")';

-- ============================================================================
-- Table: brand_configs
-- Purpose: Visual identity and brand guidelines per client.
--          One-to-one with clients. Fed into Astro theme + agent prompts.
-- ============================================================================
CREATE TABLE brand_configs (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id        UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    primary_color    TEXT        NOT NULL,
    secondary_color  TEXT,
    accent_color     TEXT,
    background_color TEXT        NOT NULL DEFAULT '#ffffff',
    text_color       TEXT        NOT NULL DEFAULT '#1a1a1a',
    heading_font     TEXT        NOT NULL,
    body_font        TEXT        NOT NULL,
    tone_of_voice    TEXT        NOT NULL DEFAULT 'casual'
                                 CHECK (tone_of_voice IN ('formal', 'casual', 'technical')),
    custom_guidelines TEXT,
    logo_url         TEXT,
    slogan           TEXT,
    keywords         TEXT[]      NOT NULL DEFAULT '{}',
    reference_images TEXT[]      NOT NULL DEFAULT '{}',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_brand_configs_client UNIQUE (client_id)
);

-- Indexes (client_id already indexed via UNIQUE constraint)

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_brand_configs_updated_at
    BEFORE UPDATE ON brand_configs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Validate hex color format
ALTER TABLE brand_configs
    ADD CONSTRAINT chk_primary_color_hex CHECK (primary_color ~ '^#[0-9a-fA-F]{3,8}$'),
    ADD CONSTRAINT chk_background_color_hex CHECK (background_color ~ '^#[0-9a-fA-F]{3,8}$'),
    ADD CONSTRAINT chk_text_color_hex CHECK (text_color ~ '^#[0-9a-fA-F]{3,8}$');

COMMENT ON TABLE brand_configs IS '1:1 visual identity config per client. Injected into Astro themes and agent prompts.';
COMMENT ON COLUMN brand_configs.tone_of_voice IS 'Brand tone: formal, casual, or technical. Used by Copywriter agent.';
COMMENT ON COLUMN brand_configs.keywords IS 'SEO/brand keywords array used in content generation.';
COMMENT ON COLUMN brand_configs.reference_images IS 'URLs of reference images for Designer agent.';

-- ============================================================================
-- Table: brand_intelligence
-- Purpose: Auto-scraped brand data from digital assets (FR-27/28/29).
--          Apify/Firecrawl scrapes → n8n analyzes → stored here.
--          Multiple rows per client (one per source URL).
-- ============================================================================
CREATE TABLE brand_intelligence (
    id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id          UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    source_url         TEXT        NOT NULL,
    source_type        TEXT        NOT NULL
                                   CHECK (source_type IN (
                                       'website', 'instagram', 'facebook',
                                       'linkedin', 'landing_page', 'reference'
                                   )),
    colors_detected    JSONB       NOT NULL DEFAULT '[]',
    fonts_detected     JSONB       NOT NULL DEFAULT '{}',
    tone_detected      TEXT        CHECK (tone_detected IS NULL OR
                                          tone_detected IN ('formal', 'casual', 'technical')),
    keywords_extracted TEXT[]      NOT NULL DEFAULT '{}',
    screenshot_url     TEXT,
    content_structure  JSONB       NOT NULL DEFAULT '{}',
    confidence_scores  JSONB       NOT NULL DEFAULT '{}',
    raw_data           JSONB       NOT NULL DEFAULT '{}',
    status             TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN (
                                       'pending', 'scraping', 'analyzing', 'complete', 'failed'
                                   )),
    error_message      TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_brand_intel_client ON brand_intelligence (client_id);
CREATE INDEX idx_brand_intel_status ON brand_intelligence (status);
CREATE INDEX idx_brand_intel_source_type ON brand_intelligence (client_id, source_type);
CREATE UNIQUE INDEX idx_brand_intel_client_url ON brand_intelligence (client_id, source_url);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_brand_intelligence_updated_at
    BEFORE UPDATE ON brand_intelligence
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE brand_intelligence IS 'Auto-scraped brand data from client digital assets via Apify/Firecrawl (FR-27/28/29).';
COMMENT ON COLUMN brand_intelligence.colors_detected IS 'JSON array: [{hex, percentage, role}]. Extracted palette from source.';
COMMENT ON COLUMN brand_intelligence.fonts_detected IS 'JSON: {heading: string, body: string}. Detected from CSS/visual analysis.';
COMMENT ON COLUMN brand_intelligence.confidence_scores IS 'JSON: {colors: 0.0-1.0, tone: 0.0-1.0, ...}. Analysis confidence per dimension.';
COMMENT ON COLUMN brand_intelligence.content_structure IS 'JSON: nav items, sections, CTAs found on source page.';
COMMENT ON COLUMN brand_intelligence.source_type IS 'reference = manually provided URL for modeling (FR-29).';
COMMENT ON COLUMN brand_intelligence.error_message IS 'Error details when status = failed.';
