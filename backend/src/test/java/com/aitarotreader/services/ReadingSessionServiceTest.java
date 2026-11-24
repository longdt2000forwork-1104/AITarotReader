package com.aitarotreader.services;

import com.aitarotreader.dtos.FollowUpChatRequest;
import com.aitarotreader.dtos.ReadingSessionDto;
import com.aitarotreader.dtos.TarotCardDto;
import com.aitarotreader.dtos.TopicReadingRequest;
import com.aitarotreader.entities.*;
import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import com.aitarotreader.repositories.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReadingSessionServiceTest {

    @Mock
    private ReadingSessionRepository sessionRepository;
    @Mock
    private DrawnCardRepository drawnCardRepository;
    @Mock
    private SessionMessageRepository messageRepository;
    @Mock
    private JournalEntryRepository journalRepository;
    @Mock
    private SpreadTemplateRepository spreadRepository;
    @Mock
    private TarotDeckRepository deckRepository;
    @Mock
    private TarotCardRepository cardRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private MysticProfileRepository mysticProfileRepository;
    @Mock
    private WalletService walletService;
    @Mock
    private TarotCatalogService catalogService;
    @Mock
    private GeminiService geminiService;

    @InjectMocks
    private ReadingSessionService readingSessionService;

    private UUID userId;
    private User user;
    private SpreadTemplate spread;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        user = User.builder()
                .id(userId)
                .email("seeker@example.com")
                .locale("vi")
                .build();
        spread = SpreadTemplate.builder()
                .id("S-01")
                .nameEn("Daily Card")
                .nameVi("Lá Bài Hàng Ngày")
                .build();
    }

    private ReadingSession buildSession(UUID sessionId, Instant createdAt) {
        return ReadingSession.builder()
                .id(sessionId)
                .user(user)
                .spread(spread)
                .inputMode(InputMode.VIRTUAL)
                .personaCode("MYSTIC_SAGE")
                .followUpCount(0)
                .maxFollowUps(10)
                .status("COMPLETED")
                .createdAt(createdAt)
                .drawnCards(new ArrayList<>())
                .messages(new ArrayList<>())
                .build();
    }

    @Test
    void askFollowUpQuestion_whenSessionIsYesterday_throwsPastSessionReadOnly() {
        UUID sessionId = UUID.randomUUID();
        Instant yesterdayLate = LocalDate.now(ReadingSessionService.VIETNAM_ZONE)
                .minusDays(1)
                .atTime(23, 59, 59)
                .atZone(ReadingSessionService.VIETNAM_ZONE)
                .toInstant();
        ReadingSession pastSession = buildSession(sessionId, yesterdayLate);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(pastSession));

        FollowUpChatRequest request = new FollowUpChatRequest("Hỏi thêm về lá bài ngày hôm qua?");

        assertThatThrownBy(() -> readingSessionService.askFollowUpQuestion(sessionId, userId, request))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> assertThat(((CustomException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.PAST_SESSION_READ_ONLY));

        verifyNoInteractions(messageRepository);
        verifyNoInteractions(geminiService);
        verify(sessionRepository, never()).save(any());
    }

    @Test
    void askFollowUpQuestion_whenSessionIsFiveDaysAgo_throwsPastSessionReadOnly() {
        UUID sessionId = UUID.randomUUID();
        Instant fiveDaysAgo = LocalDate.now(ReadingSessionService.VIETNAM_ZONE)
                .minusDays(5)
                .atTime(10, 0)
                .atZone(ReadingSessionService.VIETNAM_ZONE)
                .toInstant();
        ReadingSession oldSession = buildSession(sessionId, fiveDaysAgo);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(oldSession));

        FollowUpChatRequest request = new FollowUpChatRequest("Phiên 5 ngày trước có hỏi được không?");

        assertThatThrownBy(() -> readingSessionService.askFollowUpQuestion(sessionId, userId, request))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> assertThat(((CustomException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.PAST_SESSION_READ_ONLY));

        verifyNoInteractions(messageRepository);
        verifyNoInteractions(geminiService);
    }

    @Test
    void askFollowUpQuestion_whenSessionIsFutureDate_throwsPastSessionReadOnly() {
        UUID sessionId = UUID.randomUUID();
        Instant tomorrow = LocalDate.now(ReadingSessionService.VIETNAM_ZONE)
                .plusDays(1)
                .atTime(0, 5)
                .atZone(ReadingSessionService.VIETNAM_ZONE)
                .toInstant();
        ReadingSession futureSession = buildSession(sessionId, tomorrow);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(futureSession));

        FollowUpChatRequest request = new FollowUpChatRequest("Future timestamp should not chat");

        assertThatThrownBy(() -> readingSessionService.askFollowUpQuestion(sessionId, userId, request))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> assertThat(((CustomException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.PAST_SESSION_READ_ONLY));

        verifyNoInteractions(messageRepository);
        verifyNoInteractions(geminiService);
    }

    @Test
    void askFollowUpQuestion_whenSessionIsToday_succeedsAndSetsIsTodaySessionTrue() {
        UUID sessionId = UUID.randomUUID();
        ReadingSession todaySession = buildSession(sessionId, Instant.now());

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(todaySession));
        when(geminiService.isConfigured()).thenReturn(true);
        when(geminiService.generateFollowUpAnswer(eq(todaySession), anyString(), eq("vi")))
                .thenReturn("Câu trả lời từ AI cho phiên hôm nay.");
        when(messageRepository.save(any(SessionMessage.class))).thenAnswer(inv -> {
            SessionMessage msg = inv.getArgument(0);
            msg.setId(UUID.randomUUID());
            if (msg.getCreatedAt() == null) {
                msg.setCreatedAt(Instant.now());
            }
            return msg;
        });
        when(sessionRepository.save(any(ReadingSession.class))).thenAnswer(inv -> inv.getArgument(0));
        when(drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(sessionId)).thenReturn(Collections.emptyList());
        when(messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)).thenAnswer(inv -> todaySession.getMessages());

        ReadingSessionDto dto = readingSessionService.askFollowUpQuestion(
                sessionId,
                userId,
                new FollowUpChatRequest("Tôi nên tập trung vào điều gì hôm nay?")
        );

        assertThat(dto.getFollowUpCount()).isEqualTo(1);
        assertThat(dto.getIsTodaySession()).isTrue();
        assertThat(dto.getMessages()).hasSize(2);
        verify(messageRepository, times(2)).save(any(SessionMessage.class));
        verify(geminiService).generateFollowUpAnswer(eq(todaySession), eq("Tôi nên tập trung vào điều gì hôm nay?"), eq("vi"));
    }

    @Test
    void toSessionDto_setsIsTodaySessionFlagAccurately() {
        UUID pastId = UUID.randomUUID();
        UUID todayId = UUID.randomUUID();
        Instant yesterday = LocalDate.now(ReadingSessionService.VIETNAM_ZONE)
                .minusDays(1)
                .atTime(12, 0)
                .atZone(ReadingSessionService.VIETNAM_ZONE)
                .toInstant();

        ReadingSession pastSession = buildSession(pastId, yesterday);
        ReadingSession todaySession = buildSession(todayId, Instant.now());

        when(drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(any())).thenReturn(Collections.emptyList());
        when(messageRepository.findBySessionIdOrderByCreatedAtAsc(any())).thenReturn(Collections.emptyList());

        ReadingSessionDto pastDto = readingSessionService.toSessionDto(pastSession);
        ReadingSessionDto todayDto = readingSessionService.toSessionDto(todaySession);

        assertThat(pastDto.getIsTodaySession()).isFalse();
        assertThat(todayDto.getIsTodaySession()).isTrue();
    }

    @Test
    void drawClarifierCard_whenSessionIsYesterday_throwsPastSessionReadOnly() {
        UUID sessionId = UUID.randomUUID();
        Instant yesterday = LocalDate.now(ReadingSessionService.VIETNAM_ZONE)
                .minusDays(1)
                .atTime(15, 0)
                .atZone(ReadingSessionService.VIETNAM_ZONE)
                .toInstant();
        ReadingSession pastSession = buildSession(sessionId, yesterday);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(pastSession));

        assertThatThrownBy(() -> readingSessionService.drawClarifierCard(sessionId, userId))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> assertThat(((CustomException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.PAST_SESSION_READ_ONLY));

        verifyNoInteractions(drawnCardRepository);
        verifyNoInteractions(geminiService);
    }

    private List<TarotCard> buildSampleCards(int count) {
        List<TarotCard> cards = new ArrayList<>();
        for (int i = 0; i < count; i++) {
            cards.add(TarotCard.builder()
                    .id(i)
                    .code("card_" + i)
                    .arcana(Arcana.MAJOR)
                    .number(i)
                    .nameEn("Card " + i)
                    .nameVi("Lá Bài " + i)
                    .element("Fire")
                    .keywordsUprightEn("Clarity, focus")
                    .keywordsUprightVi("Sáng suốt, tập trung")
                    .keywordsReversedEn("Delay, doubt")
                    .keywordsReversedVi("Chần chừ, hoài nghi")
                    .summaryEn("Sample card summary " + i)
                    .summaryVi("Ý nghĩa mẫu của lá " + i)
                    .build());
        }
        return cards;
    }

    @Test
    void performTopicReading_validTopics_drawsThreeDistinctCardsAndSetsTopicPositions() {
        List<TarotCard> catalog = buildSampleCards(12);
        SpreadTemplate topicSpread = SpreadTemplate.builder()
                .id("S-02")
                .nameEn("Three Card Timeline")
                .nameVi("Trải Bài 3 Lá")
                .build();

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(cardRepository.findAll()).thenReturn(catalog);
        when(spreadRepository.findById("S-02")).thenReturn(Optional.of(topicSpread));
        when(deckRepository.findById("ED-01")).thenReturn(Optional.empty());
        when(geminiService.isConfigured()).thenReturn(false);
        when(catalogService.toCardDto(any(TarotCard.class))).thenAnswer(inv -> {
            TarotCard tc = inv.getArgument(0);
            return TarotCardDto.builder()
                    .id(tc.getId())
                    .code(tc.getCode())
                    .nameEn(tc.getNameEn())
                    .nameVi(tc.getNameVi())
                    .build();
        });

        AtomicReference<List<DrawnCard>> savedDrawnRef = new AtomicReference<>(Collections.emptyList());
        when(sessionRepository.save(any(ReadingSession.class))).thenAnswer(inv -> {
            ReadingSession s = inv.getArgument(0);
            if (s.getId() == null) s.setId(UUID.randomUUID());
            if (s.getCreatedAt() == null) s.setCreatedAt(Instant.now());
            return s;
        });
        when(drawnCardRepository.saveAll(anyList())).thenAnswer(inv -> {
            List<DrawnCard> list = inv.getArgument(0);
            savedDrawnRef.set(list);
            return list;
        });
        when(drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(any())).thenAnswer(inv -> savedDrawnRef.get());
        when(messageRepository.findBySessionIdOrderByCreatedAtAsc(any())).thenReturn(Collections.emptyList());
        when(journalRepository.findById(any())).thenReturn(Optional.empty());
        when(journalRepository.save(any(JournalEntry.class))).thenAnswer(inv -> inv.getArgument(0));

        ReadingSessionDto loveDto = readingSessionService.performTopicReading(
                userId, new TopicReadingRequest("LOVE", "Chuyện tình cảm sắp tới ra sao?", "vi")
        );
        assertThat(loveDto.getDrawnCards()).hasSize(3);
        assertThat(loveDto.getDrawnCards().stream().map(dc -> dc.getCard().getId()).distinct().count()).isEqualTo(3);
        assertThat(loveDto.getUserQuestion()).startsWith("[Tình cảm]");
        assertThat(loveDto.getPersonaCode()).isEqualTo("EXPERIENCED_READER");
        assertThat(loveDto.getMaxFollowUps()).isEqualTo(10);
        assertThat(loveDto.getIsTodaySession()).isTrue();
        assertThat(loveDto.getDrawnCards().get(0).getPositionNameVi()).isEqualTo("Hiện Trạng Kết Nối");
        assertThat(loveDto.getAiSynthesisResult()).isNotBlank();

        ReadingSessionDto familyDto = readingSessionService.performTopicReading(
                userId, new TopicReadingRequest("FAMILY", "Làm sao gắn kết gia đình?", "vi")
        );
        assertThat(familyDto.getUserQuestion()).startsWith("[Gia đình]");
        assertThat(familyDto.getDrawnCards().get(1).getPositionNameVi()).isEqualTo("Nút Thắt Cần Thấu Hiểu");

        ReadingSessionDto careerDto = readingSessionService.performTopicReading(
                userId, new TopicReadingRequest("CAREER", "Có nên đổi việc lúc này?", "vi")
        );
        assertThat(careerDto.getUserQuestion()).startsWith("[Công việc]");
        assertThat(careerDto.getDrawnCards().get(2).getPositionNameVi()).isEqualTo("Triển Vọng & Bước Đi Chiến Lược");
    }

    @Test
    void performTopicReading_invalidTopic_throwsBadRequest() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        assertThatThrownBy(() -> readingSessionService.performTopicReading(
                userId, new TopicReadingRequest("CRYPTO", "Test invalid topic", "vi")
        ))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> assertThat(((CustomException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.BAD_REQUEST));
    }

    @Test
    void drawClarifierCard_onThreeCardSession_allowsAddingClarifierUpToTenCards() {
        UUID sessionId = UUID.randomUUID();
        ReadingSession threeCardSession = buildSession(sessionId, Instant.now());
        List<TarotCard> catalog = buildSampleCards(15);

        List<DrawnCard> currentCards = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            currentCards.add(DrawnCard.builder()
                    .id(UUID.randomUUID())
                    .session(threeCardSession)
                    .card(catalog.get(i))
                    .positionIndex(i)
                    .positionNameVi("Vị trí " + (i + 1))
                    .positionNameEn("Position " + (i + 1))
                    .isReversed(false)
                    .isClarifier(false)
                    .build());
        }
        threeCardSession.setDrawnCards(new ArrayList<>(currentCards));

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(sessionRepository.findById(sessionId)).thenReturn(Optional.of(threeCardSession));
        when(cardRepository.findAll()).thenReturn(catalog);
        when(geminiService.isConfigured()).thenReturn(false);
        when(messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId)).thenReturn(Collections.emptyList());
        when(drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(sessionId)).thenAnswer(inv -> threeCardSession.getDrawnCards());
        when(drawnCardRepository.save(any(DrawnCard.class))).thenAnswer(inv -> {
            DrawnCard dc = inv.getArgument(0);
            if (dc.getId() == null) dc.setId(UUID.randomUUID());
            return dc;
        });
        when(messageRepository.save(any(SessionMessage.class))).thenAnswer(inv -> inv.getArgument(0));
        when(journalRepository.findById(sessionId)).thenReturn(Optional.empty());
        when(journalRepository.save(any(JournalEntry.class))).thenAnswer(inv -> inv.getArgument(0));
        when(catalogService.toCardDto(any(TarotCard.class))).thenAnswer(inv -> {
            TarotCard tc = inv.getArgument(0);
            return TarotCardDto.builder().id(tc.getId()).nameEn(tc.getNameEn()).nameVi(tc.getNameVi()).build();
        });

        ReadingSessionDto afterFourthCard = readingSessionService.drawClarifierCard(sessionId, userId);
        assertThat(afterFourthCard.getDrawnCards()).hasSize(4);

        // Fill up to 10 cards total (3 initial + 7 clarifiers) and confirm the 11th is blocked
        for (int i = 4; i < 10; i++) {
            threeCardSession.getDrawnCards().add(DrawnCard.builder()
                    .id(UUID.randomUUID())
                    .session(threeCardSession)
                    .card(catalog.get(i))
                    .positionIndex(i)
                    .isClarifier(true)
                    .build());
        }

        assertThatThrownBy(() -> readingSessionService.drawClarifierCard(sessionId, userId))
                .isInstanceOf(CustomException.class)
                .satisfies(ex -> assertThat(((CustomException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.BAD_REQUEST));
    }
}
