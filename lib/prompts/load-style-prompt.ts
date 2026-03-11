import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPromptFileByStyle } from "./style-prompts";

/** Extract the Prompt section from markdown (text after ## Prompt) */
function extractPromptSection(content: string): string {
  const match = content.match(/##\s*Prompt\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  const text = (match?.[1] ?? content).trim();
  // Replace image references with [1] for SubjectReferenceImage
  return text
    .replace(/\bfrom\s+image_\d+\.png\b/gi, "from the pet in reference image [1]")
    .replace(/\bseen\s+in\s+image_\d+\.png\b/gi, "as in reference image [1]")
    .replace(/\bmatching\s+the\s+quality\s+of\s+image_\d+\.png\b/gi, "with high fidelity to the subject")
    .replace(/\bimage_\d+\.png\b/gi, "[1]");
}

export async function loadStylePrompt(styleId: string): Promise<string | null> {
  const filePath = getPromptFileByStyle(styleId);
  if (!filePath) {
    return null;
  }

  const absolutePath = join(process.cwd(), filePath);
  const content = await readFile(absolutePath, "utf-8");
  return extractPromptSection(content);
}
