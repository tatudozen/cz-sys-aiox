# 🎨 CopyZen Wireframes — Developer Handoff

**Status:** ✅ Mid-Fidelity Wireframes Complete
**Date:** 2026-03-14
**Phase:** 1 (UX Design) → Phase 3 (Design Tokens)

---

## 📦 Deliverables

### 1. **wireframes-mid-fidelity.md** (Complete Design Document)
- 5 screens with ASCII wireframes
- Design system tokens (colors, typography, spacing)
- Component inventory (Atomic Design structure)
- Interaction flows
- Responsive behavior specs
- Developer notes

### 2. **design-tokens.json** (Machine-Readable Tokens)
- Color palette (#08164a, #38bafc + gradients)
- Typography system (fonts, sizes, weights, headings)
- Spacing scale (4px base unit)
- Breakpoints (mobile, tablet, desktop)
- Shadows, border-radius, transitions
- Accessibility specs (touch targets, contrast)

### 3. **HANDOFF.md** (This file)
- Quick reference for developers
- Integration checklist
- Phase 2 and 3 recommendations

---

## 🎯 5 Screens Designed

| # | Screen | Sistema | Key Components |
|---|--------|---------|-----------------|
| 1 | Project Brief | 0 | Form, inputs, checkboxes, brand import |
| 2 | Content Generator | 1 | Slide editor, image selector, carousel |
| 3 | FunWheel Pages | 2 | Page preview, A-R-T status, analytics |
| 4 | Sales Page Builder | 3 | Drag-drop sections, pricing, form builder |
| 5 | Dashboard | All | Metrics, progress, activity, team |

---

## 🎨 Design Tokens Summary

**Colors:**
- Primary: `#08164a` (Navy)
- Secondary: `#38bafc` (Cyan)
- Gradients: 3 variants (primary, dark, light)
- Semantic: Success, warning, error, info

**Typography:**
- Font: Inter (system fallback)
- Sizes: xs (12px) → 5xl (48px)
- Headings: H1 (32px bold) → H3 (20px semi-bold)

**Spacing:**
- Base unit: 4px
- Scale: xs (4) → 5xl (96px)

**Responsive:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 📋 Component Inventory

### Atoms (22)
Button, Input, Label, Icon, Badge, Avatar, Progress, Divider, Link, Checkbox

### Molecules (14)
Form Field, Search Bar, Card Header, Nav Item, Metric Display, Dropdown, Toast, Empty State, Skeleton, Social Share, Testimonial, Pricing Card, Feature Card, Section Header

### Organisms (8)
Header, Form, Data Table, Card, Modal, Hero Section, Carousel, Footer

---

## 🔄 Interaction Flows

### Lead Capture (A-R-T Funnel)
```
Apresentação (open) → Fill Form → Retenção (unlocked)
→ Share 3x → Transformação (VIP unlock)
```

### Content Generation
```
Template Selection → AI Generation → Edit Slides
→ Generate Images → Review → Publish/Schedule
```

### Sales Page
```
Template → Drag Sections → Edit Copy/Images
→ Configure Form → Preview → Publish Live
```

---

## 🚀 Integration Checklist

### Phase 2: Design Tokens & System Setup
- [ ] Convert design-tokens.json to Tailwind config
- [ ] Setup Tailwind CSS with custom theme
- [ ] Create CSS variables from tokens
- [ ] Generate color palette documentation

### Phase 3: Component Building
- [ ] Install Shadcn/Radix component library
- [ ] Build 22 Atoms (Button, Input, etc.)
- [ ] Build 14 Molecules (Form Field, Card, etc.)
- [ ] Build 8 Organisms (Header, Modal, etc.)
- [ ] Create page templates
- [ ] Add accessibility (WCAG AA)

### Testing & QA
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Accessibility audit (axe-core, WAVE)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Performance testing (Lighthouse)
- [ ] Usability testing with actual users

---

## 📱 Responsive Implementation Notes

### Mobile-First Approach
1. Design mobile layout first (< 640px)
2. Add media queries for tablet (640px)
3. Enhance for desktop (1024px)
4. Ensure touch targets ≥ 44x44px

### Tailwind Configuration Example
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#08164a',
        secondary: '#38bafc'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px'
        // ... from design-tokens.json
      },
      // Import all tokens from design-tokens.json
    }
  }
}
```

---

## 👨‍💻 Developer Setup

### 1. Install Dependencies
```bash
npm install -D tailwindcss postcss autoprefixer
npm install @shadcn/ui @radix-ui/react-*
npx shadcn-ui@latest init
```

### 2. Import Design Tokens
```bash
# Convert design-tokens.json to Tailwind config
npm run tokens:build  # (custom script to be created)
```

### 3. Build Components
```bash
# Using Shadcn/Radix
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
# ... add all required components
```

### 4. Style with Custom Tokens
```tsx
// Use Tailwind utilities with custom tokens
<button className="bg-primary text-white px-md py-sm rounded-lg">
  Click me
</button>
```

---

## 🎯 Implementation Priority

### Phase 1 (Week 1): Foundation
1. Setup Tailwind + Shadcn
2. Build all 22 Atoms
3. Create color system + typography

### Phase 2 (Week 2): Components
4. Build 14 Molecules
5. Build 8 Organisms
6. Create page templates

### Phase 3 (Week 3): Features
7. Implement Sistema 0 (Brief input)
8. Implement Sistema 1 (Content gen)
9. Implement Sistema 2 (FunWheel)
10. Implement Sistema 3 (Sales page)
11. Implement Dashboard

### Phase 4 (Week 4): Polish
12. Accessibility audit + fixes
13. Responsive testing
14. Performance optimization
15. User testing & iterations

---

## ✅ Quality Checklist

- [ ] All screens responsive (mobile, tablet, desktop)
- [ ] Colors meet WCAG AA contrast (4.5:1 minimum)
- [ ] Touch targets ≥ 44x44px
- [ ] Focus states visible and clear
- [ ] Keyboard navigation works
- [ ] Form validation shows clear errors
- [ ] Loading states implemented
- [ ] Empty states implemented
- [ ] Error states implemented
- [ ] Animations smooth (< 300ms)

---

## 📚 Reference Files

- **Full Wireframes:** `wireframes-mid-fidelity.md`
- **Design Tokens:** `design-tokens.json`
- **This Handoff:** `HANDOFF.md`

---

## 🤝 Next Steps

1. **@dev (Dex)** reads this handoff
2. **Phase 2:** @ux-design-expert converts tokens to code
3. **Phase 3:** @dev builds components using Shadcn
4. **Phase 4:** @qa tests accessibility and responsiveness
5. **Phase 5:** @dev integrates with backend (Supabase, n8n)

---

**Designer Notes:**
- Wireframes follow Atomic Design methodology
- All colors support light/dark mode (via CSS variables)
- Gradients can be customized per component
- Spacing system is fully configurable
- All components should prioritize accessibility (WCAG AA)

**For Questions:** Reference `wireframes-mid-fidelity.md` for detailed annotations on each screen.

---

**Created:** 2026-03-14
**Phase:** 1 - UX Design (Complete) → Phase 3 - Design Tokens (Ready)
**Designer:** Uma (UX-Design-Expert)
