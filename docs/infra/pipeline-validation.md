# Pipeline Validation — Epic 1 End-to-End

Documento de validação do pipeline completo: code → build → rsync → serve.

> **Status:** Aguardando validação manual após deploy inicial no KVM4.

---

## Checklist de Validação (preencher manualmente)

### CI/CD Pipeline

- [ ] Push para `main` dispara GitHub Actions `deploy-kvm4.yml`
- [ ] Job `lint` passa ✅
- [ ] Job `typecheck` passa ✅
- [ ] Job `test` passa ✅
- [ ] Job `build-funwheel` passa ✅
- [ ] Job `deploy` (rsync) passa ✅
- [ ] Tempo total do pipeline: _________ min (meta: < 5 min)

### Site Live

- [ ] `https://fw.copyzen.com.br` carrega sem erros
- [ ] Certificado SSL Let's Encrypt válido ✅
- [ ] Redirect HTTP → HTTPS funciona ✅
- [ ] Conteúdo exibe corretamente (headline, logo, footer)

### Lighthouse Scores (Chrome DevTools ou CLI)

| Critério | Score | Meta |
|----------|-------|------|
| Performance | — | ≥ 90 |
| Accessibility | — | ≥ 90 |
| Best Practices | — | ≥ 90 |
| SEO | — | ≥ 90 |

Para rodar Lighthouse via CLI:
```bash
npx lighthouse https://fw.copyzen.com.br --output=json --only-categories=performance,accessibility,best-practices,seo
```

### Responsividade

- [ ] Mobile (< 768px) — layout adequado
- [ ] Tablet (768-1024px) — layout adequado
- [ ] Desktop (> 1024px) — layout adequado

---

## Data de Validação

| Campo | Valor |
|-------|-------|
| Validado por | Fernando |
| Data | ___/___/___ |
| Commit do deploy | — |
| Pipeline run URL | — |

---

## Artefatos do Build

- **Página:** `packages/funwheel/src/pages/index.astro`
- **Build output:** `packages/funwheel/dist/`
- **Deploy destino:** `/srv/sites/fw.copyzen.com.br/` no KVM4 (`31.97.26.21`)
