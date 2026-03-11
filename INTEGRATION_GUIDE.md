# PIXS × Gemini/Imagen API 연동 가이드

## 1. 준비된 요소

| 항목 | 위치 | 용도 |
|------|------|------|
| 프롬프트 로더 | `lib/prompts/load-style-prompt.ts` | 스타일 ID → `.md` 파일 내용 |
| API 라우트 스켈레톤 | `app/api/generate/route.ts` | POST 엔드포인트 |
| 환경 변수 예시 | `.env.example` | `GEMINI_API_KEY` |

## 2. API 연동 시 필요한 작업

### 2.1 환경 변수
```bash
cp .env.example .env.local
# .env.local에 GEMINI_API_KEY 입력
```

### 2.2 `app/api/generate/route.ts` 구현
- `@google/generative-ai` 또는 `@google-cloud/vertexai` 패키지 설치
- 이미지 → base64 변환 후 API에 전달
- `loadStylePrompt(styleId)`로 프롬프트 로드
- 응답 이미지 URL 또는 base64 반환

### 2.3 메인 페이지 수정 (`app/page.tsx`)
- `handleGenerate`에서 `router.push` 대신 `/api/generate` 호출
- FormData로 `image`(File), `styleId` 전송
- 응답 `imageUrl`을 sessionStorage에 저장 후 `/result`로 이동

### 2.4 결과 페이지 수정 (`components/result/result-view.tsx`)
- `sessionStorage.getItem("pixs:resultImageUrl")` 사용
- API 연결 실패 시 에러 UI 처리

## 3. 추천 추가 요소

| 요소 | 설명 |
|------|------|
| **에러 바운더리** | API 실패 시 "다시 시도하기" / "홈으로" 버튼 |
| **재시도 로직** | 3회 재시도 후 사용자에게 알림 |
| **이미지 크기 제한** | 업로드 전 4MB 제한, 리사이즈 옵션 |
| **rate limit** | Vercel Edge / Upstash로滥用 방지 |
| **결과 캐싱** | `pixs:resultImageUrl`을 sessionStorage에 저장해 재방문 시 즉시 표시 |

## 4. Gemini Imagen API 참고

- [Gemini API - Imagen](https://ai.google.dev/gemini-api/docs/imagen)
- [Google AI Studio](https://aistudio.google.com/) — API 키 발급
