# PIXS Master Prompt Architecture (8 Styles)

`prompts/` 폴더의 8개 파일은 PIXS 스타일별 고유 프롬프트 엔진입니다.

## 운영 규칙
- 사용자가 특정 스타일을 Pick 하면 해당 파일의 내용을 그대로 불러옵니다.
- 스타일 간 프롬프트 내용을 절대 섞지 않습니다.
- 각 스타일의 고유 조명(Lighting)과 질감(Texture) 가이드를 엄격히 준수합니다.

## 파일 목록
- `style-rembrandt.md`
- `style-vermeer.md`
- `style-vangogh.md`
- `style-renaissance.md`
- `style-heroic-cinematic.md`
- `style-dreamy-fairytale.md`
- `style-cyberpunk.md`
- `style-western-noir.md`
