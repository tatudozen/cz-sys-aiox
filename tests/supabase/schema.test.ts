/**
 * Supabase Schema Integration Tests — Story 1.2
 *
 * Tests validate:
 * - clients + brand_configs table structure and FK constraints
 * - RLS: anon access is blocked
 * - Service role key has full access
 *
 * REQUIREMENTS:
 *   Set env vars before running:
 *     SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *
 * To run:
 *   SUPABASE_URL=... SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... npm test -- --testPathPattern=supabase
 */

import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

const hasCredentials = Boolean(supabaseUrl && serviceKey && anonKey);

describe.skipIf(!hasCredentials)('Supabase Schema — clients + brand_configs', () => {
  let serviceClient: SupabaseClient;
  let anonClient: SupabaseClient;
  let testClientId: string;

  beforeAll(() => {
    serviceClient = createClient(supabaseUrl!, serviceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    anonClient = createClient(supabaseUrl!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  });

  afterAll(async () => {
    // Cleanup: cascade delete removes brand_config automatically
    if (testClientId) {
      await serviceClient.from('clients').delete().eq('id', testClientId);
    }
  });

  it('inserts a client with all required fields', async () => {
    const { data, error } = await serviceClient
      .from('clients')
      .insert({
        name: 'Test Client AIOX',
        email: `test-${Date.now()}@aiox-test.dev`,
        phone: '+55 11 99999-0000',
        business_type: 'ecommerce',
        status: 'onboarding',
      })
      .select('id, name, email, status, created_at')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.name).toBe('Test Client AIOX');
    expect(data!.status).toBe('onboarding');
    expect(data!.created_at).toBeTruthy();

    testClientId = data!.id;
  });

  it('inserts brand_config with FK to client', async () => {
    expect(testClientId).toBeDefined();

    const { data, error } = await serviceClient
      .from('brand_configs')
      .insert({
        client_id: testClientId,
        primary_color: '#FF5500',
        secondary_color: '#0055FF',
        accent_color: '#FFD700',
        background_color: '#FFFFFF',
        text_color: '#1A1A1A',
        heading_font: 'Inter',
        body_font: 'Inter',
        tone_of_voice: 'casual',
        keywords: ['inovação', 'qualidade'],
        reference_images: [],
      })
      .select('id, client_id, primary_color, tone_of_voice')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.client_id).toBe(testClientId);
    expect(data!.primary_color).toBe('#FF5500');
    expect(data!.tone_of_voice).toBe('casual');
  });

  it('queries brand_config via service role and returns correct data', async () => {
    const { data, error } = await serviceClient
      .from('brand_configs')
      .select('*, clients(name, email)')
      .eq('client_id', testClientId)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.keywords).toEqual(['inovação', 'qualidade']);
  });

  it('blocks anon access to clients table (RLS)', async () => {
    const { data } = await anonClient
      .from('clients')
      .select('*')
      .limit(5);

    // RLS returns empty data (not an error) for anon without matching policy
    expect(data).toEqual([]);
  });

  it('blocks anon access to brand_configs table (RLS)', async () => {
    const { data } = await anonClient
      .from('brand_configs')
      .select('*')
      .limit(5);

    expect(data).toEqual([]);
  });

  it('rejects invalid tone_of_voice (CHECK constraint)', async () => {
    const { error } = await serviceClient
      .from('brand_configs')
      .insert({
        client_id: testClientId,
        primary_color: '#000000',
        background_color: '#FFFFFF',
        text_color: '#000000',
        heading_font: 'Arial',
        body_font: 'Arial',
        tone_of_voice: 'aggressive', // invalid
      });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/violates check constraint|invalid input/i);
  });

  it('rejects brand_config with non-existent client_id (FK)', async () => {
    const { error } = await serviceClient
      .from('brand_configs')
      .insert({
        client_id: '00000000-0000-0000-0000-000000000000',
        primary_color: '#000000',
        background_color: '#FFFFFF',
        text_color: '#000000',
        heading_font: 'Arial',
        body_font: 'Arial',
        tone_of_voice: 'formal',
      });

    expect(error).not.toBeNull();
    expect(error!.message).toMatch(/foreign key|violates/i);
  });
});

describe('Supabase Schema — offline validation', () => {
  it('skips integration tests when credentials are not set', () => {
    if (!hasCredentials) {
      console.log(
        '⚠️  Supabase integration tests skipped: set SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY to run'
      );
    }
    expect(true).toBe(true);
  });
});
