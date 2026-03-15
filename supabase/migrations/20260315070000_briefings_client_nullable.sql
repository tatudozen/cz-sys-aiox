-- ============================================================================
-- Migration: 20260315070000_briefings_client_nullable
-- Description: Make briefings.client_id nullable to support intake before
--              client record creation (GHL survey → n8n → briefings).
--              Story 2.1 — AC-4: client_id FK nullable → clients.id
-- Author: Dex (Dev Agent)
-- Date: 2026-03-15
-- Dependencies: 20260314030000_pipeline_tables
-- ============================================================================

-- Drop existing NOT NULL constraint on briefings.client_id
-- A briefing may arrive before the client record is created.
-- The n8n workflow creates the client asynchronously after intake.
ALTER TABLE briefings
    ALTER COLUMN client_id DROP NOT NULL;

-- Also make the FK nullable (drop and re-add as DEFERRABLE)
-- This allows: INSERT briefing with client_id = NULL at intake time,
-- then UPDATE to set client_id once client record is created.
ALTER TABLE briefings
    DROP CONSTRAINT IF EXISTS briefings_client_id_fkey;

ALTER TABLE briefings
    ADD CONSTRAINT briefings_client_id_fkey
    FOREIGN KEY (client_id)
    REFERENCES clients(id)
    ON DELETE SET NULL
    DEFERRABLE INITIALLY DEFERRED;

COMMENT ON COLUMN briefings.client_id IS 'FK to clients. NULL at intake (before client record exists). Set by n8n after client creation.';
