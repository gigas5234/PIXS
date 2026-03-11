import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPromptFileByStyle } from "./style-prompts";

/** Extract the Prompt section from markdown (text after ## Prompt) */
function extractPromptSection(content: string): string {
  const match = content.match(/##\s*Prompt\s*\n([\s\S]*?)(?=\n##\s|$)/i);
  const text = (match?.[1] ?? content).trim();
  // Replace image references with [1] for SubjectReferenceImage
  return text
    .replace(/\[input_file_0\]/gi, "[1]")
    .replace(/\bfrom\s+image_\d+\.png\b/gi, "from the pet in reference image [1]")
    .replace(/\bseen\s+in\s+image_\d+\.png\b/gi, "as in reference image [1]")
    .replace(/\bmatching\s+the\s+quality\s+of\s+image_\d+\.png\b/gi, "with high fidelity to the subject")
    .replace(/\bimage_\d+\.png\b/gi, "[1]");
}

/** Replace [Species] placeholder with detected species (Cat, Dog, or pet) */
export function replaceSpeciesInPrompt(prompt: string, species: string): string {
  return prompt.replace(/\[Species\]/g, species);
}

export async function loadStylePrompt(
  styleId: string,
  species: string = "pet",
): Promise<string | null> {
  const filePath = getPromptFileByStyle(styleId);
  if (!filePath) {
    return null;
  }

  const absolutePath = join(process.cwd(), filePath);
  const content = await readFile(absolutePath, "utf-8");
  const raw = extractPromptSection(content);
  return replaceSpeciesInPrompt(raw, species);
}
