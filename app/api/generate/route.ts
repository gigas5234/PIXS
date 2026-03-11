import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { GoogleGenAI, SubjectReferenceImage, SubjectReferenceType } from "@google/genai";
import { loadStylePrompt } from "@/lib/prompts/load-style-prompt";

/** 이미지에서 동물 종류(Cat/Dog) 감지. 실패 시 "pet" 반환. */
async function detectSpeciesFromImage(
  ai: GoogleGenAI,
  base64: string,
  mimeType: string,
  debug: { step?: string; detail?: unknown }[],
): Promise<string> {
  try {
    const res = await ai.models.generateContent({
      // Vertex AI Gemini 2.0 Flash Experimental (Nano Banana 근접) - Vertex 모델 ID
      // Gemini API의 `gemini-2.0-flash-exp`에 해당하는 Vertex 버전은 `gemini-2.0-flash-001`
      model: "gemini-2.0-flash-001",
      contents: [
        { inlineData: { data: base64, mimeType } },
        { text: "What is the primary animal in this image? Reply with exactly one word: Cat or Dog. If unclear or neither, reply: pet." },
      ],
    });
    const text =
      res.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() ?? "pet";
    const species = text === "cat" ? "Cat" : text === "dog" ? "Dog" : "pet";
    debug.push({ step: "species_detect", detail: { raw: text, species } });
    return species;
  } catch (e) {
    debug.push({ step: "species_detect", detail: { fallback: "pet", message: String(e) } });
    return "pet";
  }
}

function resolveCredentialsPath(debug: { step?: string; detail?: unknown }[]): string | null {
  const base64Env = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (base64Env) {
    try {
      const json = Buffer.from(base64Env, "base64").toString("utf8");
      const tmpPath = join(tmpdir(), `pixs-creds-${Date.now()}.json`);
      writeFileSync(tmpPath, json);
      debug.push({ step: "credentials", detail: "from GOOGLE_APPLICATION_CREDENTIALS_BASE64" });
      return tmpPath;
    } catch (e) {
      debug.push({ step: "credentials", detail: "Base64 decode failed" });
      return null;
    }
  }

  const pathEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (pathEnv) {
    const resolved = pathEnv.startsWith("/") ? pathEnv : join(process.cwd(), pathEnv);
    if (existsSync(resolved)) {
      debug.push({ step: "credentials", detail: resolved });
      return resolved;
    }
  }

  const fallbackB64 = join(process.cwd(), "keys", "credentials.b64");
  if (existsSync(fallbackB64)) {
    try {
      const b64 = readFileSync(fallbackB64, "utf8").trim();
      const json = Buffer.from(b64, "base64").toString("utf8");
      const tmpPath = join(tmpdir(), `pixs-creds-${Date.now()}.json`);
      writeFileSync(tmpPath, json);
      debug.push({ step: "credentials", detail: "from keys/credentials.b64" });
      return tmpPath;
    } catch {
      debug.push({ step: "credentials", detail: "keys/credentials.b64 read failed" });
      return null;
    }
  }

  return null;
}

const REFERENCE_ID = 1 as const;
const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

/**
 * POST /api/generate
 *
 * Body: FormData
 *   - image: File (pet photo)
 *   - styleId: string (e.g. "rembrandt", "marvel-hero")
 *
 * Returns: { imageUrl: string } | { error: string, debug?: object }
 *
 * Vertex AI (Nano Banana / Imagen 3). 인증 우선순위:
 * 1. GOOGLE_APPLICATION_CREDENTIALS_BASE64 (Base64 인코딩된 JSON)
 * 2. GOOGLE_APPLICATION_CREDENTIALS (파일 경로)
 * 3. keys/credentials.b64 (로컬 폴백)
 */
export async function POST(request: NextRequest) {
  const debug: { step?: string; error?: string; detail?: unknown }[] = [];

  try {
    debug.push({ step: "parse_form" });
    const formData = await request.formData();
    const image = formData.get("image") as File | null;
    const styleId = (formData.get("styleId") as string) ?? "";
    const signatureText = ((formData.get("signatureText") as string) ?? "").trim();

    if (!image || !styleId) {
      debug.push({ step: "validate", error: "image and styleId required" });
      return NextResponse.json(
        { error: "image and styleId are required", debug },
        { status: 400 },
      );
    }

    // 1. 업로드 파일 검증: 파일 타입 및 크기
    const mimeType = image.type || "image/png";
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      debug.push({ step: "validate", error: `Invalid mime type: ${mimeType}` });
      return NextResponse.json(
        { error: `Unsupported image type. Use PNG, JPEG, or WebP.`, debug },
        { status: 400 },
      );
    }
    const arrayBuffer = await image.arrayBuffer();
    const imageSize = arrayBuffer.byteLength;
    if (imageSize === 0) {
      debug.push({ step: "validate", error: "Empty image file" });
      return NextResponse.json(
        { error: "Image file is empty.", debug },
        { status: 400 },
      );
    }
    if (imageSize > MAX_IMAGE_SIZE_BYTES) {
      debug.push({ step: "validate", error: `Image too large: ${imageSize} bytes` });
      return NextResponse.json(
        { error: `Image too large. Max size: ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB`, debug },
        { status: 400 },
      );
    }
    debug.push({ step: "validate", detail: { size: imageSize, mimeType, fileName: image.name } });

    const credentialsPath = resolveCredentialsPath(debug);
    const projectId = process.env.GOOGLE_CLOUD_PROJECT ?? "pixs-489916";
    const location = process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1";

    if (!credentialsPath) {
      debug.push({ step: "config", error: "No credentials found" });
      return NextResponse.json(
        {
          error:
            "Credentials not found. Set GOOGLE_APPLICATION_CREDENTIALS_BASE64 (Base64 JSON), GOOGLE_APPLICATION_CREDENTIALS (file path), or add keys/credentials.b64",
          debug,
        },
        { status: 500 },
      );
    }

    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath;

    debug.push({ step: "load_image" });
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location,
    });

    // [Species] 동적 치환: 이미지 분석으로 Cat/Dog 감지
    const species = await detectSpeciesFromImage(ai, base64, mimeType, debug);

    debug.push({ step: "load_prompt", detail: { styleId, signatureText } });
    const stylePrompt = await loadStylePrompt(styleId, species);
    if (!stylePrompt) {
      debug.push({ step: "load_prompt", error: `Unknown style: ${styleId}` });
      return NextResponse.json(
        { error: `Unknown style: ${styleId}`, debug },
        { status: 400 },
      );
    }

    // Subject Identity Anchoring: pre-pend 강제 주입
    // [REFERENCE_ID]와 referenceImages의 referenceId가 정확히 매칭되어야 함
    const identityAnchor = `Strictly preserve the exact face, facial anatomy, ear shape, eye color, and unique markings of the pet shown in the uploaded image [${REFERENCE_ID}]. Do not change species or breeds. Do not create a generic animal; faithfully recreate THIS specific individual and then apply the requested style on top. `;

    const signatureInstruction =
      signatureText.length > 0
        ? ` Leave a subtle, clean, and unobstructed space in the bottom-right corner for a professional artist's signature. Then incorporate the signature text "${signatureText}" in an elegant, small handwritten script in the bottom-right corner of the artwork, making it feel naturally integrated into the medium (for example, carved into paint or inked on paper).`
        : "";

    const prompt = identityAnchor + stylePrompt + signatureInstruction;
    debug.push({
      step: "prompt_ref_match",
      detail: { referenceId: REFERENCE_ID, promptContainsRef: prompt.includes(`[${REFERENCE_ID}]`) },
    });

    // 참조 이미지 고정: 업로드된 이미지를 항상 첫 번째 입력(input_file_0 / referenceId 1)로 할당
    const subjectRef = new SubjectReferenceImage();
    subjectRef.referenceImage = { imageBytes: base64, mimeType };
    subjectRef.referenceId = REFERENCE_ID;
    subjectRef.config = {
      subjectType: SubjectReferenceType.SUBJECT_TYPE_ANIMAL,
      subjectDescription:
        "The specific pet with its unique breed, fur pattern, facial structure, and identity. Recreate this exact animal, not a generic one.",
    };

    // Nano Banana (Gemini 2.5 Flash Image) 편집 모델로 정체성 유지하며 생성
    debug.push({
      step: "call_edit_image",
      detail: {
        model: "gemini-2.5-flash-image",
        project: projectId,
        location,
        referenceId: REFERENCE_ID,
        species,
        imageSizeBytes: imageSize,
        referenceImageWeight: 0.95,
        subjectConsistency: 0.95,
        guidanceScale: 60,
      },
    });

    const editConfig = {
      numberOfImages: 1,
      aspectRatio: "1:1" as const,
      guidanceScale: 60,
      referenceImageWeight: 0.95,
      subjectConsistency: 0.95,
    };

    const response = await ai.models.editImage({
      model: "gemini-2.5-flash-image",
      prompt,
      referenceImages: [subjectRef],
      config: editConfig,
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
