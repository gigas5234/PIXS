# PIXS Development Plan (Updated)

## Completed
- Initialized Next.js App Router project and established premium dark-mode visual system.
- Rebranded service from Pictor to PIXS and aligned UI copy/tone.
- Implemented cinematic loading overlay and separated result view into `/result`.
- Refactored homepage into dual-world concept flow:
  - The Royal Atelier
  - Cine-Matic Paw
- Added prompt management architecture using file-based style prompts under `prompts/`.
- Mapped style IDs to prompt files via `lib/prompts/style-prompts.ts`.
- Added gallery sample support under `public/gallery/` and wired preview rendering.
- Refined `components/StudioSelector.tsx` with:
  - Minimal style card visual system
  - The Stylist's Note dynamic section
  - Ordered flow: style cards -> stylist note -> upload zone

## In Progress
- Integrating style-specific prompt file loading into actual image generation API call.

## Next
1. Implement server-side prompt read using `loadStylePrompt(styleId)` in generation endpoint.
2. Connect upload + selected style to API request payload.
3. Replace result dummy image with real generated output URL.
4. Add download/share real actions and failure-state UX.
