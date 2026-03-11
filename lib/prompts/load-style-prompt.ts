import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPromptFileByStyle } from "./style-prompts";

export async function loadStylePrompt(styleId: string): Promise<string | null> {
  const filePath = getPromptFileByStyle(styleId);
  if (!filePath) {
    return null;
  }

  const absolutePath = join(process.cwd(), filePath);
  const content = await readFile(absolutePath, "utf-8");
  return content.trim();
}
