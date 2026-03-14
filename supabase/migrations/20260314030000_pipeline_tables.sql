-- ============================================================================
-- Migration: 20260314030000_pipeline_tables
-- Description: Pipeline entities — briefings, proposals, system_surveys,
--              project_plans, content_outputs, deliveries
-- Author: Dara (Data Engineer Agent)
-- Date: 2026-03-14
-- Dependencies: 20260314020000_core_tables
-- ============================================================================

-- ============================================================================
-- Table: briefings
-- Purpose: Incoming project briefings from GHL survey or WhatsApp.
--          Entry point of the CopyZen pipeline (Sistema 0).
-- ============================================================================
CREATE TABLE briefings (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id  UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    raw_data   JSONB       NOT NULL,
    source     TEXT        NOT NULL
                           CHECK (source IN ('ghl_survey', 'whatsapp')),
    status     TEXT        NOT NULL DEFAULT 'received'
                           CHECK (status IN (
                               'received', 'processing', 'analyzed',
                               'approved', 'needs_info'
                           )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_briefings_client ON briefings (client_id);
CREATE INDEX idx_briefings_status ON briefings (status);
CREATE INDEX idx_briefings_created ON briefings (created_at DESC);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_briefings_updated_at
    BEFORE UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE briefings IS 'Incoming project briefings. Entry point of CopyZen pipeline (Sistema 0).';
COMMENT ON COLUMN briefings.raw_data IS 'Full survey/WhatsApp responses as JSON. Schema varies by source.';
COMMENT ON COLUMN briefings.source IS 'ghl_survey = GoHighLevel form, whatsapp = Evolution API conversation.';

-- ============================================================================
-- Table: proposals
-- Purpose: CMO agent-generated package proposals based on briefing analysis.
--          One briefing may generate one proposal (CMO recommendation).
-- ============================================================================
CREATE TABLE proposals (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    briefing_id UUID        NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    client_id   UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    package     TEXT        NOT NULL
                            CHECK (package IN (
                                'ia', 'art', 'e',
                                'combo_leads', 'combo_cash'
                            )),
    reasoning   TEXT        NOT NULL,
    timeline    TEXT,
    cost_range  TEXT,
    status      TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'sent', 'approved', 'rejected')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_proposals_briefing ON proposals (briefing_id);
CREATE INDEX idx_proposals_client ON proposals (client_id);
CREATE INDEX idx_proposals_status ON proposals (status);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_proposals_updated_at
    BEFORE UPDATE ON proposals
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE proposals IS 'CMO agent package proposals. Each briefing yields one recommended package.';
COMMENT ON COLUMN proposals.package IS 'Package types: ia, art, e, combo_leads, combo_cash (per PRD FR-07).';
COMMENT ON COLUMN proposals.reasoning IS 'CMO agent justification for the chosen package.';

-- ============================================================================
-- Table: system_surveys
-- Purpose: Deep-dive surveys per system (content/funwheel/sales_page).
--          Collected after proposal approval to gather system-specific details.
-- ============================================================================
CREATE TABLE system_surveys (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    briefing_id UUID        NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    client_id   UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    system      TEXT        NOT NULL
                            CHECK (system IN ('content', 'funwheel', 'sales_page')),
    responses   JSONB       NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'received'
                            CHECK (status IN ('received', 'processing', 'complete')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_system_surveys_briefing ON system_surveys (briefing_id);
CREATE INDEX idx_system_surveys_client ON system_surveys (client_id);
CREATE UNIQUE INDEX idx_system_surveys_briefing_system ON system_surveys (briefing_id, system);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_system_surveys_updated_at
    BEFORE UPDATE ON system_surveys
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE system_surveys IS 'System-specific deep-dive surveys. One per briefing per system.';
COMMENT ON COLUMN system_surveys.system IS 'Which CopyZen system: content (S1), funwheel (S2), sales_page (S3).';
COMMENT ON COLUMN system_surveys.responses IS 'Survey answers as JSON. Schema varies by system type.';

-- ============================================================================
-- Table: project_plans
-- Purpose: Execution plans generated by CMO after surveys are complete.
--          Contains which systems to execute and with what parameters.
-- ============================================================================
CREATE TABLE project_plans (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    briefing_id UUID        NOT NULL REFERENCES briefings(id) ON DELETE CASCADE,
    client_id   UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    package     TEXT        NOT NULL
                            CHECK (package IN (
                                'ia', 'art', 'e',
                                'combo_leads', 'combo_cash'
                            )),
    systems     JSONB       NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_project_plans_briefing ON project_plans (briefing_id);
CREATE INDEX idx_project_plans_client ON project_plans (client_id);
CREATE INDEX idx_project_plans_status ON project_plans (status);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_project_plans_updated_at
    BEFORE UPDATE ON project_plans
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE project_plans IS 'CMO-generated execution plans. Drives n8n workflow orchestration.';
COMMENT ON COLUMN project_plans.systems IS 'Array of SystemPlan: [{system, config, deliverables}].';
COMMENT ON COLUMN project_plans.status IS 'cancelled = client withdrew after approval.';

-- ============================================================================
-- Table: content_outputs
-- Purpose: Generated content pieces (posts) from Sistema 1.
--          Each row is one post within a project plan.
-- ============================================================================
CREATE TABLE content_outputs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_plan_id UUID        NOT NULL REFERENCES project_plans(id) ON DELETE CASCADE,
    client_id       UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    post_index      INTEGER     NOT NULL CHECK (post_index >= 1),
    type            TEXT        NOT NULL
                                CHECK (type IN ('carousel', 'image')),
    mode            TEXT        NOT NULL
                                CHECK (mode IN ('inception', 'atracao_fatal')),
    copy            JSONB       NOT NULL,
    image_prompt    TEXT,
    image_url       TEXT,
    status          TEXT        NOT NULL DEFAULT 'generating'
                                CHECK (status IN (
                                    'generating', 'review', 'approved', 'delivered'
                                )),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_content_outputs_plan ON content_outputs (project_plan_id);
CREATE INDEX idx_content_outputs_client ON content_outputs (client_id);
CREATE INDEX idx_content_outputs_status ON content_outputs (status);
CREATE UNIQUE INDEX idx_content_outputs_plan_index ON content_outputs (project_plan_id, post_index);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_content_outputs_updated_at
    BEFORE UPDATE ON content_outputs
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE content_outputs IS 'Generated content pieces from Sistema 1 (Content Gen).';
COMMENT ON COLUMN content_outputs.mode IS 'inception = educational, atracao_fatal = high-impact emotional.';
COMMENT ON COLUMN content_outputs.copy IS 'JSON with post copy: {headline, body, cta, hashtags, caption}.';
COMMENT ON COLUMN content_outputs.post_index IS 'Sequential index within the project plan (1-based).';

-- ============================================================================
-- Table: deliveries
-- Purpose: Final delivery records. Tracks what was sent to the client.
-- ============================================================================
CREATE TABLE deliveries (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    project_plan_id UUID        NOT NULL REFERENCES project_plans(id) ON DELETE CASCADE,
    client_id       UUID        NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    drive_folder_url TEXT       NOT NULL,
    files_count     INTEGER     NOT NULL CHECK (files_count >= 1),
    delivered_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_deliveries_plan ON deliveries (project_plan_id);
CREATE INDEX idx_deliveries_client ON deliveries (client_id);
CREATE INDEX idx_deliveries_delivered ON deliveries (delivered_at DESC);

COMMENT ON TABLE deliveries IS 'Final delivery records. Google Drive folder link + file count per project.';
COMMENT ON COLUMN deliveries.drive_folder_url IS 'Google Drive shared folder URL for the client.';
