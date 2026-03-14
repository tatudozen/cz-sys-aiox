# Project Brief: CopyZen — Plataforma de Marketing Conversacional Automatizado por IA

**Versão:** 4.0
**Data:** 2026-03-12
**Autor original:** Atlas (Analyst Agent) em colaboração com Fernando Santiago
**Revisão:** Claude (v4 — arquitetura de infra definida: KVM4 para CopyZen, Vercel para clientes)
**Status:** Em revisão

---

## 1. Resumo Executivo

**CopyZen** é uma agência de marketing digital OPB (One-Person Business), fundada em 2024, especializada em marketing conversacional — criando conversas fluidas online que convertem, combinando copywriting com automação por IA para gerar leads qualificados para pequenos negócios e profissionais liberais no Brasil.

**Problema central:** Pequenos negócios e profissionais liberais precisam de presença digital consistente para atrair clientes, mas não têm tempo, equipe ou conhecimento técnico para criar funis de marketing eficientes.

**Proposta de valor:** Uma plataforma integrada com 4 sistemas modulares — Geração de Projeto, Geração de Conteúdo (IA), FunWheel (funis A-R-T) e Páginas de Vendas — operados por agentes de IA especializados com núcleo compartilhado de briefing, copywriting e branding. O output de cada sistema alimenta o próximo (briefing → conteúdo → captação → conversão), garantindo consistência de marca e eficiência operacional.

**Estratégia de validação:** A CopyZen será seu próprio primeiro cliente (self-dogfooding), mirando profissionais liberais em geral, utilizando os sistemas para atrair e converter seus próprios clientes antes de oferecer o serviço externamente.

---

## 2. Problema

### 2.1 Contexto

Pequenos negócios e profissionais liberais (dentistas, terapeutas, consultores, etc.) enfrentam um paradoxo: precisam de presença digital consistente para atrair clientes, mas não têm recursos para mantê-la.

**Cenário típico:**

- Profissional passa o dia atendendo clientes, sem tempo para criar conteúdo ou gerenciar redes sociais
- Não tem conhecimento técnico de copywriting, automação, design de funis ou tráfego pago
- Agências tradicionais cobram valores elevados e entregam soluções genéricas
- Quem tenta fazer sozinho precisa aprender e pagar por múltiplas ferramentas sem integração (Canva, MailChimp, landing page builders, CRMs)

### 2.2 Impacto

- Profissionais qualificados perdem clientes para concorrentes com melhor presença digital
- Investimento em tráfego pago sem funil estruturado resulta em dinheiro desperdiçado
- Leads sem qualificação geram reuniões improdutivas
- Comunicação inconsistente dilui marca pessoal e reduz confiança do público

### 2.3 Por que as Soluções Existentes Falham

| Solução | Problema |
|---------|----------|
| Agências tradicionais | Caras, lentas, dependentes de pessoas, frequentemente não entendem o negócio do cliente |
| Ferramentas self-service (Mailchimp, HubSpot) | Curva de aprendizado alta, exigem tempo de gestão que o profissional não tem |
| Freelancers | Inconsistência de qualidade, falta de visão sistêmica do funil |
| Templates prontos | Genéricos, sem personalização de marca, sem estratégia de copywriting |

---

## 3. Solução Proposta

### 3.1 Conceito Central

Uma plataforma que transforma o briefing de um cliente em entregas completas — posts para redes sociais, funis de captação e páginas de vendas — com consistência de marca e qualidade criativa, operada por agentes de IA especializados e orquestrada por uma pessoa.

### 3.2 Os 4 Sistemas (Pipeline Integrado)

A plataforma será operada inicialmente apenas pela CopyZen (modelo agência). O self-service é visão futura, não MVP.

**Sistema 0 — Geração de Projeto**
- **Input:** Briefing inicial do cliente (via GoHighLevel Survey ou WhatsApp + Evolution API)
- **Output:** Plano de Projeto customizado e aprovado
- **Fluxo:** Survey inicial → webhook → n8n formata → Agente CMO analisa → Recomendação de pacote → Proposta para aprovação → Surveys específicos por sistema contratado → Plano de projeto detalhado

O cliente escolhe entre 5 combinações:
1. Apenas Geração de Conteúdo (IA)
2. Apenas FunWheel (A-R-T)
3. Apenas Página de Vendas (E)
4. Combo Leads: IA + A-R-T
5. Combo Cash: IA + A-R-T + E

**Sistema 1 — Geração de Conteúdo (Inception & Atração Fatal)**
- **Input:** Briefing do cliente + diretrizes de branding + imagens de referência (Google Drive compartilhado)
- **Output:** Pacotes de posts prontos para publicação, entregues via Google Drive compartilhado
- Subsistemas MVP: Carrossel e Imagem
- Geração de imagem via Nano Banana / Kling AI
- Dois modos estratégicos: Inception (branding/antecipação) e Atração Fatal (CTA para FunWheel)

**Sistema 2 — FunWheel (A-R-T)**
- **Input:** Briefing do cliente + conteúdo do Sistema 1
- **Output:** Páginas do funil + integração com CRM (GoHighLevel)
- Etapas: **A**presentação (narrativa de transformação) → **R**etenção (captura de lead via lead magnet — PDF da Apresentação) → **T**ransformação (acesso à comunidade/área de membros no GoHighLevel via indicação/compartilhamento)
- Rastreamento de indicações para qualificação de leads
- Hospedagem CopyZen: KVM4 Hostinger | Hospedagem clientes: Vercel

**Sistema 3 — Página de Vendas (E)**
- **Input:** Briefing do cliente + leads qualificados do FunWheel
- **Output:** Página de vendas long-form com oferta irresistível
- Seções: headline, problema, solução, benefícios, prova social, oferta, garantia, CTA, FAQ
- Hospedagem CopyZen: KVM4 Hostinger | Hospedagem clientes: Vercel

### 3.3 Núcleo Compartilhado de Agentes

Os 4 sistemas compartilham 3 agentes centrais que garantem consistência:

- **CMO:** Orquestra o planejamento e execução de cada projeto
- **Designer:** Mantém consistência visual (cores, estilo, templates), utiliza referências do Google Drive do cliente, gera imagens via Nano Banana / Kling AI
- **Copywriter:** Produz copy conversacional com guardrails de branding por cliente

**Princípios de arquitetura:**
- Agentes criativos usam LLMs com guardrails definidos por cliente
- Tarefas mecânicas (formatação, deploy, integração) executadas via código
- Validação em cada etapa antes de prosseguir

### 3.4 Diferenciadores

- Pipeline integrado end-to-end (conteúdo → captação → conversão)
- Consistência de marca em todas as entregas
- Custo acessível via automação por IA vs. agências tradicionais
- Marketing conversacional (não templates genéricos)
- Modelo OPB escalável via orquestração de agentes

---

## 4. Público-Alvo

### 4.1 Self-Dogfooding: Profissionais Liberais em Geral

Para a fase de validação, o FunWheel da CopyZen mirará profissionais liberais em geral (não apenas saúde), incluindo consultores, coaches, advogados, contadores, dentistas, terapeutas, etc.

### 4.2 Segmento Primário (pós-validação): Profissionais de Saúde e Bem-Estar

**Perfil:** Dentistas, médicos, terapeutas, nutricionistas, profissionais de estética. Atuam de forma autônoma ou em clínicas pequenas (1-5 profissionais). Faturamento mensal: R$ 10k-80k. Idade: 28-55 anos. Cidades médias e grandes no Brasil.

**Comportamento atual:**
- Postam esporadicamente no Instagram, sem estratégia
- Dependem de indicação boca-a-boca
- Já tentaram agências/freelancers com resultados inconsistentes
- Investem em tráfego pago sem funil estruturado
- Usam WhatsApp manualmente como canal principal

**Dores:** Falta de tempo para marketing, gastos sem resultado com agências, não sabem transformar seguidores em clientes, concorrentes com presença digital melhor.

**Objetivos:** Agenda cheia com pacientes qualificados, presença digital profissional sem esforço pessoal, ROI claro, construir autoridade no nicho.

### 4.3 Segmento Secundário: Pequenos Negócios de Serviços

**Perfil:** Consultores, coaches, advogados, contadores, personal trainers. Solo ou microempresas (1-3 funcionários). Faturamento mensal: R$ 5k-50k.

**⚠️ Nota:** Nenhum segmento foi validado com pesquisa real. O MVP é a prova de conceito para validar demanda. Pricing será definido com base nos custos levantados durante o self-dogfooding.

---

## 5. Métricas de Sucesso

### 5.1 Objetivos de Negócio

| Objetivo | Meta | Prazo |
|----------|------|-------|
| Self-dogfooding completo | Posts + FunWheel + página de vendas da CopyZen no ar | 3-4 meses |
| Primeiro cliente externo | 1 cliente pagante | 4-5 meses |
| Receita recorrente | 5 clientes ativos | 12 meses |
| Eficiência OPB | Atender até 10 clientes simultâneos | 18 meses |

### 5.2 Métricas do Cliente

- Primeiro pacote de posts entregue em até 5 dias úteis após briefing aprovado
- FunWheel publicado e captando leads em até 15 dias úteis
- Aumento mínimo de 30% no volume de leads nos primeiros 60 dias
- Taxa de qualificação de leads (etapa T) acima de 20%
- NPS acima de 8

### 5.3 Modelo de Revisão

- 1 ciclo de revisão gratuito incluído por entrega
- Revisões adicionais são pagas
- Cliente valida e aprova antes da publicação

### 5.4 KPIs Operacionais

**CopyZen:** tempo médio de entrega por sistema, custo por entrega (tokens + horas + ferramentas), taxa de retrabalho, capacidade simultânea.

**Cliente:** leads gerados/mês, taxa de conversão A-R-T, engajamento de conteúdo, CAC do cliente final.

**Negócio:** receita por projeto, churn rate, LTV, LTV/CAC ratio (meta > 3x).

### 5.5 Pricing

Modelo por projeto (não mensal). Preço = custo de tokens + ferramentas + markup. Diferentes pacotes variam por número e tipo de postagens (imagem, carrossel, vídeo). Valores a serem definidos durante o self-dogfooding com base nos custos reais levantados.

---

## 6. Escopo do MVP

### 6.1 Incluído no MVP

- **Sistema 0:** GoHighLevel Surveys (inicial + específicos por sistema) → webhook → n8n → Agente CMO → proposta → plano de projeto
- **Sistema 1:** Subsistemas Carrossel e Imagem com modos Inception e Atração Fatal. Imagens via Nano Banana / Kling AI. Entrega via Google Drive compartilhado
- **Sistema 2:** FunWheel completo (A-R-T) com landing pages, captura de lead (lead magnet = PDF da Apresentação), mecânica de indicação, acesso VIP via comunidade GoHighLevel. CopyZen hospedado na KVM4, clientes na Vercel
- **Sistema 3:** Página de vendas long-form mobile-first. CopyZen hospedado na KVM4, clientes na Vercel
- **Núcleo:** Agentes CMO, Designer e Copywriter
- **Self-dogfooding:** CopyZen como cliente zero (público: profissionais liberais em geral)
- **WhatsApp (básico):** Evolution API para contato inicial e envio de link do Survey

### 6.2 Fora do MVP

Short Video, Long Video, VSL, tráfego pago automatizado, dashboard do cliente, WhatsApp Bot completo, multi-idioma, marketplace de templates, interface self-service para clientes, A/B testing.

### 6.3 Critérios de Sucesso do MVP

1. Self-dogfooding completo (posts publicados, FunWheel ativo, página de vendas no ar)
2. Pipeline funcional end-to-end (>80% automatizado)
3. Entregas publicáveis com no máximo 1 ciclo de revisão
4. Pelo menos 1 lead real capturado pelo FunWheel da CopyZen
5. Custos por projeto documentados para definir pricing

---

## 7. Considerações Técnicas

### 7.1 Infraestrutura Existente

| Recurso | Status |
|---------|--------|
| VPS Hostinger KVM4 (4 CPU, 16GB RAM, 200GB disco, SP-Brasil) | Contratada até 2027-06-02 |
| n8n (self-hosted Docker @ KVM4) | Rodando |
| Evolution API (Docker @ KVM4) | Rodando |
| GoHighLevel (CRM, Surveys, Comunidade) | Conta ativa, survey inicial pronto |
| IP: 31.97.26.21 / Host: srv851250.hstgr.cloud | Debian 11 |

### 7.2 Decisões de Infraestrutura

| O quê | Onde | Por quê |
|-------|------|---------|
| Tudo da CopyZen (FunWheel, vendas, API, agentes) | KVM4 | Já contratada, sem custo extra, testes direto sem ngrok |
| FunWheel + vendas de clientes | Vercel | CDN, SSL auto, preview URLs para aprovação, isolamento |
| Banco de dados | Supabase Cloud | RLS, Storage, free tier generoso |
| Orquestração + WhatsApp | KVM4 | n8n + Evolution já rodam lá |

### 7.3 Stack Definida

| Camada | Tecnologia | Onde roda |
|--------|-----------|-----------|
| Captura de briefing | GoHighLevel (Surveys) → webhook | GoHighLevel Cloud |
| Canal de entrada alternativo | WhatsApp via Evolution API | KVM4 |
| Orquestração | n8n (self-hosted) | KVM4 (Docker) |
| LLM | Claude API (Anthropic) | API externa |
| Geração de imagem | Nano Banana / Kling AI | API externa |
| Banco de dados | Supabase (PostgreSQL) com RLS | Supabase Cloud |
| Storage de assets | Supabase Storage | Supabase Cloud |
| CRM / Comunidade VIP | GoHighLevel | GoHighLevel Cloud |
| Frontend (páginas CopyZen) | Astro ou Next.js (SSG), Tailwind CSS | KVM4 (Docker) |
| Frontend (páginas clientes) | Astro ou Next.js (SSG), Tailwind CSS | Vercel |
| Reverse proxy | Caddy | KVM4 |
| Entrega de posts | Google Drive compartilhado | Google Cloud |
| CI/CD | GitHub Actions | GitHub → KVM4 + Vercel |

### 7.4 Domínios

| Recurso | Domínio | Hospedagem |
|---------|---------|------------|
| FunWheel da CopyZen | fw.copyzen.com.br | KVM4 |
| Plataforma CopyZen | fw.alquimiazen.com.br | KVM4 |
| FunWheel de clientes | Subdomínio CopyZen (trial) ou domínio próprio | Vercel |

### 7.5 Requisitos de Performance

- Lighthouse score > 90, FCP < 2s em 4G
- Briefing → primeiro output em < 24h
- Tempo de resposta por etapa de agente < 60s

### 7.6 Segurança

- LGPD compliance
- Supabase RLS para isolamento por cliente
- Secrets via variáveis de ambiente
- SSL via Caddy (KVM4) e Vercel (clientes)

---

## 8. Restrições e Premissas

### 8.1 Restrições

- **Budget:** Bootstrap, sem capital externo. Custos estimados: Claude API ~$20-50/mês, Supabase free→$25/mês, GoHighLevel (já existente), KVM4 Hostinger (já existente), Vercel free tier para clientes iniciais
- **Recursos:** 1 pessoa (Fernando) + assistência de IA (Claude). 20-30h/semana
- **Timeline:** MVP em ~14 semanas (com buffers)
- **Técnico:** Dependência de APIs externas, qualidade de copy em PT-BR depende do LLM, sem produção de vídeo no MVP

### 8.2 Premissas (a validar durante self-dogfooding)

- Profissionais liberais estão dispostos a pagar por marketing automatizado por IA
- O modelo OPB + agentes é viável para atender múltiplos clientes com qualidade
- Claude API manterá qualidade e pricing acessível
- Copy por IA com guardrails é "good enough" (cliente valida com 1 revisão gratuita)
- Funis baseados em texto convertem suficientemente sem vídeo
- PDF da Apresentação funciona como lead magnet eficaz

---

## 9. Riscos

| Risco | Severidade | Mitigação |
|-------|-----------|-----------|
| Escopo ambicioso para 1 pessoa em ~14 semanas | Alta | "MVP do MVP" como plano B. Assistência de IA para acelerar dev |
| Qualidade de output insuficiente | Alta | Guardrails robustos + 1 ciclo de revisão humana |
| Market-fit não validado | Alta | Self-dogfooding É a validação. Plano B: tráfego pago, prospecção ativa, networking |
| Dependência de LLM único | Média | Abstrair camada de LLM para permitir fallback |
| OPB insustentável / burnout | Média | Medir tempo por cliente. Primeiro hat a delegar: design ou atendimento comercial |
| Competição acelerada em IA | Média | Diferencial em copywriting conversacional + atendimento personalizado |
| KVM4 como ponto único de falha | Média | Backups regulares, Vercel como fallback para páginas críticas |

---

## 10. Questões em Aberto

Ver `CZ-Perguntas-v3.md` para perguntas da rodada 2.

---

*Briefing v4 — 2026-03-12*
