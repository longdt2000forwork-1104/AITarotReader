package com.aitarotreader.modules.reading;

import com.aitarotreader.modules.tarot.TarotCardDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingSessionDto {
    private UUID id;
    private UUID userId;
    private String spreadId;
    private String spreadNameEn;
    private String spreadNameVi;
    private String deckId;
    private InputMode inputMode;
    private String personaCode;
    private String userQuestion;
    private String aiSynthesisResult;
    private Integer followUpCount;
    private Integer maxFollowUps;
    private String status;
    private Instant createdAt;
    private List<DrawnCardView> drawnCards;
    private List<SessionMessageView> messages;
    private JournalEntryView journal;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DrawnCardView {
        private UUID id;
        private TarotCardDto card;
        private Integer positionIndex;
        private String positionNameEn;
        private String positionNameVi;
        private Boolean isReversed;
        private Boolean isClarifier;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionMessageView {
        private UUID id;
        private String role;
        private String content;
        private Instant createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JournalEntryView {
        private String reflectionNote;
        private String moodTagsJson;
        private Instant updatedAt;
    }
}
