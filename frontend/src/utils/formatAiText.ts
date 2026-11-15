/**
 * Tiện ích chuẩn hóa và phân đoạn văn bản luận giải từ AI (Gemini / fallback),
 * loại bỏ ký tự Markdown thô (###, **, *, __) và tách đoạn dễ đọc.
 */

export function cleanAiText(raw?: string | null): string {
  if (!raw) return "";

  let text = raw.replace(/\r\n/g, "\n");

  // Loại bỏ đường kẻ phân cách Markdown (---, ***, ___)
  text = text.replace(/^\s*[-*_]{3,}\s*$/gm, "");

  // Loại bỏ tiêu đề Markdown (### Tiêu đề -> Tiêu đề)
  text = text.replace(/^\s{0,3}#{1,6}\s+/gm, "");

  // Chuyển bullet Markdown (- hoặc *) đầu dòng thành dấu chấm tròn gọn gàng
  text = text.replace(/^\s*[-*+]\s+/gm, "• ");

  // Loại bỏ bọc in đậm / nghiêng / code inline
  text = text.replace(/\*\*([\s\S]*?)\*\*/g, "$1");
  text = text.replace(/__([\s\S]*?)__/g, "$1");
  text = text.replace(/`([^`\n]+)`/g, "$1");
  text = text.replace(/(^|[\s(>])\*([^*\n]+?)\*(?=[\s.,;:!?<)]|$)/gm, "$1$2");

  // Xóa các ký tự ** hoặc * thừa còn sót
  text = text.replace(/\*{2,}/g, "");

  // Loại bỏ một số biểu tượng trang trí rập khuôn thường xuất hiện ở đầu dòng/tiêu đề AI
  text = text.replace(/^\s*[✦✨🔮🌟🌙🪄]+\s*/gm, "");
  text = text.replace(/[✦✨]+/g, "");

  // Chuẩn hóa khoảng trắng đầu/cuối từng dòng và gộp tối đa 1 dòng trống giữa các đoạn
  const lines = text.split("\n").map((line) => line.replace(/[ \t]{2,}/g, " ").trim());
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function splitAiParagraphs(raw?: string | null): string[] {
  const cleaned = cleanAiText(raw);
  if (!cleaned) return [];

  let paragraphs = cleaned
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  // Nếu chỉ có 1 khối văn bản dài chưa được xuống dòng (\n), tách thành các đoạn theo dòng đơn hoặc ranh giới câu
  if (paragraphs.length === 1 && cleaned.includes("\n")) {
    paragraphs = cleaned
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
  }

  if (paragraphs.length === 1 && paragraphs[0].length > 260) {
    const sentences = paragraphs[0].match(/[^.!?]+[.!?]+(?:\s|$)/g);
    if (sentences && sentences.length >= 3) {
      const grouped: string[] = [];
      for (let i = 0; i < sentences.length; i += 2) {
        const chunk = sentences
          .slice(i, i + 2)
          .join(" ")
          .replace(/\s{2,}/g, " ")
          .trim();
        if (chunk) grouped.push(chunk);
      }
      if (grouped.length > 1) {
        return grouped;
      }
    }
  }

  return paragraphs;
}

export function getAiGuidancePreview(
  raw?: string | null,
  maxChars: number = 220
): { paragraphs: string[]; previewText: string; isLong: boolean } {
  const paragraphs = splitAiParagraphs(raw);
  const fullText = paragraphs.join(" ");

  if (!fullText) {
    return { paragraphs: [], previewText: "", isLong: false };
  }

  if (fullText.length <= maxChars && paragraphs.length <= 2) {
    return { paragraphs, previewText: fullText, isLong: false };
  }

  const firstPara = paragraphs[0] || fullText;
  if (firstPara.length <= maxChars && paragraphs.length > 1) {
    return { paragraphs, previewText: `${firstPara}...`, isLong: true };
  }

  const sliced = fullText.slice(0, maxChars);
  const lastSpace = sliced.lastIndexOf(" ");
  const cut = lastSpace > Math.floor(maxChars * 0.6) ? sliced.slice(0, lastSpace) : sliced;

  return {
    paragraphs,
    previewText: `${cut.trimEnd()}...`,
    isLong: true,
  };
}
