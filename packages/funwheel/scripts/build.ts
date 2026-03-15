#!/usr/bin/env tsx
/**
 * FunWheel Multi-target Build Script
 * Story 5.6 — AC-1
 *
 * Usage:
 *   npx tsx packages/funwheel/scripts/build.ts --target kvm4 --client copyzen
 *   npx tsx packages/funwheel/scripts/build.ts --target vercel --client acme-corp
 *
 * Injects correct base URL and API endpoint for each deployment target.
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

if (!target || !['kvm4', 'vercel'].includes(target)) {
  console.error('Usage: build.ts --target kvm4|vercel [--client <slug>]');
  process.exit(1);
}

// --- Target config ---
interface TargetConfig {
  funwheelBaseUrl: string;
  apiBaseUrl: string;
  site: string;
}

const configs: Record<string, TargetConfig> = {
  kvm4: {
    funwheelBaseUrl: 'https://fw.copyzen.com.br',
    apiBaseUrl: 'http://copyzen-agents:3001',
    site: '/srv/sites/fw.copyzen.com.br',
  },
  vercel: {
    funwheelBaseUrl: `https://${clientSlug}.vercel.app`,
    apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.copyzen.com.br',
    site: `https://${clientSlug}.vercel.app`,
  },
};

const config = configs[target] as TargetConfig;
const funwheelDir = join(process.cwd(), 'packages', 'funwheel');

console.log(`[build] Target: ${target} | Client: ${clientSlug}`);
console.log(`[build] FunWheel URL: ${config.funwheelBaseUrl}`);
console.log(`[build] API URL: ${config.apiBaseUrl}`);

// --- Write .env for Astro build ---
const envContent = [
  `PUBLIC_FUNWHEEL_BASE_URL=${config.funwheelBaseUrl}`,
  `PUBLIC_API_BASE_URL=${config.apiBaseUrl}`,
  `PUBLIC_CLIENT_SLUG=${clientSlug}`,
].join('\n') + '\n';

const envPath = join(funwheelDir, '.env');
writeFileSync(envPath, envContent, 'utf-8');
console.log(`[build] Wrote ${envPath}`);

// --- Run Astro build (npm, not shell — args are fixed strings, not user input) ---
console.log('[build] Building Astro site...');
execFileSync('npm', ['run', 'build'], { cwd: funwheelDir, stdio: 'inherit' });

// --- Post-build: write deploy metadata ---
const distDir = join(funwheelDir, 'dist');
if (!existsSync(distDir)) {
  console.error('[build] dist/ not found after build');
  process.exit(1);
}

const meta = {
  target,
  client_slug: clientSlug,
  funwheel_base_url: config.funwheelBaseUrl,
  api_base_url: config.apiBaseUrl,
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
  console.log('  rsync -avz --delete packages/funwheel/dist/ deploy@kvm4.server:/srv/sites/fw.copyzen.com.br/');
  console.log('  Then reload nginx: ssh deploy@kvm4.server "sudo nginx -s reload"');
}

// --- Vercel: print vercel command ---
if (target === 'vercel') {
  console.log('\n[build] Vercel deploy commands:');
  console.log('  # Preview:');
  console.log('  cd packages/funwheel && vercel --yes');
  console.log('  # Production:');
  console.log('  cd packages/funwheel && vercel --prod --yes');
}
