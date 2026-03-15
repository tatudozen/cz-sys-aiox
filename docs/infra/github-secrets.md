# GitHub Secrets — CopyZen CI/CD

Configure estes secrets em: **GitHub → Settings → Secrets and variables → Actions**

---

## Deploy KVM4 (FunWheel)

Usados em `.github/workflows/deploy-kvm4.yml`

| Secret | Valor | Onde obter |
|--------|-------|-----------|
| `KVM4_HOST` | `31.97.26.21` | IP fixo da KVM4 |
| `KVM4_USER` | `deploy` | Usuário dedicado criado no KVM4 |
| `KVM4_SSH_KEY` | Chave privada Ed25519 | Ver `docs/infra/ssh-deploy-setup.md` |
| `KVM4_DEPLOY_PATH` | `/srv/sites/fw.copyzen.com.br/` | Diretório raiz do nginx no KVM4 |

## Deploy Vercel (Client Sales Pages)

Usados em `.github/workflows/deploy-vercel.yml`

| Secret | Valor | Onde obter |
|--------|-------|-----------|
| `VERCEL_TOKEN` | Token de acesso | [vercel.com/account/tokens](https://vercel.com/account/tokens) |

## Supabase (para CI com testes de integração futuros)

| Secret | Valor | Onde obter |
|--------|-------|-----------|
| `SUPABASE_URL` | `https://<project-ref>.supabase.co` | Dashboard Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Chave pública anon | Dashboard Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada service_role | Dashboard Supabase → Settings → API |

> ⚠️ **Nunca commitar** valores reais. Usar apenas via GitHub Secrets.

## Anthropic (agentes LLM — futuros)

| Secret | Valor | Onde obter |
|--------|-------|-----------|
| `CLAUDE_API_KEY` | `sk-ant-...` | [console.anthropic.com](https://console.anthropic.com) |
| `AGENT_API_KEY` | Chave compartilhada n8n↔agentes | Gerar com `openssl rand -hex 32` |

---

## Como adicionar um secret

```bash
# Via GitHub CLI
gh secret set KVM4_HOST --body "31.97.26.21"
gh secret set KVM4_SSH_KEY < ~/.ssh/deploy_ed25519
```

Ou via interface web: Settings → Secrets and variables → Actions → New repository secret
