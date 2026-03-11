import { NextRequest, NextResponse } from "next/server";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { GoogleGenAI, SubjectReferenceImage, SubjectReferenceType } from "@google/genai";
import { loadStylePrompt } from "@/lib/prompts/load-style-prompt";

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
    // 참조 이미지 고정: 'image' 키의 파일만 사용 (파일명과 무관하게 첫 번째 입력으로 할당)
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
    const stylePrompt = await loadStylePrompt(styleId);
    if (!stylePrompt) {
      debug.push({ step: "load_prompt", error: `Unknown style: ${styleId}` });
      return NextResponse.json(
        { error: `Unknown style: ${styleId}`, debug },
        { status: 400 },
      );
    }

    // Subject Identity Anchoring: pre-pend 강제 주입
    const identityAnchor =
      "Strictly maintain the specific breeds, fur patterns, facial structure, and unique identity of the pet shown in the uploaded image [1]. Do not create a generic animal; recreate THIS specific pet. ";
    const prompt = identityAnchor + stylePrompt;

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
    const arrayBuffer = await image.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = image.type || "image/png";

    // Vertex AI 전용 초기화 — 서비스 계정 JSON으로 자동 인증
    const ai = new GoogleGenAI({
      vertexai: true,
      project: projectId,
      location,
    });

    // 참조 이미지 고정: 업로드된 이미지를 항상 첫 번째 입력(input_file_0 / referenceId 1)로 할당
    const subjectRef = new SubjectReferenceImage();
    subjectRef.referenceImage = { imageBytes: base64, mimeType };
    subjectRef.referenceId = 1;
    subjectRef.config = {
      subjectType: SubjectReferenceType.SUBJECT_TYPE_ANIMAL,
      subjectDescription:
        "The specific pet with its unique breed, fur pattern, facial structure, and identity. Recreate this exact animal, not a generic one.",
    };

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
        aspectRatio: "1:1",
        // Subject/Identity 우선: guidanceScale 상향으로 프롬프트(정체성 강조) 준수 강화
        guidanceScale: 100,
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
