-- ============================================================================
-- Migration: 20260315060000_storage_assets
-- Description: Create Supabase Storage bucket for client assets
--              (logos, reference images, brand materials)
-- Author: Dex (Dev Agent)
-- Date: 2026-03-15
-- Dependencies: 20260314010000_extensions_and_functions
-- ============================================================================

-- Create assets bucket (public read — logos and reference images are public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assets',
    'assets',
    true,
    5242880, -- 5 MB per file
    ARRAY[
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/svg+xml',
        'image/gif'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policy: public read (authenticated or anon can read public bucket)
CREATE POLICY "assets_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'assets');

-- Storage RLS Policy: authenticated upload (service_role or authenticated users can upload)
CREATE POLICY "assets_service_upload"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'assets');

-- Storage RLS Policy: authenticated update
CREATE POLICY "assets_service_update"
    ON storage.objects FOR UPDATE
    USING (bucket_id = 'assets');

-- Storage RLS Policy: authenticated delete
CREATE POLICY "assets_service_delete"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'assets');

COMMENT ON TABLE storage.buckets IS
    'Storage bucket: assets — public read, service_role write. Stores logos, reference images, brand materials.';
