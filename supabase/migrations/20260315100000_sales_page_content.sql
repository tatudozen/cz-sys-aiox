-- Migration: sales_page_content
-- Story 6.2 — AC-4
-- Description: Stores generated sales page content per client/project

CREATE TABLE sales_page_content (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID        REFERENCES clients(id) ON DELETE CASCADE,
  project_plan_id UUID        REFERENCES project_plans(id) ON DELETE SET NULL,
  sections        JSONB       NOT NULL DEFAULT '{}',
  status          TEXT        NOT NULL DEFAULT 'draft'
                              CHECK (status IN ('draft', 'review', 'approved', 'published')),
  brand_compliant BOOLEAN     NOT NULL DEFAULT false,
  lead_count_snapshot INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for client lookup
CREATE INDEX idx_sales_page_content_client ON sales_page_content (client_id);
CREATE INDEX idx_sales_page_content_status ON sales_page_content (status);

-- Trigger: auto-update updated_at
CREATE TRIGGER trg_sales_page_content_updated_at
  BEFORE UPDATE ON sales_page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE sales_page_content ENABLE ROW LEVEL SECURITY;

-- Service role can do anything
CREATE POLICY sp_content_service_all ON sales_page_content
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Authenticated users can read their own client's content (via client membership)
CREATE POLICY sp_content_auth_read ON sales_page_content
  FOR SELECT TO authenticated
  USING (
    client_id IN (
      SELECT client_id FROM client_members WHERE user_id = auth.uid()
    )
  );

COMMENT ON TABLE sales_page_content IS 'Generated sales page content per client. sections is a JSONB with all 9 section keys.';
COMMENT ON COLUMN sales_page_content.sections IS 'Full SalesPageContent JSON: hero, problem, solution, benefits, social_proof, offer, guarantee, faq, final_cta.';
COMMENT ON COLUMN sales_page_content.lead_count_snapshot IS 'Snapshot of leads.count at generation time (for FunWheel social proof copy).';
