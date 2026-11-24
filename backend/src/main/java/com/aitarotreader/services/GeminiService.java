package com.aitarotreader.services;

import com.aitarotreader.entities.DrawnCard;
import com.aitarotreader.entities.ReadingSession;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class GeminiService {

    @Value("${app.gemini.api-key:}")
    private String apiKey;

    @Value("${app.gemini.model:gemini-3.5-flash-lite}")
    private String modelName;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final Pattern BOLD_PATTERN = Pattern.compile("\\*\\*([\\s\\S]*?)\\*\\*");
    private static final Pattern UNDERLINE_PATTERN = Pattern.compile("__([\\s\\S]*?)__");
    private static final Pattern CODE_PATTERN = Pattern.compile("`([^`\\n]+)`");
    private static final Pattern ITALIC_PATTERN = Pattern.compile("(?m)(^|[\\s(>])\\*([^*\\n]+?)\\*(?=[\\s.,;:!?<)]|$)");

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public String generateTarotSynthesis(ReadingSession session, List<DrawnCard> cards, String locale) {
        if (!isConfigured()) {
            return null;
        }

        boolean isVi = locale == null || "vi".equalsIgnoreCase(locale);
        boolean isSingleCard = cards != null && cards.size() == 1;
        StringBuilder cardDetails = new StringBuilder();
        if (cards != null) {
            for (DrawnCard dc : cards) {
                String position = isVi ? dc.getPositionNameVi() : dc.getPositionNameEn();
                String cardName = isVi ? dc.getCard().getNameVi() : dc.getCard().getNameEn();
                String orientation = Boolean.TRUE.equals(dc.getIsReversed())
                        ? (isVi ? "Ngược (Reversed)" : "Reversed")
                        : (isVi ? "Xuôi (Upright)" : "Upright");
                String keywords = Boolean.TRUE.equals(dc.getIsReversed())
                        ? (isVi ? dc.getCard().getKeywordsReversedVi() : dc.getCard().getKeywordsReversedEn())
                        : (isVi ? dc.getCard().getKeywordsUprightVi() : dc.getCard().getKeywordsUprightEn());
                String element = dc.getCard().getElement() != null ? dc.getCard().getElement() : "";
                String arcanaInfo = dc.getCard().getSuit() != null
                        ? dc.getCard().getSuit().name()
                        : (dc.getCard().getArcana() != null ? dc.getCard().getArcana().name() : "");
                String summary = isVi ? dc.getCard().getSummaryVi() : dc.getCard().getSummaryEn();

                cardDetails.append(String.format("- Vị trí [%s]: Lá %s (%s | %s | Nguyên tố: %s). Từ khóa: %s. Ý nghĩa biểu tượng: %s\n",
                        position,
                        cardName,
                        orientation,
                        arcanaInfo,
                        element,
                        keywords != null ? keywords : "",
                        summary != null ? summary : ""));
            }
        }

        String persona = session.getPersonaCode() != null ? session.getPersonaCode() : "MYSTIC_SAGE";
        String question = session.getUserQuestion() != null ? session.getUserQuestion() : "Định hướng năng lượng tổng quan";
        String spreadName = session.getSpread() != null
                ? (isVi ? session.getSpread().getNameVi() : session.getSpread().getNameEn())
                : "Trải bài Tarot";

        String formatRules = buildEditorialFormatRules(isVi, !isSingleCard);
        String readerRole;
        String taskInstruction;
        if (isSingleCard) {
            readerRole = isVi
                    ? "Bạn là một Tarot Reader tinh tế theo phong cách " + persona + "."
                    : "You are a thoughtful Tarot Reader with the voice of " + persona + ".";
            taskInstruction = isVi
                    ? "Hãy viết đúng 2 đoạn văn ngắn gọn (tổng khoảng 60-90 từ) phân tách bằng một dòng trống:\n"
                    + "Đoạn 1: Nêu thông điệp trọng tâm và góc nhìn tinh tế mà lá bài này mang lại cho ngày hôm nay.\n"
                    + "Đoạn 2: Gợi ý một hướng hành động thực tế, nhẹ nhàng để áp dụng ngay trong hôm nay."
                    : "Write exactly 2 concise paragraphs (60-90 words total) separated by a blank line:\n"
                    + "Paragraph 1: Share the core message and thoughtful insight this card offers for today.\n"
                    + "Paragraph 2: Suggest one grounded, practical focus or action to carry into today.";
        } else {
            readerRole = isVi
                    ? "Bạn là một Tarot Reader kỳ cựu với hơn 15 năm kinh nghiệm giải bài trực tiếp, am hiểu sâu sắc hệ biểu tượng Rider-Waite-Smith, sự tương tác nguyên tố và tâm lý con người trong đời sống thực tế."
                    : "You are a seasoned Tarot Reader with over 15 years of hands-on practice, deeply versed in Rider-Waite-Smith symbolism, elemental interplay, and real-world human psychology.";
            taskInstruction = isVi
                    ? "Hãy viết một bài luận giải CHI TIẾT, SÂU SẮC VÀ THỰC TẾ (khoảng 350-500 từ) trả lời thẳng vào câu hỏi của người hỏi, chia thành đúng 5 đoạn văn thuần túy (mỗi đoạn 3-5 câu) cách nhau bằng một dòng trống:\n"
                    + "Đoạn 1: Đọc bức tranh tổng quan mạch năng lượng kết nối cả 3 lá bài (tương tác giữa các nguyên tố, tỷ lệ lá Ẩn Chính/Ẩn Phụ, thế Xuôi/Ngược) đặt trực tiếp vào chủ đề và câu hỏi cụ thể.\n"
                    + "Đoạn 2: Mở đầu tự nhiên bằng tên vị trí thứ nhất và tên lá bài (nêu rõ Xuôi hay Ngược), giải mã sâu bối cảnh nền tảng, tâm lý và thực tế hiện tại đang diễn ra.\n"
                    + "Đoạn 3: Mở đầu tự nhiên bằng tên vị trí thứ hai và tên lá bài, bóc tách nút thắt cốt lõi, động lực ẩn giấu, cảm xúc ngầm hoặc rào cản/đòn bẩy quan trọng khi đặt cạnh lá đầu tiên.\n"
                    + "Đoạn 4: Mở đầu tự nhiên bằng tên vị trí thứ ba và tên lá bài, luận giải chiều hướng phát triển sắp tới, những cơ hội hoặc cảnh báo thực tế và điều kiện để chuyển hóa tình huống.\n"
                    + "Đoạn 5: Đúc kết lời khuyên thẳng thắn, chín chắn như một người đọc bài dày dạn kinh nghiệm đang trò chuyện trực tiếp, chỉ rõ 1-2 hành động cụ thể nên làm ngay và tâm thế cần giữ."
                    : "Write a DETAILED, INSIGHTFUL, AND GROUNDED reading (350-500 words) directly addressing the seeker's question, structured into 5 clean prose paragraphs (3-5 sentences each) separated by a blank line:\n"
                    + "Paragraph 1: Synthesize the overarching energetic arc across all 3 cards (elemental interplay, Major vs. Minor weight, upright/reversed balance) directly framed around the seeker's topic and question.\n"
                    + "Paragraph 2: Open naturally with the first position name and card (explicitly noting Upright or Reversed), unpacking the foundational situation and present reality.\n"
                    + "Paragraph 3: Open naturally with the second position name and card, diagnosing the hidden feelings, inner blocks, leverage, or pivotal tension in dialogue with the first card.\n"
                    + "Paragraph 4: Open naturally with the third position name and card, projecting the likely trajectory, real-world turning points, and conditions for the healthiest outcome.\n"
                    + "Paragraph 5: Close with candid, seasoned counsel as an experienced reader sitting across the table, offering 1-2 concrete next actions and the mindset to hold.";
        }

        String prompt = String.format(
                "%s\n"
                + "Câu hỏi hoặc chủ đề: \"%s\".\n"
                + "Sơ đồ trải bài: %s.\n"
                + "Các lá bài đã bốc được:\n%s\n"
                + "%s\n\n%s",
                readerRole,
                question,
                spreadName,
                cardDetails.toString(),
                taskInstruction,
                formatRules
        );

        return callGeminiApi(prompt);
    }

    public String generateFollowUpAnswer(ReadingSession session, String userQuestion, String locale) {
        if (!isConfigured()) {
            return null;
        }

        boolean isVi = locale == null || "vi".equalsIgnoreCase(locale);
        StringBuilder cardDetails = new StringBuilder();
        if (session.getDrawnCards() != null && !session.getDrawnCards().isEmpty()) {
            for (DrawnCard dc : session.getDrawnCards()) {
                String position = isVi ? dc.getPositionNameVi() : dc.getPositionNameEn();
                String cardName = dc.getCard() != null ? (isVi ? dc.getCard().getNameVi() : dc.getCard().getNameEn()) : "Lá bài";
                String orientation = Boolean.TRUE.equals(dc.getIsReversed())
                        ? (isVi ? "Ngược (Reversed)" : "Reversed")
                        : (isVi ? "Xuôi (Upright)" : "Upright");
                cardDetails.append(String.format("- %s: %s (%s)\n", position, cardName, orientation));
            }
        }

        String taskInstruction = isVi
                ? "Hãy trả lời trực diện, điềm tĩnh và có chiều sâu như một Tarot Reader nhiều năm kinh nghiệm bằng 2-3 đoạn văn rõ ràng (mỗi đoạn 3-4 câu), liên kết trực tiếp lá bài hoặc câu hỏi mới với toàn bộ các lá đã xuất hiện, cách nhau bằng một dòng trống."
                : "Answer directly, calmly, and with the depth of an experienced Tarot Reader in 2-3 clear paragraphs (3-4 sentences each), connecting the new question or clarifier card directly with all cards on the table, separated by a blank line.";

        String prompt = String.format(
                "Bạn là một Tarot Reader nhiều kinh nghiệm đang tiếp tục phiên đối thoại đào sâu và giải nghĩa lá bài làm rõ (Clarifier) cùng Seeker.\n"
                + "Câu hỏi ban đầu của Seeker: \"%s\".\n"
                + "Các lá bài trong trải bài:\n%s\n"
                + "Tóm tắt luận giải trước đó: %s.\n\n"
                + "Seeker vừa hỏi hoặc rút thêm lá làm rõ: \"%s\".\n\n"
                + "%s\n\n%s",
                session.getUserQuestion() != null ? session.getUserQuestion() : "Định hướng tổng quan",
                cardDetails.length() > 0 ? cardDetails.toString() : "- Các lá bài đại diện cho năng lượng chuyển hóa",
                session.getAiSynthesisResult() != null
                        ? session.getAiSynthesisResult().substring(0, Math.min(800, session.getAiSynthesisResult().length()))
                        : "Trải bài khai phóng tiềm năng",
                userQuestion,
                taskInstruction,
                buildEditorialFormatRules(isVi, true)
        );

        return callGeminiApi(prompt);
    }

    private String buildEditorialFormatRules(boolean isVi, boolean allowDetailedParagraphs) {
        String paragraphRuleVi = allowDetailedParagraphs
                ? "- Chia nội dung thành các đoạn văn mạch lạc (mỗi đoạn 3-5 câu), cách nhau bằng đúng một dòng trống; không viết liệt kê gạch đầu dòng máy móc."
                : "- Chia nội dung thành các đoạn văn ngắn gọn (mỗi đoạn 2-3 câu), cách nhau bằng đúng một dòng trống.";
        String paragraphRuleEn = allowDetailedParagraphs
                ? "- Structure the reading into cohesive prose paragraphs (3-5 sentences each) separated by a blank line; avoid robotic bullet lists."
                : "- Break the response into short, readable paragraphs (2-3 sentences each) separated by a blank line.";

        if (isVi) {
            return "QUY TẮC BẮT BUỘC VỀ VĂN PHONG VÀ ĐỊNH DẠNG:\n"
                    + "- Viết bằng tiếng Việt với giọng văn tự nhiên, điềm tĩnh, sâu sắc và tinh tế như một người đọc bài giàu trải nghiệm trò chuyện trực tiếp.\n"
                    + "- Tránh hoàn toàn các câu mở đầu hoặc kết thúc sáo rỗng kiểu AI (như 'Chào bạn', 'Dưới đây là', 'Tóm lại', 'Hãy nhớ rằng').\n"
                    + "- TUYỆT ĐỐI KHÔNG dùng ký tự Markdown (cấm ###, ##, #, **, *, __, ---, backtick) và KHÔNG chèn emoji hay icon.\n"
                    + paragraphRuleVi;
        }
        return "MANDATORY STYLE AND FORMATTING RULES:\n"
                + "- Write in English with a calm, grounded, natural human editorial voice.\n"
                + "- Avoid generic AI filler openings or closings (such as 'Here is your reading', 'In conclusion', 'Remember that').\n"
                + "- STRICTLY FORBIDDEN to use Markdown characters (no ###, ##, #, **, *, __, ---, backticks) and DO NOT insert emojis or icons.\n"
                + paragraphRuleEn;
    }

    private String callGeminiApi(String prompt) {
        try {
            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    modelName, apiKey.trim());

            Map<String, Object> payload = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(40))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!textNode.isMissingNode()) {
                    return sanitizeEditorialText(textNode.asText());
                }
            } else {
                log.warn("Gemini API error status: {}, body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to invoke Gemini API: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Làm sạch các ký tự Markdown thô và chuẩn hóa ngắt đoạn nếu LLM vẫn sinh ra định dạng thừa.
     */
    private String sanitizeEditorialText(String raw) {
        if (raw == null || raw.isBlank()) {
            return raw;
        }
        String text = raw.replace("\r\n", "\n");
        text = text.replaceAll("(?m)^\\s*[-*_]{3,}\\s*$", "");
        text = text.replaceAll("(?m)^\\s{0,3}#{1,6}\\s+", "");
        text = text.replaceAll("(?m)^\\s*[-*+]\\s+", "• ");
        text = unwrapMarkdown(text, BOLD_PATTERN, 1);
        text = unwrapMarkdown(text, UNDERLINE_PATTERN, 1);
        text = unwrapMarkdown(text, CODE_PATTERN, 1);
        text = ITALIC_PATTERN.matcher(text).replaceAll(m -> Matcher.quoteReplacement(m.group(1) + m.group(2)));
        text = text.replaceAll("\\*{2,}", "");
        text = text.replaceAll("(?m)^\\s*[✦✨🔮🌟🌙]+\\s*", "");
        text = text.replaceAll("[✦✨]+", "");

        String[] lines = text.split("\n", -1);
        StringBuilder cleaned = new StringBuilder();
        for (int i = 0; i < lines.length; i++) {
            cleaned.append(lines[i].replaceAll("[ \\t]{2,}", " ").trim());
            if (i < lines.length - 1) {
                cleaned.append("\n");
            }
        }
        return cleaned.toString().replaceAll("\\n{3,}", "\n\n").trim();
    }

    private String unwrapMarkdown(String input, Pattern pattern, int groupIndex) {
        return pattern.matcher(input).replaceAll(m -> Matcher.quoteReplacement(m.group(groupIndex)));
    }
}
