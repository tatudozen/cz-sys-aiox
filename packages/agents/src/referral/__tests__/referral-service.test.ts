/**
 * ReferralService Tests — Story 5.4
 * AC-3: Track referrals, increment count
 * AC-4: VIP unlock at threshold
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ReferralService } from '../referral-service.js';
import type { SupabaseReferralClient, LeadRow } from '../referral-service.js';

function buildLeadRow(overrides: Partial<LeadRow> = {}): LeadRow {
  return {
    id: 'lead-a',
    referral_code: 'ABC123',
    referral_count: 0,
    vip_access: false,
    ghl_contact_id: null,
    ...overrides,
  };
}

function createMockSupabase(leadRow: LeadRow | null = buildLeadRow()): SupabaseReferralClient {
  let callCount = 0;
  return {
    from: (table: string) => ({
      select: (_columns: string) => ({
        eq: (_col: string, _val: string | boolean) => ({
          single: vi.fn().mockImplementation(async () => {
            if (table === 'leads') {
              // Second call simulates incremented count
              const count = callCount++ > 0 ? (leadRow?.referral_count ?? 0) + 1 : (leadRow?.referral_count ?? 0);
              if (!leadRow) return { data: null, error: { message: 'not found' } };
              return { data: { ...leadRow, referral_count: count }, error: null };
            }
            return { data: null, error: null };
          }),
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: { id: 'referral-1' }, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  };
}

describe('ReferralService — trackReferral', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when referrer code not found', async () => {
    const supabase = createMockSupabase(null);
    const service = new ReferralService({ supabase });

    await expect(service.trackReferral('NOTFOUND', 'lead-b')).rejects.toThrow('Referrer not found');
  });

  it('creates referral record and returns result', async () => {
    const supabase = createMockSupabase();
    const service = new ReferralService({ supabase });

    const result = await service.trackReferral('ABC123', 'lead-b');

    expect(result.referrer_code).toBe('ABC123');
    expect(result.referrer_lead_id).toBe('lead-a');
    expect(typeof result.referral_count).toBe('number');
    expect(typeof result.vip_unlocked).toBe('boolean');
  });

  it('marks vip_unlocked when count reaches threshold', async () => {
    // Lead A already has 2 referrals; next one triggers VIP
    const lead = buildLeadRow({ referral_count: 2 });
    const supabase = createMockSupabase(lead);
    const mockGhl = {
      addTag: vi.fn().mockResolvedValue(undefined),
      triggerWorkflow: vi.fn().mockResolvedValue(undefined),
      createContact: vi.fn(),
    };

    const service = new ReferralService({ supabase, ghl: mockGhl as never, vipThreshold: 3 });
    const result = await service.trackReferral('ABC123', 'lead-b');

    expect(result.vip_unlocked).toBe(true);
  });

  it('calls GHL addTag and triggerWorkflow on VIP unlock', async () => {
    const lead = buildLeadRow({ referral_count: 2, ghl_contact_id: 'ghl-contact-1' });
    const supabase = createMockSupabase(lead);
    const mockGhl = {
      addTag: vi.fn().mockResolvedValue(undefined),
      triggerWorkflow: vi.fn().mockResolvedValue(undefined),
      createContact: vi.fn(),
    };

    const service = new ReferralService({ supabase, ghl: mockGhl as never, vipThreshold: 3 });
    await service.trackReferral('ABC123', 'lead-b');

    expect(mockGhl.addTag).toHaveBeenCalledWith('ghl-contact-1', 'vip-access');
    expect(mockGhl.triggerWorkflow).toHaveBeenCalledWith('ghl-contact-1', 'vip-welcome');
  });

  it('does not unlock VIP when lead already has vip_access', async () => {
    const lead = buildLeadRow({ referral_count: 5, vip_access: true });
    const supabase = createMockSupabase(lead);
    const mockGhl = {
      addTag: vi.fn().mockResolvedValue(undefined),
      triggerWorkflow: vi.fn().mockResolvedValue(undefined),
      createContact: vi.fn(),
    };

    const service = new ReferralService({ supabase, ghl: mockGhl as never });
    const result = await service.trackReferral('ABC123', 'lead-b');

    expect(result.vip_unlocked).toBe(false);
    expect(mockGhl.addTag).not.toHaveBeenCalled();
  });

  it('does not throw when GHL fails — VIP grant still succeeds', async () => {
    const lead = buildLeadRow({ referral_count: 2, ghl_contact_id: 'ghl-1' });
    const supabase = createMockSupabase(lead);
    const mockGhl = {
      addTag: vi.fn().mockRejectedValue(new Error('GHL down')),
      triggerWorkflow: vi.fn().mockRejectedValue(new Error('GHL down')),
      createContact: vi.fn(),
    };

    const service = new ReferralService({ supabase, ghl: mockGhl as never, vipThreshold: 3 });
    // Should not throw even though GHL fails
    await expect(service.trackReferral('ABC123', 'lead-b')).resolves.not.toThrow();
  });
});

describe('ReferralService — getReferralStatus', () => {
  it('returns status with remaining count', async () => {
    const lead = buildLeadRow({ referral_count: 1 });
    const supabase = createMockSupabase(lead);
    const service = new ReferralService({ supabase, vipThreshold: 3 });

    const status = await service.getReferralStatus('ABC123');

    expect(status.code).toBe('ABC123');
    expect(status.referral_count).toBe(1);
    expect(status.vip_threshold).toBe(3);
    expect(status.remaining).toBe(2);
    expect(status.vip_access).toBe(false);
  });

  it('returns remaining=0 when already VIP', async () => {
    const lead = buildLeadRow({ referral_count: 5, vip_access: true });
    const supabase = createMockSupabase(lead);
    const service = new ReferralService({ supabase });

    const status = await service.getReferralStatus('ABC123');

    expect(status.vip_access).toBe(true);
    expect(status.remaining).toBe(0);
  });

  it('throws when code not found', async () => {
    const supabase = createMockSupabase(null);
    const service = new ReferralService({ supabase });

    await expect(service.getReferralStatus('NOTFOUND')).rejects.toThrow('Lead not found');
  });
});
