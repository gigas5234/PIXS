# PIXS (AI Pet Art Studio) Project Brief

## 1) Service Overview

- Service name: `PIXS` (`Pick` + `Picture` + `Studio`)
- Slogan: "반려동물을 위한 프리미엄 AI 아트 스튜디오"
- Core value:
  - Not a simple filter composite
  - Generates artwork quality images combining high-resolution studio lighting and master-inspired art styles

## 2) Design System (UI/UX Guidelines)

- Mood:
  - Premium
  - Dark mode
  - Blend of classical and modern
- Colors:
  - Background: `#121212` (Deep Charcoal)
  - Accent: `#E1C16E` (Champagne Gold)
- Fonts:
  - Serif for titles (classic feel)
  - Sans-serif for body text (readability)
- Core UX principle:
  - Use intuitive theme-card selection instead of complex text input

## 3) Main Art Concepts

### Concept A: The Royal Atelier

- Theme: court painter studio
- Style inspirations:
  - Rembrandt (chiaroscuro lighting)
  - Vermeer (soft light)
  - Van Gogh (3D impasto texture)
- Characteristics:
  - Heavy, classic atmosphere
  - Looks like a masterpiece painted under top-tier studio lighting

### Concept B: Cine-Matic Paw

- Theme: Hollywood poster studio
- Style inspirations:
  - Marvel (hero suit + neon lighting)
  - Disney (live-action cinematic texture)
  - Cyberpunk
- Characteristics:
  - Pet becomes the protagonist of a movie
  - Powerful visual impact and narrative tone

## 4) Tech Stack and Implementation Strategy

- Frontend: `Next.js` (App Router), `Tailwind CSS`
- Backend: `Python` (`FastAPI`)
- AI Engine: `Gemini 3 Flash Image (Nano Banana)` API
- Image pipeline:
  1. User uploads a pet photo
  2. System combines fixed high-quality prompts based on selected theme
  3. Force quality keywords for photoreal output (e.g., `8k resolution`, `studio lighting`, `sharp focus`)
