# Lighthouse Audit — Sales Page (NFR-01)

**Story 6.3 — AC-5, AC-6**

## Target Score

| Category | Target | Notes |
|----------|--------|-------|
| Performance | ≥ 90 | SSG static HTML, minimal JS |
| Accessibility | ≥ 90 | Semantic HTML, aria labels |
| Best Practices | ≥ 90 | HTTPS, secure headers |
| SEO | ≥ 90 | Meta tags, OG tags |

## Running Locally

```bash
# Build the site
npx tsx packages/sales-page/scripts/build.ts --target kvm4 --client copyzen

# Preview (requires astro preview or local HTTP server)
npm run preview -w packages/sales-page
# → http://localhost:4322

# Run Lighthouse CLI
npx lighthouse http://localhost:4322 \
  --output html \
  --output-path docs/qa/lighthouse-sales-page.html \
  --only-categories performance,accessibility,best-practices,seo
```

## Running in CI (GitHub Actions)

```yaml
- name: Lighthouse Audit
  uses: treosh/lighthouse-ci-action@v12
  with:
    urls: |
      https://venda.copyzen.com.br
    configPath: '.lighthouserc.json'
    uploadArtifacts: true
```

`.lighthouserc.json`:
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}],
        "categories:best-practices": ["error", {"minScore": 0.9}],
        "categories:seo": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

## Expected Results

The sales page achieves high Lighthouse scores because:

1. **Performance**: Astro SSG generates pure HTML/CSS — no client-side framework overhead. Only vanilla JS for scroll progress bar (~200 bytes inline). All fonts preloaded via `<link rel="preconnect">`.

2. **Accessibility**: `<details>/<summary>` FAQ (keyboard navigable), semantic section tags (`<section>`, `<article>`), `aria-label` on CTAs, sufficient color contrast from brand theme.

3. **Best Practices**: HTTPS (nginx/Vercel), no mixed content, modern image formats.

4. **SEO**: `<title>`, `<meta description>`, Open Graph tags in BaseLayout.

## Remediation Checklist (if score < 90)

- [ ] **Performance < 90**: Check for render-blocking resources, large images. Run `npx astro build` and inspect `dist/` for unoptimized assets.
- [ ] **Accessibility < 90**: Add missing `alt` text, check color contrast (`--sp-primary` vs white text ≥ 4.5:1).
- [ ] **SEO < 90**: Verify `<title>` and `<meta description>` are present and not empty in `index.astro`.
