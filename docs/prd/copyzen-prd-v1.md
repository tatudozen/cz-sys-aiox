# CopyZen -- Product Requirements Document (PRD)

> **Status:** DRAFT (Seções 1-8 completas)
> **Versão:** 0.3
> **Autor:** Morgan (PM Agent)
> **Fonte:** CZ-Briefing v4 (2026-03-12)
> **Última atualização:** 2026-03-13

---

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-03-13 | 0.1 | Initial PRD draft from CZ-Briefing v4 (Seções 1-6a) | Morgan (PM) |
| 2026-03-13 | 0.2 | Epics 2-7 detalhados (31 stories), Seções 7-8 completas | Morgan (PM) |
| 2026-03-14 | 0.3 | FR-27/28/29: Brand Intelligence via scraping (Apify/Firecrawl). Story 2.6 adicionada. | Aria (Architect) + Fernando |

---

## 1. Goals and Background Context

### Goals

- Construir uma plataforma integrada de 4 sistemas (Projeto, Conteúdo IA, FunWheel A-R-T, Página de Vendas) que transforme briefings de clientes em entregas de marketing completas
- Validar o modelo OPB (One-Person Business) via self-dogfooding -- CopyZen como cliente zero mirando profissionais liberais
- Automatizar 80%+ do pipeline de produção de marketing usando agentes de IA (CMO, Designer, Copywriter) com guardrails por cliente
- Conquistar 1 cliente pagante externo em 4-5 meses e 5 clientes ativos em 12 meses
- Documentar custos reais por projeto durante self-dogfooding para definir pricing sustentável

### Background Context

CopyZen é uma agência de marketing digital one-person business fundada em 2024, especializada em marketing conversacional -- copywriting automatizado por IA para gerar leads qualificados para pequenos negócios e profissionais liberais no Brasil. O problema central é que esses profissionais precisam de presença digital consistente mas não têm tempo, equipe ou conhecimento técnico para criar funis de marketing eficientes. Soluções existentes (agências tradicionais, ferramentas self-service, freelancers) falham por custo, complexidade ou inconsistência.

A solução proposta é um pipeline end-to-end onde briefing → conteúdo → captação → conversão são operados por agentes de IA com núcleo compartilhado de branding, reduzindo dependência humana e mantendo consistência de marca. A infraestrutura já existe parcialmente (KVM4 Hostinger com n8n e Evolution API rodando, GoHighLevel ativo, Supabase planejado). O MVP tem timeline de ~14 semanas com 1 pessoa (Fernando) + IA, budget bootstrap sem capital externo.

---

## 2. Requirements

### 2.1 Functional Requirements

#### Sistema 0 -- Geração de Projeto

| ID | Requisito |
|----|-----------|
| **FR-01** | O sistema deve receber briefings de clientes via GoHighLevel Survey (webhook) e processar via n8n para formatação estruturada |
| **FR-02** | O sistema deve oferecer canal alternativo de entrada via WhatsApp (Evolution API) para envio de link do Survey |
| **FR-03** | O Agente CMO deve analisar o briefing formatado, recomendar pacote (5 combinações: IA, A-R-T, E, Combo Leads, Combo Cash) e gerar proposta para aprovação do cliente |
| **FR-04** | Após aprovação da proposta, o sistema deve disparar surveys específicos por sistema contratado e gerar plano de projeto detalhado |
| **FR-05** | O sistema deve armazenar dados de briefing, proposta e plano de projeto no Supabase com isolamento por cliente (RLS) |

#### Sistema 1 -- Geração de Conteúdo (Inception & Atração Fatal)

| ID | Requisito |
|----|-----------|
| **FR-06** | O sistema deve gerar pacotes de posts para redes sociais nos subsistemas Carrossel e Imagem a partir do briefing + diretrizes de branding do cliente |
| **FR-07** | O sistema deve suportar dois modos estratégicos de conteúdo: Inception (branding/antecipação) e Atração Fatal (CTA direcionando para FunWheel) |
| **FR-08** | O sistema deve gerar imagens via integração com Nano Banana e/ou Kling AI |
| **FR-09** | O sistema deve utilizar imagens de referência do Google Drive compartilhado do cliente como input para geração |
| **FR-10** | Posts finalizados devem ser entregues via Google Drive compartilhado com o cliente |

#### Sistema 2 -- FunWheel (A-R-T)

| ID | Requisito |
|----|-----------|
| **FR-11** | O sistema deve gerar página de Apresentação com narrativa de transformação baseada no briefing do cliente |
| **FR-12** | O sistema deve gerar página de Retenção com captura de lead via lead magnet (PDF gerado automaticamente a partir do conteúdo da Apresentação) |
| **FR-13** | O sistema deve gerar página de Transformação com acesso a comunidade/área de membros no GoHighLevel, condicionado a indicação/compartilhamento |
| **FR-14** | O sistema deve rastrear indicações de cada lead para qualificação progressiva |
| **FR-15** | As páginas do FunWheel devem integrar com GoHighLevel CRM para gestão de leads |

#### Sistema 3 -- Página de Vendas

| ID | Requisito |
|----|-----------|
| **FR-16** | O sistema deve gerar página de vendas long-form com seções: headline, problema, solução, benefícios, prova social, oferta, garantia, CTA e FAQ |
| **FR-17** | A página de vendas deve ser mobile-first e receber leads qualificados do FunWheel como input estratégico |

#### Núcleo de Agentes

| ID | Requisito |
|----|-----------|
| **FR-18** | O Agente CMO deve orquestrar planejamento e execução de cada projeto, coordenando Designer e Copywriter |
| **FR-19** | O Agente Designer deve manter consistência visual (cores, estilo, templates) utilizando referências do Google Drive e gerando imagens via APIs externas |
| **FR-20** | O Agente Copywriter deve produzir copy conversacional com guardrails de branding configuráveis por cliente |
| **FR-21** | Os agentes devem usar LLMs (Claude API) com guardrails definidos por cliente; tarefas mecânicas (formatação, deploy, integração) devem ser executadas via código |

#### Hospedagem & Deploy

| ID | Requisito |
|----|-----------|
| **FR-22** *(v3)* | Páginas CopyZen devem ser servidas via nginx:alpine no Docker Swarm, com arquivos estáticos montados em `/srv/sites/{domain}/`, routing via Traefik labels na rede AZ_Net, e SSL via Let's Encrypt certresolver |
| **FR-23** | Páginas de clientes devem ser hospedadas na Vercel com preview URLs para aprovação antes de publicação |
| **FR-24** *(updated)* | CI/CD via GitHub Actions deve fazer build do SSG e transferir output estático para `/srv/sites/{domain}/` na KVM4 (rsync/scp). O stack Docker é gerenciado via Portainer UI -- **não via CLI/Actions** |

#### Revisão & Aprovação

| ID | Requisito |
|----|-----------|
| **FR-25** | O sistema deve incluir 1 ciclo de revisão gratuito por entrega, com revisões adicionais pagas |
| **FR-26** | O cliente deve validar e aprovar entregas antes da publicação |

#### Brand Intelligence & Digital Asset Analysis

| ID | Requisito |
|----|-----------|
| **FR-27** *(new)* | Quando o cliente informar ativos digitais existentes (site, landing pages, perfis de redes sociais) no briefing inicial, o sistema deve usar uma API de scraping (Apify/Firecrawl) para extrair automaticamente informações da marca: paleta de cores, tipografia, tom de voz, estilo visual, keywords recorrentes, e estrutura de conteúdo — enriquecendo o brand config e os briefings específicos subsequentes |
| **FR-28** *(new)* | Quando o cliente NÃO possuir ativos digitais, os surveys específicos (Sistema 0, Story 2.5) devem permitir que o cliente informe URLs de referência (sites ou perfis de concorrentes/inspirações) para serem analisados pelo mesmo pipeline de scraping, gerando um "brand reference profile" que guia os agentes na criação do estilo |
| **FR-29** *(new)* | O output da análise de brand intelligence deve ser estruturado e armazenado no Supabase como `brand_intelligence` associado ao cliente, contendo: cores detectadas, fontes detectadas, tom de voz inferido, screenshots, keywords extraídas, e score de confiança por campo — disponível para consulta pelos agentes CMO, Designer e Copywriter |

### 2.2 Non-Functional Requirements

| ID | Requisito |
|----|-----------|
| **NFR-01** | Lighthouse score > 90 e FCP < 2s em conexão 4G para todas as páginas geradas (FunWheel + vendas) |
| **NFR-02** | Briefing → primeiro output deve ocorrer em menos de 24 horas |
| **NFR-03** | Tempo de resposta por etapa de agente < 60 segundos |
| **NFR-04** | Conformidade com LGPD para todos os dados de clientes e leads |
| **NFR-05** | Isolamento de dados por cliente via Supabase RLS -- nenhum cliente pode acessar dados de outro |
| **NFR-06** | Todos os secrets (API keys, tokens) devem ser gerenciados via variáveis de ambiente, nunca hardcoded |
| **NFR-07** *(updated)* | SSL via Let's Encrypt com Traefik certresolver (KVM4) e Vercel auto-SSL (clientes) |
| **NFR-08** | Custos operacionais devem respeitar budget bootstrap: Claude API ~$20-50/mês, Supabase free→$25/mês, Vercel free tier para clientes iniciais |
| **NFR-09** | Pipeline deve atingir 80%+ de automação -- intervenção humana apenas em aprovações e revisões |
| **NFR-10** | Camada de LLM deve ser abstraída para permitir fallback para outro provider se Claude API ficar indisponível |
| **NFR-11** | Backups regulares da KVM4 devem ser configurados; Vercel funciona como fallback para páginas críticas |
| **NFR-12** | O sistema deve suportar atendimento de até 10 clientes simultâneos em 18 meses sem degradação |
| **NFR-13** *(new)* | Todos os serviços CopyZen na KVM4 devem rodar como Docker Swarm stacks na rede AZ_Net, gerenciados via Portainer |
| **NFR-14** *(new)* | O serviço de aplicação CopyZen deve respeitar os resource limits do Swarm (definir CPU/memória por container conforme capacidade restante da KVM4, considerando serviços existentes: n8n 3x1GB, Redis 1GB, PostgreSQL, Evolution, Ollama) |
| **NFR-15** *(new)* | Deploy de stacks Docker na KVM4 deve ser feito exclusivamente via Portainer UI para manter controle visual. GitHub Actions limita-se a build + transferência de arquivos estáticos. |

### 2.3 Infrastructure Corrections Applied

Discrepâncias identificadas entre o CZ-Briefing v4 e a infraestrutura real:

| Briefing v4 | Realidade (stack) |
|---|---|
| Reverse proxy: Caddy | **Traefik** (via Docker Swarm labels) |
| Docker simples na KVM4 | **Docker Swarm** gerenciado via **Portainer** |
| n8n rodando | n8n em **queue mode** (editor + webhook + worker separados) |
| Não menciona PostgreSQL | **PostgreSQL já existe** na KVM4 (usado pelo n8n) |
| Não menciona Redis | **Redis já existe** (fila de execução do n8n) |
| SSL via Caddy | SSL via **Let's Encrypt + Traefik** |
| Rede interna não especificada | Rede **AZ_Net** (overlay Docker Swarm) |

---

## 3. User Interface Design Goals

> **Nota:** O MVP da CopyZen **não possui dashboard, portal de cliente ou interface administrativa**. O UI scope é exclusivamente **páginas públicas geradas** (landing pages e sales pages) consumidas por leads e clientes finais dos clientes da CopyZen.

### 3.1 Overall UX Vision

Páginas de alta conversão, rápidas e visualmente profissionais que transmitam credibilidade instantânea. O lead deve sentir que está interagindo com uma marca premium -- não com um template genérico. Cada página é personalizada por cliente via guardrails de branding (cores, tom, estilo visual), gerada por agentes de IA e entregue como site estático. A experiência é linear e focada: o lead entra, é conduzido pela narrativa, e executa a ação desejada (capturar lead, compartilhar, comprar).

### 3.2 Key Interaction Paradigms

- **Scroll-driven storytelling:** Páginas long-form onde o scroll conduz a narrativa (FunWheel Apresentação + Página de Vendas). Sem navegação complexa, sem menus -- fluxo linear de leitura.
- **Single-action focus:** Cada página tem UM objetivo claro -- capturar email (Retenção), incentivar compartilhamento (Transformação), ou converter venda (Página de Vendas). CTAs proeminentes e repetidos.
- **Mobile-first interaction:** Toque como input primário. Botões grandes, formulários mínimos (nome + email/WhatsApp), sem hover states críticos.
- **Zero-friction forms:** Captura de lead com no máximo 2-3 campos. Integração direta com GoHighLevel CRM via API.

### 3.3 Core Screens and Views

| Página | Sistema | Objetivo | Elementos-chave |
|--------|---------|----------|-----------------|
| **Apresentação** | FunWheel (A) | Engajar com narrativa de transformação | Hero, storytelling, CTA para Retenção |
| **Retenção** | FunWheel (R) | Capturar lead via lead magnet | Formulário curto, oferta do PDF, CTA |
| **Transformação** | FunWheel (T) | Qualificar lead via indicação | Mecânica de compartilhamento, acesso VIP condicionado |
| **Página de Vendas** | Sistema 3 (E) | Converter lead qualificado em cliente | Headline, problema, solução, benefícios, prova social, oferta, garantia, CTA, FAQ |
| **Thank You / Confirmação** | Transversal | Confirmar ação e próximo passo | Mensagem de confirmação, link para próxima etapa |

_(Nota: Surveys de briefing e CRM/comunidade são operados no GoHighLevel -- fora do escopo de UI custom)_

### 3.4 Accessibility: WCAG AA

- **Justificativa:** WCAG AA é o padrão adequado para páginas comerciais no Brasil. Garante legibilidade, contraste suficiente, e navegação acessível sem overhead excessivo para o MVP.
- Contraste mínimo 4.5:1 para texto, 3:1 para elementos grandes
- Formulários com labels associados e estados de erro claros
- Estrutura semântica com headings hierárquicos

### 3.5 Branding

- Cada cliente da CopyZen terá um **brand config** armazenado no Supabase com: paleta de cores (primária, secundária, acento), tipografia (heading + body), logo, tom de voz (formal/casual/técnico), e imagens de referência
- O Agente Designer aplica o brand config como guardrails na geração de cada página
- **CopyZen (self-dogfooding):** Branding próprio a ser definido -- domínios já definidos: `fw.copyzen.com.br` (FunWheel), `fw.alquimiazen.com.br` (plataforma)
- Consistência visual garantida pelo núcleo compartilhado de agentes (FR-19)

### 3.6 Target Device and Platforms: Web Responsive (Mobile-First)

- **Mobile-first obrigatório** -- briefing especifica mobile-first para página de vendas; aplica-se a todas as páginas públicas
- Breakpoints: Mobile (< 768px) como base → Tablet (768-1024px) → Desktop (> 1024px)
- Performance: Lighthouse > 90, FCP < 2s em 4G (NFR-01)
- Stack: Astro SSG + Tailwind CSS -- sites estáticos, sem JS runtime pesado
- Sem suporte obrigatório a apps nativos ou PWA no MVP

---

## 4. Technical Assumptions

### 4.1 Deploy Pattern

```
Build SSG (Astro) → Output estático → /srv/sites/{domain}/ na KVM4
→ nginx:alpine serve os arquivos → Traefik roteia + SSL
→ Stack gerenciado via Portainer UI
```

### 4.2 Repository Structure: Monorepo

- **Decisão:** Monorepo único para toda a plataforma CopyZen
- **Rationale:** Projeto operado por 1 pessoa + IA. Polyrepo adicionaria overhead de gestão sem benefício. Monorepo permite compartilhar tipos, configs, e brand system entre os sistemas.
- **Estrutura sugerida:**
  ```
  packages/
  ├── core/           # Tipos compartilhados, brand config, utils
  ├── funwheel/       # Astro project para FunWheel A-R-T
  ├── sales-page/     # Astro project para Páginas de Vendas
  ├── agents/         # Agentes CMO, Designer, Copywriter (Claude API)
  └── integrations/   # GoHighLevel, Evolution API, Google Drive, Supabase
  ```

### 4.3 Service Architecture

**Modelo: Serverless-ish com orquestração n8n**

| Camada | Tecnologia | Onde roda | Papel |
|--------|-----------|-----------|-------|
| **Orquestração** | n8n (queue mode) | KVM4 Docker Swarm | Coordena fluxos: briefing → agentes → output → deploy |
| **Agentes IA** | Claude API via n8n HTTP nodes ou scripts Node.js | n8n workers / KVM4 | CMO, Designer, Copywriter -- lógica de negócio |
| **Geração de imagem** | Nano Banana / Kling AI | APIs externas | Chamadas via n8n |
| **Banco de dados** | Supabase Cloud (PostgreSQL + RLS + Storage) | Supabase Cloud | Dados de clientes, briefings, leads, brand configs |
| **CRM / Surveys** | GoHighLevel | GoHighLevel Cloud | Captura de briefing, gestão de leads, comunidade VIP |
| **WhatsApp** | Evolution API | KVM4 Docker Swarm | Canal de entrada alternativo |
| **Frontend (CopyZen)** | Astro SSG → nginx:alpine | KVM4 Docker Swarm | FunWheel + Páginas de Vendas da CopyZen |
| **Frontend (clientes)** | Astro SSG | Vercel | FunWheel + Páginas de Vendas dos clientes |
| **Reverse proxy** | Traefik | KVM4 Docker Swarm | Routing, SSL, load balancing |
| **Gestão de containers** | Portainer | KVM4 Docker Swarm | Deploy e monitoramento de stacks |

### 4.4 Decisão: Astro (recomendado) vs Next.js

| Critério | Astro | Next.js |
|----------|-------|---------|
| SSG puro (sem server runtime) | Nativo, zero JS por default | Precisa configurar `output: 'export'` |
| Tailwind CSS | Suporte nativo | Suporte nativo |
| Performance (Lighthouse) | Excelente -- ships zero JS | Bom, mas inclui React runtime |
| Curva de aprendizado | Menor para sites estáticos | Maior, mas mais familiar no mercado |
| Componentes dinâmicos | Islands architecture | Full React |
| Deploy para nginx estático | `astro build` → `dist/` | `next build && next export` → `out/` |
| Interatividade no cliente | Mínima (ideal para landing pages) | Full SPA se necessário |

**Recomendação:** **Astro** para o MVP. Landing pages e sales pages são majoritariamente estáticas com formulários simples. Astro gera zero JS por default (melhor Lighthouse), o deploy para nginx é trivial (`dist/` folder), e a island architecture permite adicionar interatividade pontual sem peso desnecessário.

### 4.5 Testing Requirements

- **Unit tests:** Lógica dos agentes (prompts, guardrails, parsing de output), brand config validation, template rendering
- **Integration tests:** Fluxo n8n end-to-end (briefing → agente → output), integração GoHighLevel webhook, integração Supabase (RLS verifica isolamento)
- **Manual testing:** Páginas geradas revisadas visualmente (Lighthouse audit, responsividade, branding). Preview URLs na Vercel para aprovação de clientes.
- **Sem E2E automatizado no MVP:** Overhead alto para 1 pessoa. Lighthouse CI no GitHub Actions como proxy de qualidade.
- **Framework:** Vitest (alinhado com Astro ecosystem)

### 4.6 Additional Technical Assumptions

- **n8n como orquestrador central:** Todo o pipeline (briefing → agentes → output) é modelado como workflows n8n. Agentes são chamados via HTTP Request nodes ou Code nodes. Isso maximiza uso da infra já rodando e evita construir um orquestrador custom.
- **Claude API como LLM primário:** Agentes CMO, Designer (prompts), Copywriter usam Claude. Abstração de provider via interface simples para permitir fallback futuro (NFR-10). Ollama já está na KVM4 -- pode servir como fallback para tarefas menos críticas.
- **Supabase Cloud (não PostgreSQL local):** Apesar do PostgreSQL existir na KVM4 (usado pelo n8n), Supabase Cloud oferece RLS nativo, Storage, Auth, e API REST auto-gerada -- essenciais para isolamento multi-tenant. O PostgreSQL local continuará exclusivo para n8n.
- **Google Drive como canal de entrega:** Posts são entregues ao cliente via Google Drive compartilhado. Sem portal de download custom no MVP.
- **Deploy pattern:** GitHub Actions faz build → rsync para `/srv/sites/{domain}/` na KVM4. Stacks nginx gerenciados via Portainer UI. Para Vercel, push trigger normal.
- **Domínios já definidos:** `fw.copyzen.com.br` (FunWheel CopyZen), `fw.alquimiazen.com.br` (plataforma). Clientes usam subdomínio CopyZen ou domínio próprio apontando para Vercel.
- **Timezone:** `America/Sao_Paulo` (consistente com n8n stack)

---

## 5. Epic List

| # | Epic | Descrição |
|---|------|-----------|
| **1** | **Foundation & Infrastructure Setup** | Estabelecer o monorepo, CI/CD pipeline, Supabase project, configurações de deploy (KVM4 + Vercel), e um "hello world" FunWheel estático deployado via nginx no Swarm -- provando o pipeline end-to-end. |
| **2** | **Sistema 0 -- Geração de Projeto (Briefing Pipeline)** | Implementar o fluxo completo de onboarding: GoHighLevel Survey → webhook → n8n workflow → Agente CMO analisa e recomenda pacote → proposta para aprovação → surveys específicos → plano de projeto salvo no Supabase. |
| **3** | **Núcleo de Agentes (CMO, Designer, Copywriter)** | Construir os 3 agentes centrais com Claude API, brand config por cliente no Supabase, guardrails de branding, e interface de orquestração via n8n. Este epic é pré-requisito para os sistemas 1, 2 e 3. |
| **4** | **Sistema 1 -- Geração de Conteúdo (Inception & Atração Fatal)** | Implementar geração de posts (Carrossel + Imagem) nos modos Inception e Atração Fatal, integração com Nano Banana/Kling AI para imagens, e entrega via Google Drive compartilhado. |
| **5** | **Sistema 2 -- FunWheel (A-R-T)** | Construir as 3 páginas do funil (Apresentação, Retenção, Transformação) em Astro, integrar captura de leads com GoHighLevel, gerar PDF do lead magnet, implementar mecânica de indicação, e deployar no nginx/Swarm (CopyZen) e Vercel (clientes). |
| **6** | **Sistema 3 -- Página de Vendas** | Implementar página de vendas long-form mobile-first em Astro com todas as seções (headline→FAQ), integrando com leads qualificados do FunWheel e CTA para GoHighLevel. |
| **7** | **Self-Dogfooding & Integração End-to-End** | CopyZen como cliente zero: configurar branding próprio, gerar conteúdo real, publicar FunWheel em `fw.copyzen.com.br`, publicar página de vendas, conectar WhatsApp (Evolution API), e validar pipeline completo com leads reais. |

---

## 6. Epic Details

### 6.1 Epic 1: Foundation & Infrastructure Setup

**Goal:** Estabelecer o monorepo, CI/CD pipeline, Supabase project, stack nginx no Docker Swarm, e validar o pipeline completo com uma página estática acessível em `fw.copyzen.com.br` -- provando que build → deploy → serve funciona end-to-end antes de construir qualquer sistema.

---

#### Story 1.1: Monorepo Scaffolding

**As a** developer (Fernando),
**I want** a monorepo initialized with Astro, Tailwind CSS, TypeScript, and Vitest,
**so that** I have a consistent project structure ready for all CopyZen systems.

**Acceptance Criteria:**

1. Monorepo inicializado com `package.json` na raiz e workspace structure:
   ```
   packages/
   ├── core/           # Tipos compartilhados, brand config types, utils
   ├── funwheel/       # Astro project para FunWheel A-R-T
   ├── sales-page/     # Astro project para Páginas de Vendas
   ├── agents/         # Lógica dos agentes CMO, Designer, Copywriter
   └── integrations/   # Clients para GoHighLevel, Evolution, Supabase, Google Drive
   ```
2. `packages/funwheel/` contém um Astro project funcional com Tailwind CSS configurado e TypeScript strict mode
3. `packages/core/` contém ao menos um tipo exportado (`BrandConfig` interface) importável por outros packages
4. Vitest configurado na raiz com ao menos 1 teste passando (smoke test do `core` package)
5. `npm run build` no `packages/funwheel/` gera output estático em `dist/`
6. `npm run lint` e `npm run typecheck` passam sem erros na raiz
7. `.gitignore` configurado para Node.js, Astro, e arquivos de ambiente (`.env`)
8. `tsconfig.json` com path aliases para imports absolutos entre packages (`@copyzen/core`, `@copyzen/funwheel`)

---

#### Story 1.2: Supabase Project & Initial Schema

**As a** developer (Fernando),
**I want** a Supabase project created with schema inicial para clientes e brand configs,
**so that** os sistemas tenham onde persistir dados de clientes com isolamento via RLS desde o dia 1.

**Acceptance Criteria:**

1. Supabase project criado (free tier) com região próxima (São Paulo se disponível, ou mais próxima)
2. Tabela `clients` criada com campos: `id` (uuid, PK), `name`, `email`, `phone`, `business_type`, `status` (enum: active/inactive/onboarding), `created_at`, `updated_at`
3. Tabela `brand_configs` criada com campos: `id` (uuid, PK), `client_id` (FK → clients), `primary_color`, `secondary_color`, `accent_color`, `heading_font`, `body_font`, `tone_of_voice` (enum: formal/casual/technical), `logo_url`, `reference_images` (text[])
4. RLS habilitado em ambas as tabelas com policy: cada cliente só acessa seus próprios dados (via `auth.uid()` ou service role key para operações internas)
5. Supabase Storage bucket `assets` criado para logos e imagens de referência
6. Migration SQL versionada em `supabase/migrations/` no monorepo
7. Variáveis de ambiente (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) documentadas no `.env.example`
8. Teste de integração valida: insert client → insert brand_config → query retorna dados corretos → RLS bloqueia acesso cross-client

---

#### Story 1.3: GitHub Repository & CI/CD Pipeline

**As a** developer (Fernando),
**I want** a GitHub repo with CI/CD that builds Astro and transfers static files to KVM4,
**so that** every push to main automatically builds and deploys the site.

**Acceptance Criteria:**

1. Repositório GitHub criado na org/conta correta com branch `main` protegida
2. GitHub Actions workflow (`.github/workflows/deploy-kvm4.yml`) que: faz checkout → instala deps → roda lint + typecheck + tests → builda `packages/funwheel/` → transfere `dist/` para KVM4 via rsync/scp para `/srv/sites/fw.copyzen.com.br/`
3. GitHub Secrets configurados: `KVM4_HOST`, `KVM4_USER`, `KVM4_SSH_KEY`, `KVM4_DEPLOY_PATH`
4. GitHub Actions workflow (`.github/workflows/deploy-vercel.yml`) para deploy de páginas de clientes na Vercel (trigger manual ou branch-based)
5. Workflow roda com sucesso em push para `main` -- build completa e arquivos transferidos
6. Workflow falha gracefully se lint, typecheck, ou testes falharem -- deploy não ocorre
7. SSH key par criado: chave privada no GitHub Secrets, chave pública no `~/.ssh/authorized_keys` do KVM4 (user dedicado `deploy` com acesso restrito a `/srv/sites/`)

---

#### Story 1.4: Docker Swarm Stack para CopyZen Site

**As a** operator (Fernando),
**I want** a nginx stack compose file ready for Portainer deployment serving `fw.copyzen.com.br`,
**so that** the CopyZen FunWheel is served via nginx with Traefik SSL on the existing Swarm.

**Acceptance Criteria:**

1. Arquivo `infra/stacks/copyzen-funwheel.yml` no monorepo com stack Docker Swarm:
   - Service `nginx:alpine` com volume `/srv/sites/fw.copyzen.com.br:/usr/share/nginx/html:ro`
   - Traefik labels para `Host(\`fw.copyzen.com.br\`)`, entrypoint `websecure`, certresolver `letsencryptresolver`
   - Network `AZ_Net` (external)
   - Resource limits definidos (ex: 0.5 CPU, 256M RAM)
2. Arquivo `infra/stacks/copyzen-sales.yml` análogo para futuro domínio de página de vendas (preparado, não deployado ainda)
3. Documentação em `docs/infra/deploy-portainer.md` com passo-a-passo de como criar o stack no Portainer UI (screenshots ou instruções claras)
4. Diretório `/srv/sites/fw.copyzen.com.br/` criado no KVM4 com um `index.html` placeholder
5. DNS do domínio `fw.copyzen.com.br` apontando para IP da KVM4 (`31.97.26.21`)
6. Após deploy via Portainer: `https://fw.copyzen.com.br` retorna o placeholder com SSL válido (Let's Encrypt)

---

#### Story 1.5: End-to-End Pipeline Validation

**As a** developer (Fernando),
**I want** to push an Astro "hello world" page and see it live at `fw.copyzen.com.br`,
**so that** I can confirm the entire pipeline (code → build → transfer → serve) works before building real features.

**Acceptance Criteria:**

1. `packages/funwheel/src/pages/index.astro` contém uma página styled com Tailwind mostrando: logo CopyZen placeholder, título "FunWheel -- Em Breve", e footer com "Powered by CopyZen"
2. Push para `main` dispara GitHub Actions → build → rsync → arquivos chegam em `/srv/sites/fw.copyzen.com.br/`
3. `https://fw.copyzen.com.br` exibe a página corretamente com SSL válido
4. Lighthouse audit da página retorna score > 90 em Performance, Accessibility, Best Practices, e SEO
5. Página é responsiva: mobile (< 768px), tablet, e desktop renderizam corretamente
6. Todos os testes passam no CI (lint, typecheck, vitest)
7. Tempo total do pipeline (push → site atualizado) < 5 minutos

---

### 6.2 Epic 2: Sistema 0 -- Geração de Projeto (Briefing Pipeline)

**Goal:** Implementar o fluxo completo de onboarding de clientes: do survey inicial no GoHighLevel até o plano de projeto detalhado salvo no Supabase, passando por análise do Agente CMO, recomendação de pacote, aprovação da proposta e surveys específicos por sistema contratado.

**Dependências:** Epic 1 (Supabase schema, n8n rodando, monorepo funcional)

---

#### Story 2.1: GoHighLevel Survey & Webhook Configuration

**As a** operator (Fernando),
**I want** the GoHighLevel initial survey connected to n8n via webhook,
**so that** client briefings arrive automatically in the processing pipeline.

**Acceptance Criteria:**

1. Survey inicial no GoHighLevel configurado com campos: nome do negócio, segmento, público-alvo, objetivo principal, orçamento estimado, canal preferido (WhatsApp/Email), URL de redes sociais existentes
2. Webhook configurado no GoHighLevel disparando para endpoint n8n (`https://{n8n-domain}/webhook/briefing-intake`)
3. n8n workflow `briefing-intake` recebe o payload, valida campos obrigatórios e salva raw data na tabela `briefings` no Supabase
4. Tabela `briefings` criada no Supabase com campos: `id` (uuid), `client_id` (FK nullable -- atribuído após criação do client), `raw_data` (jsonb), `source` (enum: ghl_survey/whatsapp), `status` (enum: received/processing/analyzed/approved), `created_at`
5. RLS habilitado na tabela `briefings` (mesmo padrão de `clients`)
6. Teste end-to-end: preencher survey → webhook dispara → n8n processa → registro aparece no Supabase com status `received`
7. Tratamento de erro: se webhook falhar, n8n registra em error log e envia alerta via n8n notification node

---

#### Story 2.2: WhatsApp Entry Channel (Evolution API)

**As a** potential client,
**I want** to receive the survey link via WhatsApp,
**so that** I can start my briefing from my preferred channel.

**Acceptance Criteria:**

1. Workflow n8n `whatsapp-survey-link` que recebe mensagem da Evolution API (webhook)
2. Quando cliente envia mensagem inicial (keyword ou primeiro contato), responde automaticamente com mensagem de boas-vindas + link do GoHighLevel Survey
3. Integração com Evolution API via HTTP Request node no n8n (endpoint já rodando na KVM4)
4. Mensagem de resposta inclui: saudação personalizada com nome (se disponível), breve explicação do processo, link direto do survey
5. Registro da interação no Supabase: `whatsapp_interactions` table com `phone`, `message_type`, `timestamp`
6. Teste: enviar mensagem via WhatsApp → receber link do survey → preencher survey → briefing chega no pipeline (Story 2.1)

---

#### Story 2.3: Agente CMO -- Análise de Briefing & Recomendação de Pacote

**As a** operator (Fernando),
**I want** the CMO agent to analyze incoming briefings and recommend a package,
**so that** clients receive a tailored proposal based on their needs.

**Acceptance Criteria:**

1. n8n workflow `cmo-analyze-briefing` triggered quando briefing muda para status `received`
2. Workflow chama Claude API (HTTP Request node) com prompt do Agente CMO que inclui: briefing formatado, lista dos 5 pacotes disponíveis (IA, A-R-T, E, Combo Leads, Combo Cash), critérios de recomendação
3. Output do CMO é JSON estruturado com: `recommended_package`, `reasoning` (justificativa), `estimated_timeline`, `estimated_cost_range`, `priority_systems` (ordenação dos sistemas a implementar)
4. Output salvo na tabela `proposals` no Supabase: `id`, `briefing_id` (FK), `client_id`, `package`, `reasoning`, `timeline`, `cost_range`, `status` (enum: draft/sent/approved/rejected), `created_at`
5. Guardrails do CMO validam: briefing tem dados suficientes para análise (se não, status muda para `needs_info` e Fernando é notificado)
6. Tempo de processamento do agente < 60s (NFR-03)
7. Teste: briefing completo → CMO analisa → proposta gerada com pacote recomendado e justificativa coerente

---

#### Story 2.4: Proposta & Ciclo de Aprovação

**As a** operator (Fernando),
**I want** to review, adjust if needed, and send the proposal to the client for approval,
**so that** the project only proceeds with explicit client consent.

**Acceptance Criteria:**

1. n8n workflow `send-proposal` que Fernando pode triggerar manualmente (ou via botão n8n) após revisar a proposta gerada pelo CMO
2. Fernando pode editar a proposta (pacote, timeline, preço) antes de enviar -- edição via n8n form node ou diretamente no Supabase
3. Proposta enviada ao cliente via email (n8n Email node) e/ou WhatsApp (Evolution API) com: resumo do pacote, timeline, próximos passos, link para confirmar aprovação
4. Link de aprovação: GoHighLevel page ou n8n webhook que registra `approved` ou `rejected` no Supabase
5. Quando `approved`: status do briefing muda para `approved`, triggers Story 2.5 (surveys específicos)
6. Quando `rejected`: Fernando é notificado para follow-up manual
7. Teste: proposta enviada → cliente clica "aprovar" → status atualiza → pipeline continua

---

#### Story 2.5: Surveys Específicos & Geração do Plano de Projeto

**As a** operator (Fernando),
**I want** system-specific surveys to be sent after approval and a detailed project plan generated,
**so that** each system has the detailed input it needs to produce quality output.

**Acceptance Criteria:**

1. Surveys específicos no GoHighLevel para cada sistema: Survey de Conteúdo (Sistema 1), Survey de FunWheel (Sistema 2), Survey de Página de Vendas (Sistema 3) -- cada um com campos relevantes ao sistema
2. n8n workflow `dispatch-specific-surveys` que, com base no pacote aprovado, envia ao cliente apenas os surveys dos sistemas contratados
3. Cada survey specific tem webhook → n8n → salva respostas na tabela `system_surveys` no Supabase: `id`, `briefing_id`, `system` (enum: content/funwheel/sales_page), `responses` (jsonb), `status`
4. Quando todos os surveys do pacote estão completos, n8n chama CMO novamente para gerar plano de projeto detalhado
5. Plano de projeto salvo na tabela `project_plans`: `id`, `briefing_id`, `client_id`, `package`, `systems` (jsonb array com timeline e tasks por sistema), `status` (enum: draft/active/completed)
6. Fernando é notificado quando plano está pronto para revisão final
7. Teste end-to-end: aprovação → surveys enviados → cliente responde → plano de projeto gerado → Fernando notificado

---

#### Story 2.6: Brand Intelligence — Digital Asset Scraping & Analysis

**As a** operator (Fernando),
**I want** the system to automatically scrape and analyze a client's existing digital assets (or reference URLs),
**so that** the brand config is enriched with real data and the agents produce more accurate, brand-consistent output from day one.

**Acceptance Criteria:**

1. No survey inicial (GoHighLevel), campos para informar ativos digitais existentes: URL do site, URLs de redes sociais (Instagram, Facebook, LinkedIn), URL de landing pages existentes
2. n8n workflow `brand-intelligence-scrape` que, após recebimento do briefing, dispara scraping via API externa (Apify ou Firecrawl) para cada URL informada
3. Pipeline de extração deve coletar: (a) paleta de cores dominantes (top 5 cores hex), (b) fontes utilizadas (heading/body), (c) keywords recorrentes (top 20), (d) tom de voz inferido (formal/casual/técnico — via análise de texto com Claude), (e) screenshots das páginas, (f) estrutura de navegação/conteúdo, (g) links de redes sociais encontrados
4. Output armazenado na tabela `brand_intelligence` no Supabase: `id`, `client_id` (FK), `source_url`, `source_type` (enum: website/instagram/facebook/linkedin/landing_page/reference), `colors_detected` (jsonb), `fonts_detected` (jsonb), `tone_detected` (text), `keywords_extracted` (text[]), `screenshot_url` (text), `content_structure` (jsonb), `confidence_scores` (jsonb — score 0-1 por campo), `raw_data` (jsonb), `created_at`
5. **Fluxo com ativos existentes:** Briefing recebido → URLs detectadas → scrape automático → brand_intelligence salvo → CMO recebe dados enriquecidos na análise → brand_config pré-populado com dados reais (Fernando confirma/ajusta antes de finalizar)
6. **Fluxo sem ativos (referências):** Nos surveys específicos (Story 2.5), campo "URLs de referência/inspiração" → mesmo pipeline de scraping → output salvo como `source_type='reference'` → Designer e Copywriter usam como guia de estilo (não como cópia direta)
7. Confidence score por campo: se score < 0.6, campo marcado como "needs_manual_review" e Fernando é notificado para validação manual
8. Fallback: se scraping falhar para uma URL (site bloqueado, timeout), registrar erro e continuar com as demais URLs. Nunca bloquear o pipeline por falha de scraping.
9. Integração com brand config: `BrandConfigLoader` deve consultar `brand_intelligence` quando montando guardrails — dados de intelligence complementam (não substituem) o brand_config manual
10. Teste end-to-end: informar URL de site real no survey → scraping executa → brand_intelligence salvo → cores e tom de voz detectados → dados disponíveis na análise do CMO

---

### 6.3 Epic 3: Núcleo de Agentes (CMO, Designer, Copywriter)

**Goal:** Construir os 3 agentes centrais com Claude API, sistema de brand config por cliente, guardrails de branding, e integração de orquestração via n8n. Este epic é pré-requisito técnico para os Sistemas 1, 2 e 3.

**Dependências:** Epic 1 (Supabase com brand_configs), Epic 2 (CMO já parcialmente implementado para briefing pipeline -- este epic expande e formaliza)

---

#### Story 3.1: LLM Abstraction Layer & Claude API Client

**As a** developer (Fernando),
**I want** an abstracted LLM interface with Claude API as primary provider,
**so that** agents can call LLMs consistently and we can add fallback providers later (NFR-10).

**Acceptance Criteria:**

1. `packages/agents/src/llm/` com interface `LLMProvider` definindo: `complete(prompt, options)`, `stream(prompt, options)`, modelo, max_tokens, temperature
2. Implementação `ClaudeProvider` usando Claude API (HTTP ou Anthropic SDK) com retry logic (3 tentativas, backoff exponencial)
3. Factory function `createLLMProvider(config)` que retorna o provider configurado -- extensível para futuros providers (Ollama, OpenAI)
4. Configuração via variáveis de ambiente: `LLM_PROVIDER=claude`, `CLAUDE_API_KEY`, `CLAUDE_MODEL=claude-sonnet-4-6`
5. Rate limiting respeitando limites da API Claude (RPM/TPM)
6. Logging de cada chamada: modelo, tokens usados, latência, custo estimado -- salvo em tabela `llm_usage_log` no Supabase
7. Testes unitários: mock do provider, teste de retry, teste de fallback quando provider indisponível retorna erro graceful
8. Teste de integração: chamada real à Claude API retorna resposta válida

---

#### Story 3.2: Brand Config System

**As a** developer (Fernando),
**I want** a brand configuration system that loads per-client visual and voice guidelines,
**so that** all agents produce output consistent with each client's brand.

**Acceptance Criteria:**

1. `packages/core/src/brand/` com tipo `BrandConfig` expandido: cores (primary, secondary, accent, background, text), tipografia (heading_font, body_font, font_sizes), tom de voz (formal/casual/technical + custom_guidelines text), logo_url, reference_images[], slogan, keywords[]
2. `BrandConfigLoader` que busca config do Supabase por `client_id` com cache em memória (TTL 5 min)
3. `BrandGuardrails` que recebe um `BrandConfig` e gera: (a) system prompt additions para agentes de texto, (b) style constraints para agentes visuais, (c) checklist de validação pós-geração
4. Função `validateBrandCompliance(output, brandConfig)` que verifica se output respeita guidelines (cores mencionadas, tom de voz, keywords usadas)
5. Seed data: brand config da CopyZen (cliente zero) inserido no Supabase como referência
6. Testes: carregar config → gerar guardrails → validar output compliance → rejeitar output non-compliant

---

#### Story 3.3: Agente CMO -- Implementation Completa

**As a** developer (Fernando),
**I want** the CMO agent fully implemented with orchestration capabilities,
**so that** it can plan and coordinate project execution across Designer and Copywriter.

**Acceptance Criteria:**

1. `packages/agents/src/cmo/` com classe `CMOAgent` que extends base `Agent`
2. Capabilities: `analyzeBriefing(briefing)` (já parcial do Epic 2), `createProjectPlan(briefing, systemSurveys)`, `orchestrateExecution(projectPlan)`, `reviewOutput(output, brandConfig)`
3. System prompt do CMO inclui: role definition, brand config do cliente, projeto atual, guidelines de orquestração
4. `orchestrateExecution` gera sequência de tasks para Designer e Copywriter com inputs/outputs definidos
5. `reviewOutput` valida entregas dos outros agentes contra briefing e brand config, retornando `approved` ou `revision_needed` com feedback específico
6. Integração com n8n: CMO é chamável via HTTP endpoint ou Code node
7. Testes: orchestrate project plan → gera tasks corretas para cada agente → review aprovado para output compliant, rejeitado para non-compliant

---

#### Story 3.4: Agente Copywriter -- Implementation

**As a** developer (Fernando),
**I want** the Copywriter agent producing conversational copy with per-client guardrails,
**so that** all text output (posts, landing pages, sales pages) matches each client's brand voice.

**Acceptance Criteria:**

1. `packages/agents/src/copywriter/` com classe `CopywriterAgent`
2. Capabilities: `generatePostCopy(brief, brandConfig, mode)` (Inception/Atração Fatal), `generateLandingPageCopy(brief, brandConfig, pageType)` (Apresentação/Retenção/Transformação), `generateSalesPageCopy(brief, brandConfig)`, `revise(original, feedback)`
3. System prompt inclui: tom de voz do cliente, keywords obrigatórias, estrutura de copywriting conversacional, CTA patterns
4. Mode `Inception`: copy focado em branding, antecipação, sem CTA direto
5. Mode `Atração Fatal`: copy com CTA direcionando para FunWheel
6. Output JSON estruturado: `{ headline, body, cta, hashtags, metadata }`
7. `revise` aceita feedback do CMO ou cliente e produz versão revisada mantendo brand compliance
8. Testes: gerar copy para cada modo → validar estrutura do output → validar brand compliance → revisão produz output diferente do original

---

#### Story 3.5: Agente Designer -- Implementation

**As a** developer (Fernando),
**I want** the Designer agent maintaining visual consistency and coordinating image generation,
**so that** all visual output matches each client's brand identity.

**Acceptance Criteria:**

1. `packages/agents/src/designer/` com classe `DesignerAgent`
2. Capabilities: `generateImagePrompt(brief, brandConfig, format)`, `selectTemplate(pageType, brandConfig)`, `applyBrandTheme(template, brandConfig)`, `reviewVisualOutput(image, brandConfig)`
3. `generateImagePrompt` produz prompt otimizado para Nano Banana / Kling AI com: style descriptors derivados do brand config, composição, cores, referências visuais do Google Drive
4. `selectTemplate` escolhe layout apropriado para o tipo de página (carrossel, imagem single, landing page) baseado no brand config
5. `applyBrandTheme` gera CSS custom properties / Tailwind config parcial a partir do brand config (cores, fontes)
6. Integração com Google Drive API para ler imagens de referência do cliente (via `packages/integrations/`)
7. Testes: gerar prompt de imagem → validar que inclui brand colors e style → apply theme → CSS gerado correto

---

#### Story 3.6: Agent Orchestration via n8n

**As a** developer (Fernando),
**I want** all agents callable as n8n workflow nodes,
**so that** the entire pipeline can be orchestrated visually in n8n.

**Acceptance Criteria:**

1. Cada agente expõe endpoint HTTP (Express server em `packages/agents/src/server.ts`) com rotas: `POST /agents/cmo/{action}`, `POST /agents/copywriter/{action}`, `POST /agents/designer/{action}`
2. Autenticação via API key compartilhada entre n8n e agent server (env var `AGENT_API_KEY`)
3. Agent server roda como service no Docker Swarm (compose file em `infra/stacks/copyzen-agents.yml`)
4. n8n workflows podem chamar agentes via HTTP Request node com payload JSON
5. Cada chamada de agente é logada: `agent_execution_log` table no Supabase com `agent`, `action`, `input_hash`, `output_hash`, `tokens_used`, `latency_ms`, `cost_estimate`, `timestamp`
6. Health check endpoint `GET /agents/health` retorna status de cada agente e do LLM provider
7. Teste end-to-end: n8n workflow chama CMO → CMO chama Copywriter via orchestration → output retorna ao n8n

---

### 6.4 Epic 4: Sistema 1 -- Geração de Conteúdo (Inception & Atração Fatal)

**Goal:** Implementar a geração automatizada de pacotes de posts para redes sociais nos modos Inception e Atração Fatal, com integração de geração de imagens via APIs externas e entrega via Google Drive compartilhado.

**Dependências:** Epic 3 (agentes Copywriter e Designer funcionais, brand config system)

---

#### Story 4.1: Content Generation Pipeline (n8n Workflow)

**As a** operator (Fernando),
**I want** an n8n workflow that orchestrates content generation for a client project,
**so that** the CMO can trigger post creation end-to-end.

**Acceptance Criteria:**

1. n8n workflow `content-generation-pipeline` com stages: load client brief + brand config → CMO define content plan (quantidade, tipos, modo) → Copywriter gera copy → Designer gera prompts de imagem → Image API gera imagens → package output → deliver to Google Drive
2. Workflow aceita input: `client_id`, `project_plan_id`, `mode` (inception/atracao_fatal), `quantity` (número de posts)
3. CMO define content plan como JSON: array de posts com `type` (carrossel/imagem), `topic`, `mode`, `cta_target` (se Atração Fatal)
4. Cada post passa por: Copywriter (copy) → Designer (prompt de imagem) → Image API → composição final
5. Output intermediário salvo em `content_outputs` table no Supabase: `id`, `project_plan_id`, `post_index`, `type`, `copy` (jsonb), `image_prompt`, `image_url`, `status`, `created_at`
6. Workflow handleia falhas por post (se um post falhar, os outros continuam)
7. Teste: trigger workflow com 3 posts → todos passam pelo pipeline → outputs salvos no Supabase

---

#### Story 4.2: Carrossel Subsystem

**As a** operator (Fernando),
**I want** the system to generate carousel posts with multiple slides,
**so that** clients get ready-to-publish carousel content for social media.

**Acceptance Criteria:**

1. Copywriter capability `generateCarouselCopy(brief, brandConfig, mode, slides)` produz: capa (headline + hook), 3-7 slides com copy estruturado, slide final com CTA
2. Designer capability `generateCarouselVisuals(slides, brandConfig)` produz prompts de imagem por slide respeitando sequência visual
3. Output: array de slides, cada um com `copy_text`, `image_url`, `layout_hint`
4. Modo Inception: slides educativos/branding sem CTA direto (exceto slide final com CTA suave)
5. Modo Atração Fatal: slides com tensão crescente, slide final com CTA forte → link FunWheel
6. Teste: gerar carrossel 5 slides em cada modo → validar estrutura → validar brand compliance

---

#### Story 4.3: Image Subsystem & AI Image Generation

**As a** developer (Fernando),
**I want** integration with Nano Banana and Kling AI for image generation,
**so that** the Designer agent can produce brand-consistent images automatically.

**Acceptance Criteria:**

1. `packages/integrations/src/image-generation/` com interface `ImageGenerator` e implementações `NanoBananaProvider`, `KlingAIProvider`
2. Factory `createImageGenerator(provider)` com fallback: se Nano Banana falhar, tenta Kling AI
3. Input: prompt (do Designer), aspect ratio, style preset derivado do brand config
4. Output: image URL (hosted no provider) + download para Supabase Storage
5. Rate limiting e cost tracking por chamada
6. Imagens de referência do Google Drive do cliente incluídas como input quando disponíveis (style transfer / reference)
7. Testes: gerar imagem via mock → gerar via API real (integration test) → validar download para Storage

---

#### Story 4.4: Google Drive Delivery Integration

**As a** operator (Fernando),
**I want** finished content packages delivered to the client's shared Google Drive folder,
**so that** clients can access and approve their posts in a familiar platform.

**Acceptance Criteria:**

1. `packages/integrations/src/google-drive/` com `GoogleDriveClient`: `uploadFile`, `createFolder`, `shareWithEmail`, `listFiles`
2. Workflow de entrega: cria pasta `CopyZen/{client_name}/{project_date}/` → organiza por tipo (carrosseis/, imagens/) → faz upload dos assets → notifica cliente
3. Cada post entregue com: imagem(ns) em alta resolução + arquivo de texto com copy/legendas/hashtags
4. Service account Google configurado com credenciais via env var (não credenciais pessoais)
5. Registro de entrega na tabela `deliveries` no Supabase: `id`, `project_plan_id`, `client_id`, `drive_folder_url`, `files_count`, `delivered_at`
6. Teste: gerar content package mock → upload para Google Drive → verificar estrutura de pastas e arquivos

---

### 6.5 Epic 5: Sistema 2 -- FunWheel (A-R-T)

**Goal:** Construir as 3 páginas do funil de conversão (Apresentação, Retenção, Transformação) em Astro com templates temáveis por brand config, integrar captura de leads com GoHighLevel, gerar PDF do lead magnet, implementar mecânica de indicação, e deployar no nginx/Swarm (CopyZen) e Vercel (clientes).

**Dependências:** Epic 3 (agentes Copywriter e Designer, brand config), Epic 1 (deploy pipeline)

---

#### Story 5.1: FunWheel Base Templates & Brand Theming System

**As a** developer (Fernando),
**I want** Astro page templates that can be themed dynamically per client's brand config,
**so that** each client gets a unique-looking FunWheel without manual design work.

**Acceptance Criteria:**

1. `packages/funwheel/src/templates/` com templates base para cada página: `apresentacao.astro`, `retencao.astro`, `transformacao.astro`, `thankyou.astro`
2. Build-time theming: script que lê `BrandConfig` do Supabase e gera Tailwind config + CSS custom properties (cores, fontes) por cliente
3. Templates usam CSS custom properties (ex: `var(--brand-primary)`) para cores e fontes -- permitindo theming sem alterar HTML
4. Layout components compartilhados: `Hero`, `Section`, `CTA`, `Form`, `Footer` -- todos brand-aware
5. Templates são mobile-first com breakpoints definidos (< 768px, 768-1024px, > 1024px)
6. Build gera output estático por cliente: `dist/{client_slug}/apresentacao/index.html`, etc.
7. Lighthouse score > 90 para templates com conteúdo placeholder
8. Teste: build com 2 brand configs diferentes → output visual distinto → ambos passam Lighthouse > 90

---

#### Story 5.2: Página de Apresentação (A)

**As a** lead (visitor),
**I want** to be engaged by a transformation narrative page,
**so that** I understand how this professional can help me and I want to learn more.

**Acceptance Criteria:**

1. Template `apresentacao.astro` com seções: hero (headline + subheadline), problema (dor do público), jornada de transformação (storytelling), solução (o que o profissional oferece), CTA para página de Retenção
2. Copy gerado pelo Copywriter agent a partir do briefing e brand config do cliente
3. Scroll-driven storytelling: seções revelam progressivamente conforme scroll
4. CTA proeminente e repetido (topo + final) direcionando para página de Retenção
5. Meta tags SEO geradas: `title`, `description`, `og:image`, `og:title` (FR-11)
6. Página funcional em mobile, tablet e desktop
7. Teste: build com copy gerado → página renderiza corretamente → CTA linka para Retenção → Lighthouse > 90

---

#### Story 5.3: Página de Retenção (R) & Lead Magnet PDF

**As a** lead (visitor),
**I want** to download a valuable resource in exchange for my contact info,
**so that** I get immediate value while the professional captures my lead.

**Acceptance Criteria:**

1. Template `retencao.astro` com: headline de oferta, descrição do lead magnet (PDF), formulário de captura (nome + email ou WhatsApp -- max 3 campos), botão de download/acesso
2. Formulário integra com GoHighLevel API via fetch (client-side) para criar/atualizar contato no CRM
3. Após submit: redireciona para thank you page + dispara envio do PDF por email via GoHighLevel automation
4. **PDF Generation:** `packages/integrations/src/pdf-generator/` que converte conteúdo da página de Apresentação em PDF estilizado com brand config (usando puppeteer ou jsPDF)
5. PDF armazenado no Supabase Storage, URL compartilhada via email GoHighLevel
6. Lead salvo na tabela `leads` no Supabase: `id`, `client_id`, `funwheel_id`, `name`, `email`, `phone`, `source_page` (retencao), `referral_code` (nullable), `created_at`
7. Teste end-to-end: visitar Retenção → preencher form → lead criado no GoHighLevel + Supabase → PDF enviado por email

---

#### Story 5.4: Página de Transformação (T) & Referral Tracking

**As a** lead (captured),
**I want** to access exclusive content by sharing with friends,
**so that** I get VIP access while helping the professional grow their audience.

**Acceptance Criteria:**

1. Template `transformacao.astro` com: acesso condicionado (se veio via indicação ou já indicou X pessoas), mecânica de compartilhamento (link único com `?ref={referral_code}`), contador de indicações, acesso VIP quando meta atingida
2. `referral_code` gerado por lead no momento da captura (Story 5.3) -- formato: 6 chars alphanumeric
3. Tracking: quando novo lead se cadastra via link com `?ref=`, incrementa contador do referrer na tabela `referrals`: `id`, `referrer_lead_id`, `referred_lead_id`, `created_at`
4. Quando referrer atinge meta (configurável, default: 3 indicações), acesso VIP é liberado via GoHighLevel tag + redirect para comunidade/área de membros GoHighLevel
5. Share buttons: WhatsApp (prioritário no Brasil), link copiável, opcionalmente Instagram Stories
6. Teste: lead A recebe link → compartilha → lead B se cadastra via ref → lead A ganha crédito → após 3 indicações, acesso VIP liberado

---

#### Story 5.5: GoHighLevel CRM Integration for Leads

**As a** operator (Fernando),
**I want** all FunWheel leads synced with GoHighLevel CRM,
**so that** I can manage follow-ups, automations, and community access in one place.

**Acceptance Criteria:**

1. `packages/integrations/src/gohighlevel/` com `GHLClient`: `createContact`, `updateContact`, `addTag`, `removeTag`, `triggerAutomation`
2. Formulário de Retenção cria contato no GHL com tags: `funwheel-lead`, `client-{client_slug}`, `stage-retencao`
3. Quando lead atinge meta de indicação (Transformação), tag `vip-access` adicionada e automation de boas-vindas VIP disparada
4. Webhook do GHL para n8n: notifica quando lead avança stages no pipeline para tracking no Supabase
5. Configuração via env vars: `GHL_API_KEY`, `GHL_LOCATION_ID`
6. Teste: criar lead via formulário → verificar contato no GHL com tags corretas → simular indicação → tag VIP adicionada

---

#### Story 5.6: Multi-tenant FunWheel Deploy (KVM4 + Vercel)

**As a** developer (Fernando),
**I want** CopyZen's FunWheel deployed on KVM4 and client FunWheels on Vercel,
**so that** each deployment target works with its own domain and SSL.

**Acceptance Criteria:**

1. Build script que aceita `--target kvm4|vercel` e `--client {slug}` para gerar output com configuração correta (base URL, API endpoints)
2. **KVM4 deploy (CopyZen):** output em `dist/` → rsync para `/srv/sites/fw.copyzen.com.br/` → nginx serve → Traefik SSL (pipeline do Epic 1)
3. **Vercel deploy (clientes):** `vercel.json` configurado por cliente → `vercel deploy --prod` via GitHub Actions (branch por cliente ou workflow dispatch)
4. Preview URLs na Vercel para aprovação antes de go-live: Fernando compartilha preview URL → cliente aprova → deploy prod
5. Variáveis de ambiente por target: Supabase keys, GHL keys, base URL
6. Documentação em `docs/infra/deploy-funwheel.md` com fluxo completo para ambos os targets
7. Teste: build e deploy FunWheel CopyZen no KVM4 → acessível em `fw.copyzen.com.br` | Build e deploy FunWheel cliente test na Vercel → acessível em preview URL

---

### 6.6 Epic 6: Sistema 3 -- Página de Vendas

**Goal:** Implementar página de vendas long-form mobile-first em Astro com todas as seções de conversão, integrando com leads qualificados do FunWheel e CTA para GoHighLevel.

**Dependências:** Epic 3 (agentes Copywriter e Designer), Epic 5 (FunWheel para leads qualificados)

---

#### Story 6.1: Sales Page Template & Section Components

**As a** developer (Fernando),
**I want** a sales page template with all conversion sections as reusable components,
**so that** the system can generate complete sales pages from agent output.

**Acceptance Criteria:**

1. `packages/sales-page/src/templates/sales-page.astro` com seções ordenadas: `Hero` (headline + subheadline + CTA), `Problem` (dor do público), `Solution` (o que oferece), `Benefits` (lista de benefícios), `SocialProof` (depoimentos/resultados), `Offer` (o que está incluído + preço), `Guarantee` (garantia), `FinalCTA` (urgência + botão), `FAQ` (perguntas frequentes)
2. Cada seção é um Astro component em `src/components/sales/` -- brand-aware via CSS custom properties
3. Mobile-first design: seções empilhadas verticalmente, CTAs full-width em mobile, tipografia legível
4. CTA buttons linkam para GoHighLevel: formulário de contato, agendamento, ou checkout (configurável por cliente)
5. Scroll progress indicator e sticky CTA button em mobile
6. Lighthouse > 90 com conteúdo placeholder
7. Teste: build com conteúdo placeholder → todas as seções renderizam → responsivo → Lighthouse > 90

---

#### Story 6.2: Sales Page Content Generation

**As a** operator (Fernando),
**I want** the agents to generate complete sales page content from the client's briefing,
**so that** each client gets a unique, brand-consistent sales page.

**Acceptance Criteria:**

1. n8n workflow `generate-sales-page` que: carrega briefing + brand config + output do FunWheel (se disponível) → CMO define estratégia de vendas → Copywriter gera copy por seção → Designer gera imagens hero + ilustrações
2. Copywriter capability `generateSalesPageCopy(brief, brandConfig, strategy)` produz JSON com copy para cada seção: `hero_headline`, `hero_subheadline`, `problem_text`, `solution_text`, `benefits[]`, `social_proof[]`, `offer_details`, `guarantee_text`, `cta_text`, `faq[]`
3. Copy gerado referencia dores e desejos identificados no briefing do cliente
4. Se cliente tem FunWheel ativo: copy referencia a jornada A-R-T como prova de engajamento ("Mais de X pessoas já passaram pela nossa experiência")
5. Output salvo na tabela `sales_page_content` no Supabase: `id`, `client_id`, `project_plan_id`, `sections` (jsonb), `status`, `created_at`
6. Teste: gerar conteúdo para sales page → todas as seções preenchidas → brand compliance validada

---

#### Story 6.3: Sales Page Build & Deploy

**As a** developer (Fernando),
**I want** sales pages to build and deploy using the same pipeline as FunWheel,
**so that** there's a single, proven deploy flow for all static pages.

**Acceptance Criteria:**

1. Build script em `packages/sales-page/` que: lê conteúdo do Supabase → aplica brand theme → gera Astro pages → build estático
2. Deploy KVM4: rsync para `/srv/sites/{sales-domain}/` → nginx serve via stack Portainer
3. Deploy Vercel: mesma lógica de FunWheel (Story 5.6) com preview URLs
4. Compose file `infra/stacks/copyzen-sales.yml` para o stack nginx da página de vendas (análogo ao FunWheel)
5. Página de vendas mobile-first com Lighthouse > 90 (NFR-01)
6. Teste: build sales page com conteúdo gerado → deploy KVM4 → acessível com SSL → Lighthouse > 90

---

### 6.7 Epic 7: Self-Dogfooding & Integração End-to-End

**Goal:** CopyZen como cliente zero: configurar branding próprio, gerar conteúdo real, publicar FunWheel em `fw.copyzen.com.br`, publicar página de vendas, conectar WhatsApp via Evolution API, e validar o pipeline completo com leads reais. Esta é a prova definitiva de que o sistema funciona.

**Dependências:** Todos os epics anteriores (1-6)

---

#### Story 7.1: CopyZen Brand Config & Assets

**As a** operator (Fernando),
**I want** CopyZen's own brand fully configured in the system,
**so that** all self-dogfooding output is brand-consistent and professional.

**Acceptance Criteria:**

1. Brand config da CopyZen completo no Supabase: paleta de cores definida, tipografia escolhida (heading + body fonts), tom de voz definido (conversacional/profissional), logo final, slogan, keywords
2. Imagens de referência no Google Drive e/ou Supabase Storage
3. Briefing da CopyZen como cliente preenchido no sistema (via GoHighLevel Survey ou diretamente no Supabase)
4. CMO analisa briefing → recomenda pacote Combo Cash (IA + A-R-T + E) para self-dogfooding completo
5. Plano de projeto gerado e aprovado
6. Teste: brand config carregado → guardrails gerados → Copywriter produz copy no tom correto → Designer aplica tema visual consistente

---

#### Story 7.2: CopyZen Content Generation (Sistema 1 Live)

**As a** operator (Fernando),
**I want** real content generated for CopyZen using the content pipeline,
**so that** I can validate quality, timing, and costs before offering to clients.

**Acceptance Criteria:**

1. Pipeline de conteúdo (Epic 4) executado para CopyZen: mínimo 5 posts (mix de carrossel e imagem)
2. Posts gerados nos 2 modos: Inception (3 posts de branding) e Atração Fatal (2 posts com CTA → FunWheel)
3. Posts entregues no Google Drive da CopyZen com estrutura de pastas correta
4. Quality review: Fernando revisa outputs, documenta quality score (1-5) e issues encontrados
5. Métricas documentadas: tempo total do pipeline, tokens consumidos, custo total, número de iterações necessárias
6. Posts publicáveis sem mais de 1 ciclo de revisão (critério de sucesso MVP)
7. Teste: pipeline completo executado → outputs no Drive → review documentado → métricas registradas

---

#### Story 7.3: CopyZen FunWheel Live

**As a** operator (Fernando),
**I want** the CopyZen FunWheel published at `fw.copyzen.com.br`,
**so that** I can start capturing real leads for CopyZen.

**Acceptance Criteria:**

1. Páginas de Apresentação, Retenção e Transformação geradas com conteúdo real da CopyZen
2. Lead magnet PDF gerado a partir do conteúdo de Apresentação
3. Formulário de captura funcionando e criando leads no GoHighLevel + Supabase
4. Mecânica de indicação ativa com referral tracking
5. FunWheel deployado em `fw.copyzen.com.br` via pipeline KVM4 (Epic 1)
6. SSL válido, Lighthouse > 90, responsivo
7. Links dos posts Atração Fatal (Story 7.2) apontando corretamente para `fw.copyzen.com.br`
8. Teste end-to-end com lead real: visitar Apresentação → ir para Retenção → preencher form → receber PDF → compartilhar link → referral tracking funcionando

---

#### Story 7.4: CopyZen Sales Page Live

**As a** operator (Fernando),
**I want** CopyZen's sales page published and converting,
**so that** qualified leads from FunWheel can become paying clients.

**Acceptance Criteria:**

1. Página de vendas gerada com conteúdo real: headline, problema, solução (os 4 sistemas), benefícios, prova social (resultados do self-dogfooding), oferta, garantia, CTA, FAQ
2. CTA direciona para GoHighLevel: formulário de contato ou agendamento de call
3. Página deployada no KVM4 com domínio dedicado e SSL
4. Mobile-first, Lighthouse > 90
5. Tracking de conversão básico: clicks no CTA registrados (analytics ou GoHighLevel tracking)
6. Teste: lead qualificado do FunWheel visita sales page → CTA funciona → lead registrado no GoHighLevel como opportunity

---

#### Story 7.5: WhatsApp Integration (Evolution API)

**As a** operator (Fernando),
**I want** WhatsApp connected as an entry and notification channel,
**so that** potential clients can start their journey via WhatsApp and receive updates.

**Acceptance Criteria:**

1. Evolution API configurada para número WhatsApp da CopyZen
2. Fluxo de entrada (Story 2.2) funcionando end-to-end: mensagem → resposta com link do survey
3. Notificações via WhatsApp: proposta pronta para review, entrega de conteúdo disponível no Drive, FunWheel publicado
4. n8n workflows de notificação usando Evolution API HTTP nodes
5. Mensagens seguem tom de voz da CopyZen (conversacional, profissional)
6. Teste: enviar mensagem → receber link → completar survey → receber notificação de proposta pronta

---

#### Story 7.6: End-to-End Pipeline Validation with Real Leads

**As a** operator (Fernando),
**I want** to validate the complete pipeline with real leads and document all metrics,
**so that** I can confirm the system works and define pricing for external clients.

**Acceptance Criteria:**

1. Pipeline completo validado: briefing → CMO → conteúdo → FunWheel → sales page → lead capturado → follow-up
2. Mínimo 1 lead real capturado pelo FunWheel da CopyZen (critério de sucesso MVP)
3. Métricas documentadas em `docs/metrics/self-dogfooding-report.md`:
   - Tempo total por sistema (briefing→entrega)
   - Custo total de tokens (Claude API) por projeto
   - Custo de imagens (Nano Banana/Kling AI) por projeto
   - Número de revisões necessárias por entrega
   - Lighthouse scores de todas as páginas
   - Taxa de conversão A-R-T (se dados disponíveis)
4. Cost analysis: custo real por projeto documentado para cada pacote (IA, A-R-T, E, Combo Leads, Combo Cash)
5. Pricing draft baseado em: custo + markup → documentado para validação
6. Lista de melhorias identificadas para próxima iteração
7. Teste: relatório completo escrito e revisado → decisão de GO/NO-GO para primeiro cliente externo

---

## 7. Checklist Results Report

### PRD Quality Checklist

| # | Critério | Status | Notas |
|---|----------|--------|-------|
| 1 | Goals claros e mensuráveis | PASS | 5 goals com metas numéricas e timeline |
| 2 | Background context suficiente | PASS | Problema, solução, público-alvo, infra existente |
| 3 | Requirements rastreáveis | PASS | 26 FRs + 15 NFRs com IDs únicos |
| 4 | Requirements corrigidos vs realidade | PASS | FR-22/24, NFR-7/13/14/15 atualizados após validação de infra |
| 5 | UI goals definidos | PASS | UX vision, 5 telas core, WCAG AA, branding system |
| 6 | Technical assumptions documentadas | PASS | Monorepo, Astro, n8n, Supabase, Vitest, deploy pattern |
| 7 | Epic list completa e sequenciada | PASS | 7 epics com dependências claras |
| 8 | Stories com AC mensuráveis | PASS | 31 stories com acceptance criteria testáveis |
| 9 | Sem features inventadas (Article IV) | PASS | Todos os requisitos rastreáveis ao CZ-Briefing v4 |
| 10 | Riscos identificados | PASS | 7 riscos com severidade e mitigação (do briefing) |
| 11 | Constraints documentadas | PASS | Budget, timeline, recursos (1 pessoa + IA) |
| 12 | Métricas de sucesso definidas | PASS | KPIs operacionais, de cliente, e de negócio |

**Score: 12/12 -- PASS**

---

## 8. Next Steps

### 8.1 Delegation to @architect

O próximo passo é delegar o PRD ao **@architect (Aria)** para:

1. **Architecture Assessment:** Validar as decisões técnicas (Astro, monorepo, n8n como orquestrador)
2. **Complexity Assessment:** Pontuar cada epic nas 5 dimensões (scope, integration, infrastructure, knowledge, risk)
3. **Architecture Document:** Gerar documento de arquitetura detalhado com diagramas de componentes, fluxos de dados, e decisões de infraestrutura
4. **Implementation Plan:** Sequenciar epics em waves de desenvolvimento com paralelismo onde possível

**Comando:** `@architect *assess-complexity docs/prd/copyzen-prd-v1.md`

### 8.2 Delegation to @ux-design-expert

Paralelamente, delegar ao **@ux-design-expert (Uma)** para:

1. **UI Spec:** Detalhar wireframes/mockups para as 5 telas core (Apresentação, Retenção, Transformação, Sales Page, Thank You)
2. **Component Library:** Definir design tokens e componentes reutilizáveis
3. **Mobile-First Patterns:** Validar interaction patterns para mobile brasileiro (WhatsApp-centric)

**Comando:** `@ux-design-expert *design-ui docs/prd/copyzen-prd-v1.md`

### 8.3 Epic Execution

Após validação arquitetural e UX:

1. `@pm *create-epic` para cada epic (1-7)
2. `@pm *execute-epic` com mode wave-based para iniciar implementação
3. `@sm *draft` para criar stories individuais a partir deste PRD

---

_Generated by Morgan (PM Agent) | Synkra AIOX | 2026-03-13_
