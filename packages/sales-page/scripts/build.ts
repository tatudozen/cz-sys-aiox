#!/usr/bin/env tsx
/**
 * Sales Page Multi-target Build Script
 * Story 6.3 — AC-1, AC-2, AC-3
 *
 * Usage:
 *   npx tsx packages/sales-page/scripts/build.ts --target kvm4 --client copyzen
 *   npx tsx packages/sales-page/scripts/build.ts --target vercel --client acme-corp
 *
 * Fetches approved sales_page_content from Supabase, applies brand config,
 * writes client-content.json, builds Astro static site, outputs deploy instructions.
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// --- CLI args ---
const args = process.argv.slice(2);

function getArg(name: string): string | undefined {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] : undefined;
}

const target = getArg('target');
const clientSlug = getArg('client') ?? 'copyzen';
const clientId = getArg('client-id'); // optional: Supabase client UUID

if (!target || !['kvm4', 'vercel'].includes(target)) {
  console.error('Usage: build.ts --target kvm4|vercel [--client <slug>] [--client-id <uuid>]');
  process.exit(1);
}

// --- Supabase config (from env) ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

const salesPageDir = join(process.cwd(), 'packages', 'sales-page');
const contentDataPath = join(salesPageDir, 'src', 'data', 'client-content.json');

// --- Target config ---
interface TargetConfig {
  salesBaseUrl: string;
  remoteDir: string;
}

const configs: Record<string, TargetConfig> = {
  kvm4: {
    salesBaseUrl: 'https://venda.copyzen.com.br',
    remoteDir: '/srv/sites/venda.copyzen.com.br',
  },
  vercel: {
    salesBaseUrl: `https://${clientSlug}-sales.vercel.app`,
    remoteDir: `https://${clientSlug}-sales.vercel.app`,
  },
};

const config = configs[target] as TargetConfig;

console.log(`[build] Target: ${target} | Client: ${clientSlug}`);
console.log(`[build] Sales URL: ${config.salesBaseUrl}`);

// --- Fetch content from Supabase (if configured) ---
async function fetchFromSupabase(): Promise<object | null> {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[build] SUPABASE_URL / SUPABASE_SERVICE_KEY not set — using existing client-content.json');
    return null;
  }

  // Fetch brand_config by client_id or by querying by slug (via clients table)
  const brandUrl = clientId
    ? `${supabaseUrl}/rest/v1/brand_configs?client_id=eq.${clientId}&select=*&limit=1`
    : `${supabaseUrl}/rest/v1/brand_configs?select=*&limit=1`;

  const headers = {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    Accept: 'application/json',
  };

  const [brandRes, contentRes] = await Promise.all([
    fetch(brandUrl, { headers }),
    fetch(
      clientId
        ? `${supabaseUrl}/rest/v1/sales_page_content?client_id=eq.${clientId}&status=eq.approved&select=*&limit=1&order=created_at.desc`
        : `${supabaseUrl}/rest/v1/sales_page_content?status=eq.approved&select=*&limit=1&order=created_at.desc`,
      { headers },
    ),
  ]);

  if (!brandRes.ok || !contentRes.ok) {
    console.warn(`[build] Supabase fetch failed (brand: ${brandRes.status}, content: ${contentRes.status}) — using existing data`);
    return null;
  }

  const brandArr: Array<{ primary_color?: string; secondary_color?: string; accent_color?: string; tone_of_voice?: string; company_name?: string }> = await brandRes.json() as Array<{ primary_color?: string; secondary_color?: string; accent_color?: string; tone_of_voice?: string; company_name?: string }>;
  const contentArr: Array<{ sections: object }> = await contentRes.json() as Array<{ sections: object }>;

  if (!contentArr.length) {
    console.warn('[build] No approved sales_page_content found — using existing demo data');
    return null;
  }

  const brand = brandArr[0] ?? {};
  const sections = contentArr[0].sections;

  return {
    client_slug: clientSlug,
    title: 'Página de Vendas',
    description: 'Gerada automaticamente pelo CopyZen',
    brand: {
      primary_color: brand.primary_color,
      secondary_color: brand.secondary_color,
      accent_color: brand.accent_color,
    },
    sections,
  };
}

// --- Main build flow ---
const fetched = await fetchFromSupabase();

if (fetched) {
  writeFileSync(contentDataPath, JSON.stringify(fetched, null, 2) + '\n', 'utf-8');
  console.log(`[build] Wrote Supabase content → ${contentDataPath}`);
} else {
  console.log(`[build] Using existing demo content from ${contentDataPath}`);
}

// --- Run Astro build ---
console.log('[build] Building Astro site...');
execFileSync('npm', ['run', 'build'], { cwd: salesPageDir, stdio: 'inherit' });

// --- Post-build metadata ---
const distDir = join(salesPageDir, 'dist');
if (!existsSync(distDir)) {
  console.error('[build] dist/ not found after build');
  process.exit(1);
}

const meta = {
  target,
  client_slug: clientSlug,
  sales_base_url: config.salesBaseUrl,
  content_source: fetched ? 'supabase' : 'demo',
  built_at: new Date().toISOString(),
};

mkdirSync(join(distDir, '.meta'), { recursive: true });
writeFileSync(
  join(distDir, '.meta', 'deploy.json'),
  JSON.stringify(meta, null, 2) + '\n',
  'utf-8',
);

console.log(`[build] ✓ Build complete → ${distDir}`);
console.log(`[build] Deploy metadata: ${JSON.stringify(meta)}`);

// --- KVM4: print rsync command ---
if (target === 'kvm4') {
  console.log('\n[build] KVM4 deploy command:');
  console.log(`  rsync -avz --delete packages/sales-page/dist/ deploy@kvm4.server:${config.remoteDir}/`);
  console.log('  Then reload nginx: ssh deploy@kvm4.server "sudo nginx -s reload"');
}

// --- Vercel: print vercel commands ---
if (target === 'vercel') {
  console.log('\n[build] Vercel deploy commands:');
  console.log('  # Preview:');
  console.log('  cd packages/sales-page && vercel --yes');
  console.log('  # Production:');
  console.log('  cd packages/sales-page && vercel --prod --yes');
}
