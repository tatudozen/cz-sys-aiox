# Deploy via Portainer — CopyZen Stacks

Guia para deployar os stacks Docker do CopyZen na KVM4 via Portainer UI.

> **CRÍTICO:** Deploy de stacks Docker é EXCLUSIVAMENTE via Portainer UI — NUNCA via GitHub Actions (NFR-15).

---

## Pré-requisitos

Antes de fazer o deploy:

- [ ] GitHub Actions `deploy-kvm4.yml` executou com sucesso (rsync dos arquivos estáticos para `/srv/sites/fw.copyzen.com.br/`)
- [ ] Diretório `/srv/sites/fw.copyzen.com.br/` existe no KVM4
- [ ] DNS `fw.copyzen.com.br` apontando para `31.97.26.21`
- [ ] Traefik rodando na KVM4 com certresolver `letsencryptresolver`
- [ ] Rede Docker overlay `AZ_Net` criada no Swarm

---

## 1. Criar diretório no KVM4 (ação manual)

Conecte ao KVM4 e crie o diretório placeholder:

```bash
ssh root@31.97.26.21

# Criar diretório e index.html placeholder
mkdir -p /srv/sites/fw.copyzen.com.br
cat > /srv/sites/fw.copyzen.com.br/index.html <<EOF
<!DOCTYPE html>
<html><head><title>CopyZen FunWheel</title></head>
<body><h1>CopyZen FunWheel</h1><p>Em breve...</p></body>
</html>
EOF

chown -R deploy:deploy /srv/sites/fw.copyzen.com.br
chmod 755 /srv/sites/fw.copyzen.com.br
```

---

## 2. Configurar DNS

No painel do seu registrador de domínio, adicione:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `fw` | `31.97.26.21` | 300 |

Aguarde propagação (5-30 minutos). Verificar com:

```bash
dig fw.copyzen.com.br A
# Deve retornar: 31.97.26.21
```

---

## 3. Deploy via Portainer

### 3.1 Acessar Portainer

1. Abra o Portainer no browser (ex: `https://portainer.seudominio.com`)
2. Faça login como administrador
3. Selecione o environment **KVM4** (ou primary)

### 3.2 Criar novo stack

1. No menu lateral: **Stacks → Add stack**
2. Nome: `copyzen-funwheel`
3. Em **Build method**: selecione **Web editor**
4. Cole o conteúdo de `infra/stacks/copyzen-funwheel.yml`

### 3.3 Deploy do stack

1. Clique em **Deploy the stack**
2. Aguarde o status mudar para **Running**
3. Verifique em **Containers** que `copyzen-funwheel_copyzen-fw` está healthy

---

## 4. Verificar serviço

```bash
# Verificar serviço no Swarm
ssh root@31.97.26.21 docker service ls | grep copyzen

# Verificar logs do serviço
ssh root@31.97.26.21 docker service logs copyzen-funwheel_copyzen-fw

# Testar acesso direto (sem SSL)
curl -H "Host: fw.copyzen.com.br" http://31.97.26.21
```

Verificar SSL no browser: `https://fw.copyzen.com.br`
- Deve carregar com certificado Let's Encrypt válido ✅
- HTTP deve redirecionar para HTTPS automaticamente ✅

---

## 5. Rollback

Se algo der errado:

### Via Portainer UI

1. Stacks → `copyzen-funwheel`
2. Clique em **Stop this stack** para parar
3. Edite o YAML se necessário
4. Clique em **Update the stack** para re-deployar

### Via CLI na KVM4

```bash
ssh root@31.97.26.21

# Remover stack
docker stack rm copyzen-funwheel

# Aguardar remoção completa
docker service ls

# Re-deployar (após correção)
docker stack deploy -c /tmp/copyzen-funwheel.yml copyzen-funwheel
```

---

## Stack: copyzen-sales (Story 6.3)

> **NÃO DEPLOYAR AINDA** — o stack `infra/stacks/copyzen-sales.yml` está preparado para a Story 6.3 (Client Sales Pages).

Quando chegar a Story 6.3:
1. Criar diretório `/srv/sites/sales.copyzen.com.br/` no KVM4
2. Configurar DNS `sales.copyzen.com.br → 31.97.26.21`
3. Seguir os mesmos passos acima com `copyzen-sales.yml`

---

## Diagrama de Fluxo

```
GitHub Actions (push)
    └── rsync → /srv/sites/fw.copyzen.com.br/ (KVM4)
                         ↑
                nginx:alpine (Docker Swarm service)
                    └── volume bind: /srv/sites/fw.copyzen.com.br:/usr/share/nginx/html:ro
                         ↓
                  Traefik (reverse proxy + SSL)
                    └── fw.copyzen.com.br → nginx → arquivos estáticos
```
