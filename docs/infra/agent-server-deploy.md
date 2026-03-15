# Agent Server — Deploy Guide

Story 3.6 — AC-7

O agent server (`copyzen-agents`) roda dentro da rede Docker AZ_Net e é acessível apenas pelo n8n internamente. URL: `http://copyzen-agents:3001`.

---

## Arquitetura

```
Internet → Traefik → n8n
                       ↓ (AZ_Net internal)
                   copyzen-agents:3001
                   (NOT exposed via Traefik)
```

## Pré-requisitos

1. Docker Swarm ativo com rede `AZ_Net` externa
2. Portainer UI acessível
3. Imagem `copyzen-agents:latest` buildada e no registry

## Build da Imagem

```bash
# No servidor de build ou CI:
docker build -f packages/agents/Dockerfile -t copyzen-agents:latest .
docker tag copyzen-agents:latest registry.yourdomain.com/copyzen-agents:latest
docker push registry.yourdomain.com/copyzen-agents:latest
```

## Configuração das Env Vars

Crie o arquivo `/srv/copyzen/agents.env` no servidor (NÃO commitar no git):

```env
CLAUDE_API_KEY=sk-ant-api03-...
CLAUDE_MODEL=claude-sonnet-4-6
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
AGENT_API_KEY=gere-uma-chave-aleatoria-forte
GOOGLE_SERVICE_ACCOUNT_JSON=base64-encoded-json
LLM_PROVIDER=claude
AGENT_PORT=3001
NODE_ENV=production
```

Gerar `AGENT_API_KEY` seguro:
```bash
openssl rand -base64 32
```

## Deploy via Portainer

1. Acesse Portainer → **Stacks** → **Add stack**
2. Nome: `copyzen-agents`
3. Cole o conteúdo de `infra/stacks/copyzen-agents.yml`
4. Clique em **Deploy the stack**

## Verificação

```bash
# Dentro da rede AZ_Net (ex: de um container n8n):
curl http://copyzen-agents:3001/agents/health

# Esperado:
# {
#   "status": "ok",
#   "agents": {"cmo": "ready", "copywriter": "ready", "designer": "ready"},
#   "llm": {"provider": "claude", "status": "connected"},
#   "version": "0.1.0",
#   "timestamp": "..."
# }
```

## Teste via curl (com API key)

```bash
# Análise de briefing:
curl -X POST http://copyzen-agents:3001/agents/cmo/analyze-briefing \
  -H "Content-Type: application/json" \
  -H "X-Agent-API-Key: ${AGENT_API_KEY}" \
  -d '{
    "briefing": {
      "nome_negocio": "Loja X",
      "segmento": "Varejo",
      "publico_alvo": "Adultos 25-40",
      "objetivo_principal": "Aumentar vendas online",
      "canal_comunicacao": "WhatsApp"
    }
  }'

# Sem API key (deve retornar 401):
curl http://copyzen-agents:3001/agents/health
# (retorna 200 — health check não requer auth)

curl -X POST http://copyzen-agents:3001/agents/cmo/analyze-briefing \
  -H "Content-Type: application/json"
# Retorna: {"error": "Unauthorized — invalid or missing X-Agent-API-Key"}
```

## Configuração no n8n

1. Crie credencial **Header Auth** no n8n:
   - Nome: `CopyZen Agents API Key`
   - Header: `X-Agent-API-Key`
   - Value: `{valor do AGENT_API_KEY}`

2. Use em workflows via **HTTP Request** node com URL: `http://copyzen-agents:3001/agents/{agente}/{acao}`

## Rotas Disponíveis

| Method | Path | Agente |
|--------|------|--------|
| GET | `/agents/health` | — |
| POST | `/agents/cmo/analyze-briefing` | CMO |
| POST | `/agents/cmo/create-project-plan` | CMO |
| POST | `/agents/cmo/review-output` | CMO |
| POST | `/agents/cmo/analyze-brand-intel` | CMO |
| POST | `/agents/copywriter/generate-post` | Copywriter |
| POST | `/agents/copywriter/generate-landing-page` | Copywriter |
| POST | `/agents/copywriter/generate-sales-page` | Copywriter |
| POST | `/agents/copywriter/revise` | Copywriter |
| POST | `/agents/designer/generate-image-prompt` | Designer |
| POST | `/agents/designer/apply-brand-theme` | Designer |
| POST | `/agents/designer/select-template` | Designer |

## Rollback

Via Portainer → Stacks → `copyzen-agents` → **Rollback** (reverte para versão anterior da stack).
