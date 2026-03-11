export const STYLE_PROMPT_FILES = {
  rembrandt: "prompts/style-rembrandt.md",
  vermeer: "prompts/style-vermeer.md",
  "van-gogh": "prompts/style-vangogh.md",
  picasso: "prompts/style-picasso.md",
  renaissance: "prompts/style-renaissance.md",
  "marvel-hero": "prompts/style-heroic-cinematic.md",
  "disney-live-action": "prompts/style-dreamy-fairytale.md",
  cyberpunk: "prompts/style-cyberpunk.md",
  western: "prompts/style-western-noir.md",
  "korean-minhwa": "prompts/style-korean-minhwa.md",
} as const;

export type StylePromptId = keyof typeof STYLE_PROMPT_FILES;

export function getPromptFileByStyle(styleId: string): string | null {
  return STYLE_PROMPT_FILES[styleId as StylePromptId] ?? null;
}
