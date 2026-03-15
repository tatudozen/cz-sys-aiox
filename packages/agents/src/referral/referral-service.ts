/**
 * ReferralService — Story 5.4
 * AC-3: Track referrals (create record, increment referrer count)
 * AC-4: VIP unlock when referral_count >= threshold
 */

import type { GoHighLevelClient } from '@copyzen/integrations';

// Minimal Supabase interface (same pattern as BrandConfigLoader)
export interface SupabaseReferralClient {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string | boolean): {
        single(): Promise<{ data: unknown; error: unknown }>;
        limit(n: number): Promise<{ data: unknown[]; error: unknown }>;
      };
      order(column: string, opts?: { ascending?: boolean }): {
        limit(n: number): Promise<{ data: unknown[]; error: unknown }>;
      };
    };
    insert(row: Record<string, unknown>): Promise<{ data: unknown; error: unknown }>;
    update(values: Record<string, unknown>): {
      eq(column: string, value: string): Promise<{ data: unknown; error: unknown }>;
    };
  };
}

export interface LeadRow {
  id: string;
  referral_code: string;
  referral_count: number;
  vip_access: boolean;
  ghl_contact_id?: string | null;
}

export interface ReferralResult {
  referral_id: string | null;
  referrer_code: string;
  referrer_lead_id: string;
  referral_count: number;
  vip_unlocked: boolean;
}

export interface ReferralStatus {
  code: string;
  referral_count: number;
  vip_access: boolean;
  vip_threshold: number;
  remaining: number;
}

export interface ReferralServiceConfig {
  supabase: SupabaseReferralClient;
  ghl?: GoHighLevelClient;
  vipThreshold?: number;
  vipCommunityUrl?: string;
}

export class ReferralService {
  private readonly supabase: SupabaseReferralClient;
  private readonly ghl?: GoHighLevelClient;
  private readonly vipThreshold: number;

  constructor(config: ReferralServiceConfig) {
    this.supabase = config.supabase;
    this.ghl = config.ghl;
    this.vipThreshold = config.vipThreshold ?? 3;
  }

  /**
   * Look up a lead by their referral_code.
   */
  async findLeadByCode(code: string): Promise<LeadRow | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('id,referral_code,referral_count,vip_access,ghl_contact_id')
      .eq('referral_code', code)
      .single();

    if (error || !data) return null;
    return data as LeadRow;
  }

  /**
   * Track a referral: Lead B (referred_lead_id) came via Lead A's referral_code.
   * - Creates a referral record
   * - Increments Lead A's referral_count (DB trigger handles this automatically,
   *   but we also handle it here for correctness)
   * - If count >= threshold: grant VIP + notify GHL
   */
  async trackReferral(referrerCode: string, referredLeadId: string): Promise<ReferralResult> {
    // 1. Find the referrer lead
    const referrer = await this.findLeadByCode(referrerCode);
    if (!referrer) {
      throw new Error(`Referrer not found for code: ${referrerCode}`);
    }

    // 2. Create referral record (DB trigger increments referral_count automatically)
    const { data: referralData, error: insertError } = await this.supabase
      .from('referrals')
      .insert({
        referrer_lead_id: referrer.id,
        referred_lead_id: referredLeadId,
      });

    if (insertError) {
      const msg = (insertError as { message?: string }).message ?? String(insertError);
      // Ignore duplicate referral (idempotent)
      if (!msg.includes('uq_referral_pair')) {
        throw new Error(`Failed to create referral record: ${msg}`);
      }
    }

    // 3. Re-fetch updated referral_count (trigger may have incremented it)
    const updated = await this.findLeadByCode(referrerCode);
    const newCount = updated?.referral_count ?? referrer.referral_count + 1;
    const vipUnlocked = newCount >= this.vipThreshold && !referrer.vip_access;

    // 4. If VIP threshold reached and not yet VIP: update Supabase + notify GHL
    if (vipUnlocked) {
      await this.grantVipAccess(referrer.id, referrer.ghl_contact_id ?? null);
    }

    const referralId = (referralData as { id?: string } | null)?.id ?? null;

    return {
      referral_id: referralId,
      referrer_code: referrerCode,
      referrer_lead_id: referrer.id,
      referral_count: newCount,
      vip_unlocked: vipUnlocked,
    };
  }

  /**
   * Get referral status for a lead code (for the transformacao page UI).
   */
  async getReferralStatus(code: string): Promise<ReferralStatus> {
    const lead = await this.findLeadByCode(code);
    if (!lead) {
      throw new Error(`Lead not found for code: ${code}`);
    }

    return {
      code,
      referral_count: lead.referral_count,
      vip_access: lead.vip_access,
      vip_threshold: this.vipThreshold,
      remaining: Math.max(0, this.vipThreshold - lead.referral_count),
    };
  }

  /**
   * Grant VIP access: update Supabase + add GHL tag + trigger automation.
   */
  private async grantVipAccess(leadId: string, ghlContactId: string | null): Promise<void> {
    // Update Supabase (DB trigger also handles this when referral_count >= 3)
    await this.supabase
      .from('leads')
      .update({ vip_access: true })
      .eq('id', leadId);

    // Notify GHL
    if (this.ghl && ghlContactId) {
      try {
        await this.ghl.addTag(ghlContactId, 'vip-access');
        await this.ghl.triggerWorkflow(ghlContactId, 'vip-welcome');
      } catch (err) {
        // GHL errors should not block VIP grant — log and continue
        console.error('[ReferralService] GHL VIP notification failed:', err);
      }
    }
  }
}
