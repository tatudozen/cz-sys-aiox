# CopyZen Wireframes — Mid-Fidelity Design
**Phase:** 1 - UX Research & Design
**Fidelity:** Mid-Fidelity (layout + hierarchy + some content)
**Date:** 2026-03-14
**Designer:** Uma (UX-Design-Expert)

---

## 🎨 Design Tokens

### Color Palette
```
Primary (Dark Navy):  #08164a
Secondary (Cyan):    #38bafc
Accent (Gradient):   #08164a → #38bafc
Neutral Light:       #f8f9fa
Neutral Dark:        #1a1a2e
Success:             #10b981
Warning:             #f59e0b
Error:               #ef4444
```

### Gradients
```
Primary Gradient:    linear-gradient(135deg, #08164a 0%, #38bafc 100%)
Dark Gradient:       linear-gradient(180deg, #1a1a2e 0%, #08164a 100%)
Light Gradient:      linear-gradient(135deg, #38bafc 0%, #f8f9fa 100%)
```

### Spacing System (4px base unit)
```
xs:  4px      sm:  8px      md:  16px     lg:  24px
xl:  32px     2xl: 48px     3xl: 64px
```

### Typography
```
H1: 32px, bold, #1a1a2e
H2: 24px, bold, #1a1a2e
H3: 20px, semi-bold, #08164a
Body: 16px, regular, #333
Small: 14px, regular, #666
```

### Breakpoints
```
Mobile:  < 640px
Tablet:  640px - 1024px
Desktop: > 1024px
```

---

## 📱 Screen 1: Sistema 0 — Project Brief (Entrada do Pipeline)

### Wireframe (Mid-Fi)

```
┌─────────────────────────────────────────────────────────────────┐
│ [CopyZen Logo] [Dark Nav] [Help] [Profile] [Logout]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Novo Projeto — Briefing                           [← Voltar]  │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  Selecione a fonte do briefing:                                │
│                                                                 │
│  ┌──────────────────────┐    ┌──────────────────────┐         │
│  │ 📋 Formulário GHL    │    │ 💬 WhatsApp         │         │
│  │ Responda questões   │    │ Conversa natural    │         │
│  │ estruturadas        │    │ com Claude          │         │
│  └──────────────────────┘    └──────────────────────┘         │
│                                                                 │
│  ─────────────────────────────────────────────────────────────│
│                                                                 │
│  Informações do cliente:                                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Nome da empresa *        [                           ]  │  │
│  │                                                         │  │
│  │ Site atual (opcional)    [                           ]  │  │
│  │                                                         │  │
│  │ Redes sociais             [Link Instagram]             │  │
│  │                           [Link TikTok]                │  │
│  │                           [Link LinkedIn]              │  │
│  │                                                         │  │
│  │ OU importar ativos digitais:                           │  │
│  │ [+ Adicionar URL de site] [+ Adicionar perfil social] │  │
│  │                                                         │  │
│  │ Descrevê sua marca (pitch):                            │  │
│  │ ┌────────────────────────────────────────────────────┐ │  │
│  │ │ Conte mais sobre seu negócio, público-alvo...    │ │  │
│  │ │                                                  │ │  │
│  │ │                                                  │ │  │
│  │ │                                                  │ │  │
│  │ └────────────────────────────────────────────────────┘ │  │
│  │                                                         │  │
│  │ Que sistemas você quer ativar?                         │  │
│  │ ☐ Content Gen (posts + carrossel)                      │  │
│  │ ☐ FunWheel (Apresentação-Retenção-Transformação)      │  │
│  │ ☐ Sales Page (página de vendas)                        │  │
│  │ ☐ Email Campaign (automação por e-mail)               │  │
│  │                                                         │  │
│  │ [Analisar Ativos] [Cancelar]   [Prosseguir →]          │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Components (Atomic Design)

**Atoms:**
- Input (text, URL, textarea)
- Checkbox
- Button (primary, secondary)
- Label
- Icon (⭐ for favorites)

**Molecules:**
- Form Field (label + input + helper text)
- Social Link Group (label + 3 input fields)
- Checkbox Group (3+ checkboxes with descriptions)

**Organisms:**
- Header (Logo + Nav)
- Form Section (Title + Fields + Actions)

### Annotations
```
1. **Brand Import:**
   - Clicking "Analisar Ativos" triggers FR-27/28/29 flow
   - If URLs provided, show analysis spinner + extracted brand colors
   - Otherwise, proceed to manual input
   - Display confidence scores (0-100%) if auto-detection succeeds

2. **System Selection:**
   - All 4 systems are optional
   - At least 1 must be selected
   - Show estimated time + cost per system

3. **Next Step:**
   - "Prosseguir →" navigates to Sistema 0.1 (Project Setup)
   - or to CMO analysis if auto-brand-import completed
```

---

## 📱 Screen 2: Sistema 1 — Content Generation (Post Editor)

### Wireframe (Mid-Fi)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] [Home] [Projects] [Content] [FunWheel] [Profile] [Logout]│
├─────────────────────────────────────────────────────────────────┤
│ Project: Acme Corp > Content Generation                         │
├──────────────────────┬──────────────────────────────────────────┤
│                      │                                          │
│ Post Templates       │  📝 Post 1: "Como Começar"             │
│ ──────────────────   │  ════════════════════════════════════  │
│                      │                                          │
│ [✓] Carousel Post    │  Modo: Inception (educacional)         │
│ [ ] Single Image     │  Tipo: Carousel (5 imagens)            │
│ [ ] Video            │                                          │
│ [ ] Story            │  Conteúdo:                              │
│ [ ] Reel             │  ┌───────────────────────────────────┐  │
│                      │  │ 📍 Slide 1: Headline               │  │
│                      │  │ ┌─────────────────────────────────┤  │
│                      │  │ │ "5 Passos para Começar"        │  │
│                      │  │ └─────────────────────────────────┤  │
│                      │  │                                     │  │
│                      │  │ 📍 Slide 2: Descrição              │  │
│                      │  │ ┌─────────────────────────────────┤  │
│                      │  │ │ Primeiro passo é entender...   │  │
│                      │  │ └─────────────────────────────────┤  │
│                      │  │                                     │  │
│                      │  │ 📍 Slide 3: Imagem + Copy         │  │
│                      │  │ ┌─────────────────────────────────┤  │
│                      │  │ │ [Placeholder: Imagem]          │  │
│                      │  │ │ Copy gerada pelo Claude         │  │
│                      │  │ └─────────────────────────────────┤  │
│                      │  │                                     │  │
│                      │  │ [+ Adicionar Slide] [Gerar Slides]│  │
│                      │  │                                     │  │
│                      │  │ Caption (Pinterest Style):         │  │
│                      │  │ ┌─────────────────────────────────┤  │
│                      │  │ │ #marketing #contentcreation   │  │
│                      │  │ │ 5 passos para começar...       │  │
│                      │  │ │ Aprenda como → link.bio        │  │
│                      │  │ └─────────────────────────────────┤  │
│                      │  │                                     │  │
│                      │  │ Imagens:                           │  │
│                      │  │ [Gerar com IA]  [Carregar]        │  │
│                      │  │ [✓ Imagem 1] [✓ Imagem 2]        │  │
│                      │  │ [ ] Imagem 3    [ ] Imagem 4      │  │
│                      │  │ [ ] Imagem 5                       │  │
│                      │  │                                     │  │
│                      │  │ Status: 🔄 Gerando...              │  │
│                      │  │                                     │  │
│                      │  │ [← Anterior] [Próximo →]          │  │
│                      │  │ [Salvar Rascunho] [Agendar]       │  │
│                      │  │ [Publicar Agora]                  │  │
│                      │  │                                     │  │
│                      │  └───────────────────────────────────┘  │
│                      │                                          │
│ Posts na Fila:       │                                          │
│ ──────────────────   │                                          │
│ 3 posts prontos      │                                          │
│ 5 agendados          │                                          │
│ 2 em análise         │                                          │
│                      │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

### Components

**Atoms:**
- Slide container
- Image placeholder
- Text input
- Select/dropdown
- Toggle button

**Molecules:**
- Slide editor (image + text)
- Image selector (upload or generate)
- Caption editor
- Status badge

**Organisms:**
- Template selector (left sidebar)
- Content editor (main area)
- Image panel (right sidebar)
- Preview carousel

### Annotations
```
1. **Generation Flow:**
   - User selects template → Claude generates initial structure
   - User edits slides, adds/modifies text
   - "Gerar com IA" button: respin specific slides
   - Show token usage + cost per post

2. **Image Integration:**
   - [Gerar com IA] → Nano Banana or Kling AI
   - [Carregar] → upload from device or URL
   - Show image confidence score

3. **Publishing:**
   - [Salvar Rascunho] → save to drafts
   - [Agendar] → pick date + time + platform
   - [Publicar Agora] → immediate post (Instagram, TikTok, etc.)

4. **Accessibility:**
   - Alt text auto-generated for images
   - WCAG AA contrast on text overlays
```

---

## 📱 Screen 3: Sistema 2 — FunWheel Pages (A-R-T)

### Wireframe (Mid-Fi)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] [Home] [Projects] [Content] [FunWheel] [Profile] [Logout]│
├─────────────────────────────────────────────────────────────────┤
│ Project: Acme Corp > FunWheel Setup                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  FunWheel - Apresentação, Retenção, Transformação              │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  Status: [Apresentação ✓] [Retenção 🔄] [Transformação ⏳]     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📄 Página: APRESENTAÇÃO                                 │  │
│  │ ───────────────────────────────────────────────────────│  │
│  │                                                         │  │
│  │ Status: Live (2 leads capturados)                       │  │
│  │ URL: copyzen.com/apresentacao/acme-corp                │  │
│  │ QR Code: [████████████████]                             │  │
│  │                                                         │  │
│  │ ┌─────────────────────────────────────────────────────┐│  │
│  │ │                                                     ││  │
│  │ │  [CopyZen A]                                       ││  │
│  │ │  ═══════════════════════════════════════════      ││  │
│  │ │                                                     ││  │
│  │ │  Apresentação/Overview                            ││  │
│  │ │  ────────────────────────────────────────────     ││  │
│  │ │                                                     ││  │
│  │ │  [Hero Image - Gradient #08164a → #38bafc]        ││  │
│  │ │                                                     ││  │
│  │ │  Headline: "Descubra o Poder da Transformação"    ││  │
│  │ │  Subheadline: "Seu Guia de 3 Passos para Sucesso" ││  │
│  │ │                                                     ││  │
│  │ │  [Qual é seu desafio? (Dropdown)]                 ││  │
│  │ │                                                     ││  │
│  │ │  [Próxima Página →]                               ││  │
│  │ │                                                     ││  │
│  │ └─────────────────────────────────────────────────────┘│  │
│  │                                                         │  │
│  │ [Editar Página] [Preview] [Ver Analytics]              │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📄 Página: RETENÇÃO                                     │  │
│  │ ───────────────────────────────────────────────────────│  │
│  │                                                         │  │
│  │ Status: 🔄 Em construção (1 lead em progresso)         │  │
│  │ URL: copyzen.com/retencao/acme-corp (Draft)            │  │
│  │                                                         │  │
│  │ [Editar Página] [Preview] [Publicar]                   │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ 📄 Página: TRANSFORMAÇÃO                                │  │
│  │ ───────────────────────────────────────────────────────│  │
│  │                                                         │  │
│  │ Status: ⏳ Não iniciada (Desbloqueado em 3+ referrals) │  │
│  │ Preview: copyzen.com/transformacao/acme-corp (draft)   │  │
│  │                                                         │  │
│  │ [Editar Página] [Preview]                              │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Estatísticas:                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐               │
│  │ 2 Leads  │ 1 Ativo  │ 0 VIPs   │ 47% Taxa │               │
│  │ Totais   │ Agora    │ Bloqu.   │ Conversão│               │
│  └──────────┴──────────┴──────────┴──────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Components

**Atoms:**
- Status badge (Live, Draft, Locked)
- QR Code display
- Metric card
- Page section

**Molecules:**
- Page header (title + status + URL)
- Hero section (image + text)
- Funnel step card
- Analytics summary

**Organisms:**
- Page preview (iframe-like)
- Page manager (A-R-T list)
- Analytics panel

### Annotations
```
1. **Three-Stage Funnel:**
   - A (Apresentação): Always visible, no gate
   - R (Retenção): Unlocked after lead submits form
   - T (Transformação): Unlocked after 3+ referrals (VIP access)

2. **Page Editing:**
   - [Editar Página] → opens page builder (Astro SSG)
   - Real-time preview while editing
   - Drag-drop sections (hero, form, testimonials, CTA)

3. **Lead Tracking:**
   - QR Code links directly to Apresentação page
   - Each page tracks form submissions
   - Referral code auto-generated per lead

4. **Live Status:**
   - Green = published and live
   - Yellow = draft or in progress
   - Gray = locked (conditions not met)
```

---

## 📱 Screen 4: Sistema 3 — Sales Page Builder

### Wireframe (Mid-Fi)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] [Home] [Projects] [Content] [FunWheel] [Profile] [Logout]│
├─────────────────────────────────────────────────────────────────┤
│ Project: Acme Corp > Sales Page                                 │
├──────────────────────┬──────────────────────────────────────────┤
│                      │                                          │
│ Templates:           │  Sales Page Builder                      │
│ ──────────────────   │  ════════════════════════════════════  │
│                      │                                          │
│ [Minimal]            │  URL: copyzen.com/sales/acme-corp       │
│ [Standard]           │  Live: ✓ (5,234 visitors this month)    │
│ [Premium]            │                                          │
│ [Custom]             │  Page Sections:                          │
│                      │  ────────────────                        │
│ Sections:            │                                          │
│ ──────────────────   │  1️⃣ Hero Section                        │
│                      │     ┌──────────────────────────────┐    │
│ [Hero]               │     │ [Gradient Hero Image]        │    │
│ [Features]           │     │ Headline: "Transform Your... │    │
│ [Pricing]            │     │ CTA: [Get Started →]         │    │
│ [Testimonials]       │     │                              │    │
│ [FAQ]                │     │ [Edit] [Move ↕] [Delete]     │    │
│ [Form]               │     └──────────────────────────────┘    │
│                      │                                          │
│ Publishing:          │  2️⃣ Features Section                    │
│ ──────────────────   │     ┌──────────────────────────────┐    │
│ [Preview]            │     │ Feature 1: 3 Cols Layout    │    │
│ [Mobile]             │     │ Icon + Title + Description  │    │
│ [Desktop]            │     │ ───────────────────────────  │    │
│ [Tablet]             │     │ Feature 1 | Feature 2       │    │
│                      │     │ Feature 3 | Feature 4       │    │
│ Domain:              │     │ Feature 5 | Feature 6       │    │
│ ──────────────────   │     │                              │    │
│ sales.acme-corp.br   │     │ [Add Feature] [Edit All]    │    │
│ [Change Domain]      │     │ [Move ↕] [Delete]           │    │
│                      │     └──────────────────────────────┘    │
│ Integrations:        │                                          │
│ ──────────────────   │  3️⃣ Pricing Cards                       │
│ [✓ Email]            │     ┌──────────────────────────────┐    │
│ [✓ Lead Capture]     │     │ Starter   Pro    Enterprise  │    │
│ [ ] Payment          │     │ $99/mo    $299/mo $999/mo    │    │
│                      │     │ [Features] [Features]         │    │
│ [Save] [Publish]     │     │ [CTA]      [CTA] [CTA]       │    │
│                      │     │                              │    │
│                      │     │ [Add Tier] [Edit] [Delete]   │    │
│                      │     └──────────────────────────────┘    │
│                      │                                          │
│                      │  4️⃣ Testimonials (2 col)                │
│                      │     ┌──────────────────────────────┐    │
│                      │     │ "Transformou meu negócio"    │    │
│                      │     │ - Maria Silva, Founder       │    │
│                      │     │                              │    │
│                      │     │ "ROI em 30 dias"             │    │
│                      │     │ - João Costa, CEO            │    │
│                      │     │                              │    │
│                      │     │ [Add Testimonial]            │    │
│                      │     └──────────────────────────────┘    │
│                      │                                          │
│                      │  5️⃣ Lead Capture Form                   │
│                      │     ┌──────────────────────────────┐    │
│                      │     │ Email *       [________]     │    │
│                      │     │ Phone         [________]     │    │
│                      │     │ Company       [________]     │    │
│                      │     │                              │    │
│                      │     │ [✓ I agree to ToS]           │    │
│                      │     │ [Subscribe to Newsletter]    │    │
│                      │     │                              │    │
│                      │     │ [Get Instant Access]         │    │
│                      │     │                              │    │
│                      │     │ Thank you message on submit  │    │
│                      │     │ Redirect to: [dashboard]    │    │
│                      │     └──────────────────────────────┘    │
│                      │                                          │
│                      │  [↑ Add Section] [↓ Add Section]        │
│                      │  [Save Draft] [Preview] [Publish Live] │
│                      │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

### Components

**Atoms:**
- Text input
- Button (CTA, secondary)
- Checkbox
- Card
- Feature icon

**Molecules:**
- Form field (label + input + validation)
- Feature card (icon + text)
- Pricing card (plan + features + CTA)
- Testimonial card (quote + author)

**Organisms:**
- Hero section
- Features grid
- Pricing table
- Testimonials carousel
- Lead capture form
- Footer

### Annotations
```
1. **Drag-Drop Builder:**
   - [Move ↕] lets users reorder sections
   - [Add Section] inserts new pre-designed sections
   - Live preview updates as user edits

2. **Responsive Design:**
   - [Preview] shows desktop, tablet, mobile layouts
   - All sections auto-responsive
   - Touch targets ≥ 44x44px on mobile

3. **Lead Capture:**
   - Form integrates with GHL or Supabase
   - Auto-assigns lead to FunWheel
   - Thank you page or redirect

4. **Analytics:**
   - Visitor count, conversion rate
   - Form submission tracking
   - Heatmap of clicks (optional)
```

---

## 📱 Screen 5: Dashboard — Project Central

### Wireframe (Mid-Fi)

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] [Home] [Projects] [Content] [FunWheel] [Sales] [Profile] │
├─────────────────────────────────────────────────────────────────┤
│ Dashboard — Acme Corp                    [Edit] [Share] [More] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Overview                         Timeline                      │
│  ═════════════════════════════════════════════════════════════ │
│                                                                 │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐    │
│  │ 📊 Leads    │ 📝 Content  │ 🎡 FunWheel │ 💰 Sales   │    │
│  │ Generated   │ Generated   │ Visitors    │ Conversions│    │
│  │ ┌────────┐  │ ┌────────┐  │ ┌────────┐  │ ┌────────┐ │    │
│  │ │  47    │  │ │  12    │  │ │ 1,234  │  │ │  8     │ │    │
│  │ │ +18%   │  │ │ +45%   │  │ │ +67%   │  │ │ +23%   │ │    │
│  │ └────────┘  │ └────────┘  │ └────────┘  │ └────────┘ │    │
│  └─────────────┴─────────────┴─────────────┴─────────────┘    │
│                                                                 │
│  ┌──────────────────────────────┐  ┌──────────────────────┐   │
│  │ Project Progress (38% Done)  │  │ Recent Activity      │   │
│  │                              │  │ ─────────────────    │   │
│  │ Sistema 0: ████████░░░░░░░░  │  │ ✓ Content 1 Posted   │   │
│  │ Sistema 1: ███████░░░░░░░░░░  │  │ ✓ Page: Apresent.   │   │
│  │ Sistema 2: ██░░░░░░░░░░░░░░░  │  │ 📧 Briefing Rcvd     │   │
│  │ Sistema 3: ░░░░░░░░░░░░░░░░░  │  │ 🔄 Generating...     │   │
│  │                              │  │                      │   │
│  │ Blockers:                    │  │ Next Milestones:     │   │
│  │ • Redes sociais (missing)    │  │ • Review Content     │   │
│  │ • Logo final (pending)       │  │ • Launch FunWheel    │   │
│  │                              │  │ • Publish Sales Pg   │   │
│  │ [View Details] [Unblock]     │  │                      │   │
│  │                              │  │ [View All Activity]  │   │
│  └──────────────────────────────┘  └──────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Team & Collaboration                                    │  │
│  │ ────────────────────────────────────────────────────   │  │
│  │                                                         │  │
│  │ Client: João Silva (Owner)          Last seen: 2h ago  │  │
│  │ Designer: Uma (UX-Design-Expert)    Active now        │  │
│  │ Developer: Dex (Dev Agent)          Last seen: 30m ago │  │
│  │                                                         │  │
│  │ [+ Invite Team Member] [Share Board] [Permissions]    │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Quick Actions                                           │  │
│  │ ───────────────────────────────────────────────────────│  │
│  │                                                         │  │
│  │ [+ New Content] [Review Brief] [Check Analytics]       │  │
│  │ [Download Report] [Request Revision] [Schedule Call]   │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Components

**Atoms:**
- Metric card (number + label + trend)
- Progress bar
- Status badge
- Activity item
- Action button

**Molecules:**
- Metric group (4 metrics)
- Project card
- Team member card
- Activity feed item
- Quick action button group

**Organisms:**
- Overview section
- Progress tracker
- Recent activity panel
- Team collaboration panel
- Quick actions bar

### Annotations
```
1. **Real-Time Updates:**
   - Activity feed updates live
   - Progress bars update as systems complete
   - Team member status (online, offline, last seen)

2. **Deep Linking:**
   - Click on any metric → detailed view
   - Click on activity item → navigate to relevant screen
   - [View Details] → opens modal or new page

3. **Notifications:**
   - Badge count on menu items
   - Toast notifications for key events
   - Email digests for inactive users

4. **Mobile Adaptation:**
   - On mobile: stack cards vertically
   - Progress bars show simplified view
   - Quick actions always visible at bottom
```

---

## 🔄 Interaction Flows

### Flow 1: Lead Capture Journey (Sistema 0 → 2)

```
[Landing: Apresentação Page]
        ↓
   [Fill Form]
        ↓
   [Submit]
        ↓
   [System generates:
    - Unique referral code
    - Assigns to FunWheel
    - Sends email with link]
        ↓
   [Lead clicks link]
        ↓
   [Retenção Page revealed]
        ↓
   [Lead shares with 3 friends]
        ↓
   [VIP Status unlocked]
        ↓
   [Transformação Page visible]
        ↓
   [Lead can access premium content]
```

### Flow 2: Content Generation (Sistema 1)

```
[Select Template]
        ↓
   [Claude generates initial slides]
        ↓
   [User edits/iterates]
        ↓
   [Generate AI images]
        ↓
   [Review + approve]
        ↓
   [Save as draft / Schedule / Publish Now]
        ↓
   [Auto-post to Instagram, TikTok, etc.]
        ↓
   [Track engagement + conversions]
```

### Flow 3: Sales Page Publishing (Sistema 3)

```
[Choose template]
        ↓
   [Drag-drop sections]
        ↓
   [Edit copy + images]
        ↓
   [Configure lead form]
        ↓
   [Preview on desktop/mobile]
        ↓
   [Connect domain]
        ↓
   [Publish Live]
        ↓
   [Receive leads + track conversions]
```

---

## 📦 Component Inventory (Atomic Design)

### Atoms (22 total)
- Button (Primary, Secondary, Destructive, Ghost)
- Input (Text, Email, Password, Number, Textarea)
- Label
- Icon (Arrow, Check, X, Plus, Settings, Home, etc.)
- Badge (Status, Metric)
- Avatar
- Progress Bar
- Divider
- Link
- Checkbox / Radio

### Molecules (14 total)
- Form Field (Label + Input + Helper + Error)
- Search Bar (Input + Icon + Button)
- Card Header (Avatar + Title + Subtitle)
- Navigation Item (Icon + Label + Badge)
- Metric Display (Label + Number + Trend)
- Dropdown Menu
- Toast Notification
- Empty State
- Skeleton Loader
- Social Share Group
- Testimonial Quote
- Pricing Card
- Feature Card
- Section Header

### Organisms (8 total)
- Header/Navigation
- Form (Multiple Fields + CTA)
- Data Table
- Card (Header + Content + Footer)
- Modal / Dialog
- Hero Section
- Carousel / Slider
- Footer

### Templates (3 total)
- Standard Layout (Header + Content + Sidebar + Footer)
- Full-Width Layout (No sidebar)
- Dashboard Layout (Grid of cards)

### Pages (5 total)
1. Sistema 0: Project Brief
2. Sistema 1: Content Generation
3. Sistema 2: FunWheel Pages
4. Sistema 3: Sales Page Builder
5. Dashboard: Project Central

---

## 👥 Responsive Behavior

### Mobile (< 640px)
- Stack all sections vertically
- Full-width inputs
- Bottom navigation bar
- Slide-out menus
- Touch targets ≥ 44x44px

### Tablet (640px - 1024px)
- 2-column layouts
- Larger touch targets
- Side drawer for secondary nav
- Cards in 2-col grid

### Desktop (> 1024px)
- Multi-column layouts
- Hover states on buttons
- Top navigation bar
- Cards in 3-col grid
- Sidebar navigation

---

## 🎨 Design System Setup

### Next Steps (Phase 3 - Tokens)
1. Extract design tokens from wireframes
2. Create `tokens.yaml` with all values
3. Generate CSS variables + Tailwind config
4. Setup Shadcn/Radix component library
5. Build components (Phase 4)

### Token Exports
```
tokens/
├── colors.json      (Primary, Secondary, Gradients, Neutrals)
├── typography.json  (Font families, sizes, weights)
├── spacing.json     (4px base unit scale)
├── shadows.json     (Depth levels)
├── radius.json      (Border radius scale)
└── breakpoints.json (Mobile, Tablet, Desktop)
```

---

## ✅ Success Criteria

- [x] Wireframes created for all 5 screens (mid-fidelity)
- [x] Design tokens defined (colors, gradients, spacing, typography)
- [x] Atomic Design structure applied
- [x] Component inventory complete (22 atoms, 14 molecules, 8 organisms)
- [x] Interaction flows documented
- [x] Responsive behavior specified
- [x] Annotations explain design decisions
- [x] Developer handoff package ready

---

## 📝 Developer Handoff Notes

**For Frontend Implementation:**
1. Use Tailwind CSS with custom config (`tokens.json` → `tailwind.config.js`)
2. Build components using Shadcn/Radix (accessible, unstyled base)
3. Theme colors: Primary (#08164a), Secondary (#38bafc)
4. Gradient support: Use Tailwind's gradient utilities
5. Spacing: Use 4px base unit (sm:1 = 4px, md:1 = 16px, etc.)
6. All interactions use React hooks (useState, useCallback)
7. Accessibility: WCAG AA minimum, test with axe-core
8. Mobile-first approach: Design mobile, enhance for larger screens

**For Backend Integration:**
1. API endpoints return data in JSON format matching component needs
2. Real-time updates via WebSocket or Supabase Realtime
3. Image uploads to Supabase Storage or external service
4. Form validation on client + server
5. Rate limiting on lead capture endpoints
6. Audit logging for all user actions

---

**Created:** 2026-03-14
**Version:** 1.0.0 (Mid-Fidelity)
**Designer:** Uma (UX-Design-Expert)
**Next Phase:** Phase 3 - Design Tokens & System Setup
