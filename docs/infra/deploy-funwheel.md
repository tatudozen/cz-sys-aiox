# FunWheel Deploy Guide

Story 5.6 — Multi-tenant FunWheel deployment for KVM4 (CopyZen) and Vercel (clients).

## Overview

| Target | Use Case | URL Pattern | Auth |
|--------|----------|-------------|------|
| **KVM4** | CopyZen (self-hosted) | `https://fw.copyzen.com.br` | SSH + rsync |
| **Vercel** | Client deployments | `https://{client_slug}.vercel.app` | Vercel CLI + token |

## Build Script

```bash
# KVM4 (CopyZen)
npx tsx packages/funwheel/scripts/build.ts --target kvm4 --client copyzen

# Vercel (client)
npx tsx packages/funwheel/scripts/build.ts --target vercel --client acme-corp
```

**What the build script does:**
1. Writes `packages/funwheel/.env` with target-specific env vars
2. Runs `npm run build` in `packages/funwheel`
3. Writes deploy metadata to `packages/funwheel/dist/.meta/deploy.json`
4. Prints the deploy command for the target

## KVM4 Deploy (CopyZen)

### Prerequisites
- SSH key configured for `deploy@kvm4.server`
- Nginx serving `/srv/sites/fw.copyzen.com.br/`
- Traefik handling SSL for `fw.copyzen.com.br`

### Steps

```bash
# 1. Build
npx tsx packages/funwheel/scripts/build.ts --target kvm4 --client copyzen

# 2. Sync to server
rsync -avz --delete packages/funwheel/dist/ deploy@kvm4.server:/srv/sites/fw.copyzen.com.br/

# 3. Reload nginx
ssh deploy@kvm4.server "sudo nginx -s reload"
```

### Environment Variables (KVM4)

```
PUBLIC_FUNWHEEL_BASE_URL=https://fw.copyzen.com.br
PUBLIC_API_BASE_URL=http://copyzen-agents:3001  # internal Docker network
PUBLIC_CLIENT_SLUG=copyzen
```

## Vercel Deploy (Clients)

### Preview → Approve → Production Workflow (AC-4)

1. **Fernando triggers preview deploy** via GitHub Actions:
   ```
   Actions → Deploy FunWheel → Vercel (Client) → Run workflow
   client_slug: acme-corp
   environment: preview
   ```

2. **Share preview URL** with client for approval.

3. **After approval, trigger production deploy:**
   ```
   Actions → Deploy FunWheel → Vercel (Client) → Run workflow
   client_slug: acme-corp
   environment: production
   ```

### Manual Vercel Deploy

```bash
# 1. Build for Vercel
npx tsx packages/funwheel/scripts/build.ts --target vercel --client acme-corp

# 2. Preview deploy
cd packages/funwheel && vercel --yes

# 3. Production deploy (after client approval)
cd packages/funwheel && vercel --prod --yes
```

### vercel.json per Client

Create `packages/funwheel/vercel.json` from `infra/vercel/vercel.json.template`:

```bash
sed -e 's/{{CLIENT_SLUG}}/acme-corp/g' \
    -e 's|{{API_BASE_URL}}|https://api.copyzen.com.br|g' \
    infra/vercel/vercel.json.template > packages/funwheel/vercel.json
```

### Required Secrets (GitHub)

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |

### Environment Variables (Vercel)

Configure per project in Vercel dashboard or via CLI:

```
PUBLIC_FUNWHEEL_BASE_URL=https://acme-corp.vercel.app
PUBLIC_API_BASE_URL=https://api.copyzen.com.br
PUBLIC_CLIENT_SLUG=acme-corp
```

## Adding a New Client

1. Ensure client pages exist in `packages/funwheel/src/pages/{client_slug}/`
2. Build and deploy: `npx tsx packages/funwheel/scripts/build.ts --target vercel --client {slug}`
3. Or use the GitHub Actions workflow dispatch

## Rollback

### KVM4
```bash
# Restore previous dist from git
git checkout HEAD~1 -- packages/funwheel/dist
rsync -avz --delete packages/funwheel/dist/ deploy@kvm4.server:/srv/sites/fw.copyzen.com.br/
```

### Vercel
Use Vercel dashboard → Deployments → select previous deployment → Redeploy.
