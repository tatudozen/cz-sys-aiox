-- ============================================================================
-- Migration: 20260314040000_leads_and_observability
-- Description: Lead capture (FunWheel), referrals, agent logs, LLM usage,
--              WhatsApp interactions
-- Author: Dara (Data Engineer Agent)
-- Date: 2026-03-14
-- Dependencies: 20260314020000_core_tables
-- ============================================================================

-- ============================================================================
-- Table: leads
-- Purpose: Captured leads from FunWheel pages (A-R-T) and sales pages.
--          Each lead has a unique referral code for the referral engine.
-- ============================================================================
CREATE TABLE leads (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id      UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    funwheel_id    TEXT,
    name           TEXT        NOT NULL,
    email          TEXT,
    phone          TEXT,
    source_page    TEXT        NOT NULL
                               CHECK (source_page IN (
                                   'apresentacao', 'retencao',
                                   'transformacao', 'sales_page'
                               )),
    referral_code  TEXT        NOT NULL,
    referral_count INTEGER     NOT NULL DEFAULT 0 CHECK (referral_count >= 0),
    vip_access     BOOLEAN     NOT NULL DEFAULT false,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_leads_referral_code ON leads (referral_code);
CREATE INDEX idx_leads_client ON leads (client_id);
CREATE INDEX idx_leads_source ON leads (client_id, source_page);
CREATE INDEX idx_leads_email ON leads (email) WHERE email IS NOT NULL;
CREATE INDEX idx_leads_phone ON leads (phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_leads_created ON leads (created_at DESC);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Trigger: auto-grant VIP when referral_count >= 3
CREATE TRIGGER trg_leads_vip_check
    BEFORE UPDATE ON leads
    FOR EACH ROW
    WHEN (NEW.referral_count IS DISTINCT FROM OLD.referral_count)
    EXECUTE FUNCTION check_vip_access();

-- Ensure at least email or phone is provided
ALTER TABLE leads
    ADD CONSTRAINT chk_leads_contact
    CHECK (email IS NOT NULL OR phone IS NOT NULL);

COMMENT ON TABLE leads IS 'Captured leads from FunWheel A-R-T pages and sales pages.';
COMMENT ON COLUMN leads.funwheel_id IS 'Identifier linking to the specific FunWheel instance.';
COMMENT ON COLUMN leads.referral_code IS 'Unique code for referral engine (shared via WhatsApp/link).';
COMMENT ON COLUMN leads.vip_access IS 'Auto-granted when referral_count >= 3 (FunWheel T page unlock).';
COMMENT ON COLUMN leads.source_page IS 'Which page captured the lead: A (apresentacao), R (retencao), T (transformacao), or sales_page.';

-- ============================================================================
-- Table: referrals
-- Purpose: Tracks referral relationships between leads.
--          A refers B → row created → trigger increments A.referral_count.
-- ============================================================================
CREATE TABLE referrals (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_lead_id UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    referred_lead_id UUID        NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_no_self_referral CHECK (referrer_lead_id != referred_lead_id),
    CONSTRAINT uq_referral_pair UNIQUE (referrer_lead_id, referred_lead_id)
);

-- Indexes
CREATE INDEX idx_referrals_referrer ON referrals (referrer_lead_id);
CREATE INDEX idx_referrals_referred ON referrals (referred_lead_id);

-- Trigger: increment referrer's referral_count on insert
CREATE TRIGGER trg_referrals_increment_count
    AFTER INSERT ON referrals
    FOR EACH ROW
    EXECUTE FUNCTION increment_referral_count();

COMMENT ON TABLE referrals IS 'Referral relationships. Insert triggers referrer lead referral_count increment.';

-- ============================================================================
-- Table: agent_execution_log
-- Purpose: Observability log for agent (CMO/Copywriter/Designer) executions.
--          Used for cost tracking, latency monitoring, debugging.
--          Append-only — no updates or deletes expected.
-- ============================================================================
CREATE TABLE agent_execution_log (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    agent         TEXT        NOT NULL
                              CHECK (agent IN ('cmo', 'copywriter', 'designer')),
    action        TEXT        NOT NULL,
    client_id     UUID        REFERENCES clients(id) ON DELETE SET NULL,
    briefing_id   UUID        REFERENCES briefings(id) ON DELETE SET NULL,
    input_hash    TEXT,
    output_hash   TEXT,
    tokens_used   INTEGER     CHECK (tokens_used IS NULL OR tokens_used >= 0),
    latency_ms    INTEGER     CHECK (latency_ms IS NULL OR latency_ms >= 0),
    cost_estimate NUMERIC(10, 6) CHECK (cost_estimate IS NULL OR cost_estimate >= 0),
    model         TEXT,
    error_message TEXT,
    metadata      JSONB       DEFAULT '{}',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes: query patterns = by agent, by client, by time range
CREATE INDEX idx_agent_log_agent ON agent_execution_log (agent);
CREATE INDEX idx_agent_log_client ON agent_execution_log (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_agent_log_created ON agent_execution_log (created_at DESC);
CREATE INDEX idx_agent_log_agent_time ON agent_execution_log (agent, created_at DESC);

COMMENT ON TABLE agent_execution_log IS 'Append-only log of agent executions. Service-role access only (no RLS for end users).';
COMMENT ON COLUMN agent_execution_log.input_hash IS 'SHA-256 of input payload for deduplication/caching.';
COMMENT ON COLUMN agent_execution_log.output_hash IS 'SHA-256 of output payload for integrity verification.';
COMMENT ON COLUMN agent_execution_log.cost_estimate IS 'Estimated USD cost based on token usage and model pricing.';

-- ============================================================================
-- Table: llm_usage_log
-- Purpose: Aggregated LLM token usage and cost per API call.
--          Cross-client: tracks total platform spend.
--          Append-only.
-- ============================================================================
CREATE TABLE llm_usage_log (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    provider      TEXT        NOT NULL,
    model         TEXT        NOT NULL,
    input_tokens  INTEGER     NOT NULL CHECK (input_tokens >= 0),
    output_tokens INTEGER     NOT NULL CHECK (output_tokens >= 0),
    total_cost    NUMERIC(10, 6) NOT NULL CHECK (total_cost >= 0),
    client_id     UUID        REFERENCES clients(id) ON DELETE SET NULL,
    execution_id  UUID        REFERENCES agent_execution_log(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_llm_log_provider ON llm_usage_log (provider);
CREATE INDEX idx_llm_log_created ON llm_usage_log (created_at DESC);
CREATE INDEX idx_llm_log_client ON llm_usage_log (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_llm_log_model_time ON llm_usage_log (model, created_at DESC);

COMMENT ON TABLE llm_usage_log IS 'Append-only LLM API usage log. Tracks tokens and cost per call across all providers.';
COMMENT ON COLUMN llm_usage_log.execution_id IS 'Optional FK to agent_execution_log for correlation.';

-- ============================================================================
-- Table: whatsapp_interactions
-- Purpose: Log of WhatsApp messages via Evolution API.
--          Used for briefing source tracking and conversation history.
-- ============================================================================
CREATE TABLE whatsapp_interactions (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id    UUID        REFERENCES clients(id) ON DELETE SET NULL,
    phone        TEXT        NOT NULL,
    message_type TEXT        NOT NULL,
    direction    TEXT        NOT NULL
                             CHECK (direction IN ('incoming', 'outgoing')),
    content      TEXT,
    metadata     JSONB       DEFAULT '{}',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_whatsapp_phone ON whatsapp_interactions (phone);
CREATE INDEX idx_whatsapp_client ON whatsapp_interactions (client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_whatsapp_created ON whatsapp_interactions (created_at DESC);
CREATE INDEX idx_whatsapp_direction ON whatsapp_interactions (direction, created_at DESC);

COMMENT ON TABLE whatsapp_interactions IS 'WhatsApp message log via Evolution API. Used for briefing tracking.';
COMMENT ON COLUMN whatsapp_interactions.message_type IS 'Message type: text, image, audio, document, etc.';
COMMENT ON COLUMN whatsapp_interactions.content IS 'Message content (text only). Media stored externally.';
