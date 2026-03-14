-- ============================================================================
-- Migration: 20260314010000_extensions_and_functions
-- Description: Enable required extensions and create shared utility functions
-- Author: Dara (Data Engineer Agent)
-- Date: 2026-03-14
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram indexes for text search

-- ============================================================================
-- Function: auto-update updated_at on row modification
-- Usage: CREATE TRIGGER ... BEFORE UPDATE ... EXECUTE FUNCTION set_updated_at();
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_updated_at() IS
    'Auto-updates updated_at column to current timestamp on row modification';

-- ============================================================================
-- Function: increment referral_count on leads when a new referral is created
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_referral_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE leads
       SET referral_count = referral_count + 1
     WHERE id = NEW.referrer_lead_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_referral_count() IS
    'Increments referrer lead referral_count when a new referral row is inserted';

-- ============================================================================
-- Function: auto-grant VIP access when referral_count >= 3
-- ============================================================================
CREATE OR REPLACE FUNCTION check_vip_access()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_count >= 3 AND NOT NEW.vip_access THEN
        NEW.vip_access = true;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_vip_access() IS
    'Auto-grants vip_access when lead reaches 3+ referrals (FunWheel T page)';
