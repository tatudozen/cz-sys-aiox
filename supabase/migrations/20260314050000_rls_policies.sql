-- ============================================================================
-- Migration: 20260314050000_rls_policies
-- Description: Row Level Security policies for multi-tenant isolation.
--              All tables with client_id get tenant-scoped policies.
--              Observability tables: service_role only.
-- Author: Dara (Data Engineer Agent)
-- Date: 2026-03-14
-- Dependencies: All previous migrations
-- ============================================================================
-- RLS Strategy:
--   - auth.uid() returns the authenticated user's UUID
--   - Each user maps to exactly one client (1:1 via Supabase Auth metadata)
--   - Helper function extracts client_id from JWT claims
--   - Tables with client_id: tenant-scoped (SELECT/INSERT/UPDATE/DELETE)
--   - Observability tables (logs): service_role only — no end-user access
--   - Referrals: scoped through referrer's client_id via leads join
-- ============================================================================

-- ============================================================================
-- Helper: Extract client_id from JWT claims
-- Expects auth.users.raw_app_meta_data.client_id to be set on user creation
-- ============================================================================
CREATE OR REPLACE FUNCTION auth_client_id()
RETURNS UUID AS $$
    SELECT (auth.jwt() -> 'app_metadata' ->> 'client_id')::UUID;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION auth_client_id() IS
    'Extracts client_id from JWT app_metadata. Used in all RLS policies for tenant isolation.';

-- ============================================================================
-- 1. clients — Users can only see/modify their own client record
-- ============================================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY clients_select ON clients
    FOR SELECT USING (id = auth_client_id());

CREATE POLICY clients_update ON clients
    FOR UPDATE USING (id = auth_client_id())
    WITH CHECK (id = auth_client_id());

-- INSERT/DELETE: service_role only (client creation is an admin operation)

-- ============================================================================
-- 2. brand_configs — Tenant-scoped CRUD
-- ============================================================================
ALTER TABLE brand_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY brand_configs_select ON brand_configs
    FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY brand_configs_insert ON brand_configs
    FOR INSERT WITH CHECK (client_id = auth_client_id());

CREATE POLICY brand_configs_update ON brand_configs
    FOR UPDATE USING (client_id = auth_client_id())
    WITH CHECK (client_id = auth_client_id());

CREATE POLICY brand_configs_delete ON brand_configs
    FOR DELETE USING (client_id = auth_client_id());

-- ============================================================================
-- 3. brand_intelligence — Tenant-scoped read + service_role writes
--    (scraping is initiated by n8n/service_role, not by end user)
-- ============================================================================
ALTER TABLE brand_intelligence ENABLE ROW LEVEL SECURITY;

CREATE POLICY brand_intel_select ON brand_intelligence
    FOR SELECT USING (client_id = auth_client_id());

-- INSERT/UPDATE/DELETE: service_role only (n8n writes scraping results)

-- ============================================================================
-- 4. briefings — Tenant-scoped CRUD
-- ============================================================================
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

CREATE POLICY briefings_select ON briefings
    FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY briefings_insert ON briefings
    FOR INSERT WITH CHECK (client_id = auth_client_id());

CREATE POLICY briefings_update ON briefings
    FOR UPDATE USING (client_id = auth_client_id())
    WITH CHECK (client_id = auth_client_id());

-- DELETE: service_role only

-- ============================================================================
-- 5. proposals — Tenant-scoped read + service_role writes
--    (CMO agent generates proposals, client reads them)
-- ============================================================================
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY proposals_select ON proposals
    FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY proposals_update ON proposals
    FOR UPDATE USING (client_id = auth_client_id())
    WITH CHECK (client_id = auth_client_id());

-- INSERT/DELETE: service_role only (CMO agent creates proposals)

-- ============================================================================
-- 6. system_surveys — Tenant-scoped CRUD
-- ============================================================================
ALTER TABLE system_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY system_surveys_select ON system_surveys
    FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY system_surveys_insert ON system_surveys
    FOR INSERT WITH CHECK (client_id = auth_client_id());

CREATE POLICY system_surveys_update ON system_surveys
    FOR UPDATE USING (client_id = auth_client_id())
    WITH CHECK (client_id = auth_client_id());

-- DELETE: service_role only

-- ============================================================================
-- 7. project_plans — Tenant-scoped read + service_role writes
-- ============================================================================
ALTER TABLE project_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY project_plans_select ON project_plans
    FOR SELECT USING (client_id = auth_client_id());

-- INSERT/UPDATE/DELETE: service_role only (CMO agent manages plans)

-- ============================================================================
-- 8. content_outputs — Tenant-scoped read + service_role writes
-- ============================================================================
ALTER TABLE content_outputs ENABLE ROW LEVEL SECURITY;

CREATE POLICY content_outputs_select ON content_outputs
    FOR SELECT USING (client_id = auth_client_id());

-- INSERT/UPDATE/DELETE: service_role only (agents generate content)

-- ============================================================================
-- 9. deliveries — Tenant-scoped read + service_role writes
-- ============================================================================
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY deliveries_select ON deliveries
    FOR SELECT USING (client_id = auth_client_id());

-- INSERT/UPDATE/DELETE: service_role only

-- ============================================================================
-- 10. leads — Tenant-scoped by owning client (CopyZen client who owns the funwheel)
-- ============================================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY leads_select ON leads
    FOR SELECT USING (client_id = auth_client_id());

CREATE POLICY leads_insert ON leads
    FOR INSERT WITH CHECK (client_id = auth_client_id());

-- UPDATE/DELETE: service_role only

-- ============================================================================
-- 11. referrals — Scoped through referrer's client via leads join
-- ============================================================================
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY referrals_select ON referrals
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM leads
             WHERE leads.id = referrals.referrer_lead_id
               AND leads.client_id = auth_client_id()
        )
    );

-- INSERT/UPDATE/DELETE: service_role only (created by lead capture flow)

-- ============================================================================
-- 12. agent_execution_log — SERVICE ROLE ONLY (no end-user access)
-- ============================================================================
ALTER TABLE agent_execution_log ENABLE ROW LEVEL SECURITY;

-- No policies = service_role-only access. RLS enabled blocks all anon/authenticated.

-- ============================================================================
-- 13. llm_usage_log — SERVICE ROLE ONLY (no end-user access)
-- ============================================================================
ALTER TABLE llm_usage_log ENABLE ROW LEVEL SECURITY;

-- No policies = service_role-only access.

-- ============================================================================
-- 14. whatsapp_interactions — SERVICE ROLE ONLY (no end-user access)
-- ============================================================================
ALTER TABLE whatsapp_interactions ENABLE ROW LEVEL SECURITY;

-- No policies = service_role-only access.

-- ============================================================================
-- Summary of RLS strategy:
-- ============================================================================
-- | Table                  | SELECT        | INSERT        | UPDATE        | DELETE        |
-- |------------------------|---------------|---------------|---------------|---------------|
-- | clients                | own record    | service_role  | own record    | service_role  |
-- | brand_configs          | tenant        | tenant        | tenant        | tenant        |
-- | brand_intelligence     | tenant        | service_role  | service_role  | service_role  |
-- | briefings              | tenant        | tenant        | tenant        | service_role  |
-- | proposals              | tenant        | service_role  | tenant        | service_role  |
-- | system_surveys         | tenant        | tenant        | tenant        | service_role  |
-- | project_plans          | tenant        | service_role  | service_role  | service_role  |
-- | content_outputs        | tenant        | service_role  | service_role  | service_role  |
-- | deliveries             | tenant        | service_role  | service_role  | service_role  |
-- | leads                  | tenant        | tenant        | service_role  | service_role  |
-- | referrals              | via leads     | service_role  | service_role  | service_role  |
-- | agent_execution_log    | service_role  | service_role  | service_role  | service_role  |
-- | llm_usage_log          | service_role  | service_role  | service_role  | service_role  |
-- | whatsapp_interactions  | service_role  | service_role  | service_role  | service_role  |
-- ============================================================================
