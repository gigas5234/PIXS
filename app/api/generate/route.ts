import { NextRequest, NextResponse } from "next/server";
import { join } from "node:path";
import { GoogleGenAI, SubjectReferenceImage, SubjectReferenceType } from "@google/genai";
import { loadStylePrompt } from "@/lib/prompts/load-style-prompt";

/**
 * POST /api/generate
 *
 * Body: FormData
 *   - image: File (pet photo)
 *   - styleId: string (e.g. "rembrandt", "marvel-hero")
 *
 * Returns: { imageUrl: string } | { error: string, debug?: object }
 *
 * Vertex AI (Nano Banana / Imagen 3) with service account JSON key.
 * GOOGLE_APPLICATION_CREDENTIALS must point to keys/*.json
 */
export async function POST(request: NextRequest) {
  const debug: { step?: string; error?: string; detail?: unknown }[] = [];

  try {
    debug.push({ step: "parse_form" });
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const styleId = (formData.get("styleId") as string) ?? "";

    if (!image || !styleId) {
      debug.push({ step: "validate", error: "image and styleId required" });
      return NextResponse.json(
        { error: "image and styleId are required", debug },
        { status: 400 },
      );
    }

    debug.push({ step: "load_prompt", detail: styleId });
    const prompt = await loadStylePrompt(styleId);
    if (!prompt) {
      debug.push({ step: "load_prompt", error: `Unknown style: ${styleId}` });
      return NextResponse.json(
        { error: `Unknown style: ${styleId}`, debug },
        { status: 400 },
      );
    }

    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.GOOGLE_CLOUD_PROJECT ?? "pixs-ai-engine";
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";

    if (!credentialsPath) {
      debug.push({ step: "config", error: "GOOGLE_APPLICATION_CREDENTIALS not set" });
      return NextResponse.json(
        {
          error:
            "GOOGLE_APPLICATION_CREDENTIALS is not set. Set it to the path of your service account JSON (e.g. keys/your-key.json)",
          debug,
        },
        { status: 500 },
      );
    }

    // Resolve path: if relative, resolve from project root
    const resolvedPath = credentialsPath.startsWith("/")
      ? credentialsPath
      : join(process.cwd(), credentialsPath);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolvedPath;
    debug.push({ step: "credentials", detail: resolvedPath });

    debug.push({ step: "load_image" });
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/png";

    // Vertex AI 전용 초기화 — 서비스 계정 JSON으로 자동 인증
    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location,
    });

    const subjectRef = new SubjectReferenceImage();
    subjectRef.referenceImage = { imageBytes: base64, mimeType };
    subjectRef.referenceId = 1;
    subjectRef.config = { subjectType: SubjectReferenceType.SUBJECT_TYPE_ANIMAL };

    debug.push({
      step: "call_edit_image",
      detail: { model: "imagen-3.0-capability-001", project: projectId, location },
    });
    const response = await ai.models.editImage({
      model: "imagen-3.0-capability-001",
      prompt,
      referenceImages: [subjectRef],
      config: {
        numberOfImages: 1,
        aspectRatio: "4:5",
      },
    });

    const generatedImage = response.generatedImages?.[0];
    const imageBytes = generatedImage?.image?.imageBytes;

    if (!imageBytes) {
      debug.push({ step: "response", error: "No image in response", detail: response });
      return NextResponse.json(
        { error: "Image generation failed: no image returned", debug },
        { status: 500 },
      );
    }

    debug.push({ step: "success" });
    const imageUrl = `data:image/png;base64,${imageBytes}`;

    return NextResponse.json({ imageUrl, debug });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    debug.push({ step: "exception", error: message, detail: stack });

    return NextResponse.json(
      {
        error: message || "Internal server error",
        debug,
      },
      { status: 500 },
    );
  }
}
