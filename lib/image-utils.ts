/**
 * Center-crop image to 1:1 ratio using Canvas API.
 * Returns a PNG blob suitable for API upload.
 */
export async function centerCropToSquare(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const baseSize = Math.min(img.width, img.height);

      // 얼굴/주체를 더 크게 보이도록 중앙부만 강하게 크롭 (약 70% 영역만 사용)
      const INNER_FRACTION = 0.7;
      const cropSize = baseSize * INNER_FRACTION;
      const sx = (img.width - cropSize) / 2;
      const sy = (img.height - cropSize) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = baseSize;
      canvas.height = baseSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas 2d context not available"));
        return;
      }
      // 중앙 70% 영역을 전체 정사각형으로 확대하여, 얼굴/주체 비중을 60~70% 수준으로 키움
      ctx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, baseSize, baseSize);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Canvas toBlob failed"));
        },
        "image/png",
        0.95,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}
