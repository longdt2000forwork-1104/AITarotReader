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

    public boolean isConfigured() {
        return apiKey != null && !apiKey.trim().isEmpty();
    }

    public String generateTarotSynthesis(ReadingSession session, List<DrawnCard> cards, String locale) {
        if (!isConfigured()) {
            return null;
        }

        boolean isVi = locale == null || "vi".equalsIgnoreCase(locale);
        StringBuilder cardDetails = new StringBuilder();
        for (DrawnCard dc : cards) {
            String position = isVi ? dc.getPositionNameVi() : dc.getPositionNameEn();
            String cardName = isVi ? dc.getCard().getNameVi() : dc.getCard().getNameEn();
            String orientation = dc.getIsReversed() ? (isVi ? "Ngược (Reversed)" : "Reversed") : (isVi ? "Xuôi (Upright)" : "Upright");
            String keywords = dc.getIsReversed()
                    ? (isVi ? dc.getCard().getKeywordsReversedVi() : dc.getCard().getKeywordsReversedEn())
                    : (isVi ? dc.getCard().getKeywordsUprightVi() : dc.getCard().getKeywordsUprightEn());

            cardDetails.append(String.format("- Vị trí [%s]: Lá %s (%s). Từ khóa năng lượng: %s\n",
                    position, cardName, orientation, keywords));
        }

        String prompt = String.format(
                "Bạn là một Reader Tarot chuyên nghiệp và sâu sắc theo phong cách %s. " +
                "Người hỏi đặt câu hỏi: \"%s\". " +
                "Sơ đồ trải bài: %s. " +
                "Các lá bài đã bốc được:\n%s\n" +
                "Hãy phân tích chi tiết, sâu sắc từng vị trí lá bài, sau đó tổng hợp năng lượng cốt lõi và đưa ra lời khuyên hành động thực tế bằng tiếng %s (dưới định dạng Markdown đẹp, có icon biểu tượng).",
                session.getPersonaCode() != null ? session.getPersonaCode() : "MYSTIC_SAGE",
                session.getUserQuestion() != null ? session.getUserQuestion() : "Định hướng năng lượng tổng quan",
                session.getSpread() != null ? session.getSpread().getNameVi() : "Trải bài Tarot",
                cardDetails.toString(),
                isVi ? "Việt" : "Anh"
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

        String prompt = String.format(
                "Bạn là Tarot Reader đang tiếp tục phiên đối thoại đào sâu với Seeker.\n" +
                "Câu hỏi ban đầu của Seeker: \"%s\".\n" +
                "Các lá bài trong trải bài:\n%s\n" +
                "Tóm tắt luận giải trước đó: %s.\n\n" +
                "Seeker vừa đặt thêm câu hỏi đào sâu: \"%s\".\n\n" +
                "Hãy trả lời một cách thông thái, ân cần, trực diện và thấu suốt bằng tiếng %s (dưới định dạng Markdown đẹp, có icon biểu tượng cảm xúc phù hợp).",
                session.getUserQuestion() != null ? session.getUserQuestion() : "Định hướng tổng quan",
                cardDetails.length() > 0 ? cardDetails.toString() : "- Các lá bài đại diện cho năng lượng chuyển hóa",
                session.getAiSynthesisResult() != null
                        ? session.getAiSynthesisResult().substring(0, Math.min(500, session.getAiSynthesisResult().length()))
                        : "Trải bài khai phóng tiềm năng",
                userQuestion,
                isVi ? "Việt" : "Anh"
        );

        return callGeminiApi(prompt);
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
                    .timeout(Duration.ofSeconds(20))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!textNode.isMissingNode()) {
                    return textNode.asText();
                }
            } else {
                log.warn("Gemini API error status: {}, body: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to invoke Gemini API: {}", e.getMessage());
        }
        return null;
    }
}
