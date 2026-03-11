# PIXS Next.js Foundation Plan

> Test note: Auto-deploy trigger check commit.

## Recommended Directory Structure

```text
src/
  app/
    (marketing)/
      page.tsx                  # Landing page
      layout.tsx                # Marketing layout
    studio/
      page.tsx                  # Theme select / upload entry
      create/
        page.tsx                # Generation result flow
    api/
      health/route.ts           # Basic health endpoint
    globals.css
    layout.tsx
  components/
    landing/
      hero.tsx
      concept-showcase.tsx
      quality-proof.tsx
      process-steps.tsx
      trust-faq.tsx
      final-cta.tsx
    shared/
      section-title.tsx
      premium-button.tsx
      glow-card.tsx
  content/
    landing-copy.ts             # Hero/funnel copy and labels
    faqs.ts
  lib/
    theme/
      tokens.ts                 # Colors, spacing, typography tokens
    prompts/
      fixed-prompts.ts          # Theme-specific fixed prompt base
    types/
      art-theme.ts
```

## Landing Page Information Architecture

1. Hero
   - Premium headline and subheadline
   - Main CTA: "지금 아트 만들기"
   - Secondary CTA: "테마 먼저 보기"
2. Concept Showcase
   - Card A: The Royal Atelier
   - Card B: Cine-Matic Paw
3. Quality Proof
   - "8k resolution", "studio lighting", "sharp focus" badges
   - Before/after style placeholders
4. Process (3 steps)
   - Upload photo -> Select theme -> Generate artwork
5. Trust + FAQ
   - Quality promise, usage scope, time expectations
6. Final CTA
   - Focused conversion block with one dominant action

## Component Contract Suggestions

- Keep each section as one server component by default.
- Move animation wrappers to small client components only when needed.
- Centralize copy in `content/` to support iteration and localization.
- Use typed theme constants:
  - `royal-atelier`
  - `cine-matic-paw`

## Visual Direction

- Background: deep charcoal gradient with subtle noise texture
- Accent: champagne gold (`#E1C16E`) highlights on CTAs, tabs, and active cards
- Typography:
  - Heading: elegant serif
  - Body/UI: clean sans-serif
- Motion:
  - 200-350ms smooth transitions
  - Slight card lift and glow on hover
  - No flashy or rapid motion

## Ready-to-Implement Checklist

- [ ] Initialize Next.js app router project
- [ ] Install Tailwind and set design tokens
- [ ] Create landing section components and compose in `page.tsx`
- [ ] Add concept content constants and fixed prompt constants
- [ ] Add basic analytics event points for CTA clicks
- [ ] Validate accessibility contrast and keyboard navigation
