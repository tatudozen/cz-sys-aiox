# SSH Deploy Setup — KVM4

Guia para configurar o usuário `deploy` na KVM4 com acesso restrito, usado pelo GitHub Actions para rsync.

---

## 1. Gerar par de chaves SSH Ed25519

Execute no seu local:

```bash
ssh-keygen -t ed25519 -C "deploy@copyzen-github-actions" -f ~/.ssh/deploy_ed25519 -N ""
```

Isso gera:
- `~/.ssh/deploy_ed25519` — chave **privada** (vai para GitHub Secret `KVM4_SSH_KEY`)
- `~/.ssh/deploy_ed25519.pub` — chave **pública** (vai para o KVM4)

---

## 2. Criar usuário `deploy` no KVM4

Conecte ao KVM4 como root:

```bash
ssh root@31.97.26.21
```

Crie o usuário com acesso restrito:

```bash
# Criar usuário sem shell interativo
adduser --disabled-password --gecos "" deploy
usermod -s /usr/sbin/nologin deploy

# Criar diretório do site
mkdir -p /srv/sites/fw.copyzen.com.br
chown deploy:deploy /srv/sites/fw.copyzen.com.br
chmod 755 /srv/sites/fw.copyzen.com.br

# Criar diretório .ssh
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chmod 600 /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
```

---

## 3. Adicionar chave pública no KVM4

```bash
# No KVM4, adicionar a chave pública gerada no passo 1
echo "CONTEÚDO_DA_CHAVE_PUBLICA" >> /home/deploy/.ssh/authorized_keys
```

Ou copie diretamente do local:

```bash
# Do seu local, copie a chave pública para o KVM4
ssh-copy-id -i ~/.ssh/deploy_ed25519.pub deploy@31.97.26.21
```

---

## 4. Configurar rsync apenas para /srv/sites/

Para restringir o usuário `deploy` a apenas fazer rsync (sem shell), use `rrsync`:

```bash
# No KVM4 como root
apt-get install rsync -y

# Editar authorized_keys para restringir o acesso
# Substitua a linha existente por:
echo 'command="rrsync /srv/sites/",no-agent-forwarding,no-port-forwarding,no-pty,no-user-rc,no-X11-forwarding CONTEÚDO_DA_CHAVE_PUBLICA' > /home/deploy/.ssh/authorized_keys
```

---

## 5. Adicionar chave privada ao GitHub Secrets

```bash
# Via GitHub CLI
gh secret set KVM4_SSH_KEY < ~/.ssh/deploy_ed25519

# Outros secrets necessários
gh secret set KVM4_HOST --body "31.97.26.21"
gh secret set KVM4_USER --body "deploy"
gh secret set KVM4_DEPLOY_PATH --body "/srv/sites/fw.copyzen.com.br/"
```

---

## 6. Testar conexão manual

```bash
rsync -avz --dry-run \
  -e "ssh -i ~/.ssh/deploy_ed25519 -o StrictHostKeyChecking=no" \
  packages/funwheel/dist/ \
  deploy@31.97.26.21:/srv/sites/fw.copyzen.com.br/
```

---

## 7. Verificar estrutura no KVM4

O nginx (gerenciado via Portainer) deve servir `/srv/sites/fw.copyzen.com.br/` com as configurações:

```nginx
server {
    listen 80;
    server_name fw.copyzen.com.br;
    root /srv/sites/fw.copyzen.com.br;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

> **Nota:** Traefik roteia o domínio e gerencia SSL. Stacks Docker gerenciados via Portainer UI — **nunca via GitHub Actions** (NFR-15).
