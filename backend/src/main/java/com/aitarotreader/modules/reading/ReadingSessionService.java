package com.aitarotreader.modules.reading;

import com.aitarotreader.common.CustomException;
import com.aitarotreader.common.ErrorCode;
import com.aitarotreader.modules.tarot.*;
import com.aitarotreader.modules.user.User;
import com.aitarotreader.modules.user.UserRepository;
import com.aitarotreader.modules.wallet.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadingSessionService {

    private final ReadingSessionRepository sessionRepository;
    private final DrawnCardRepository drawnCardRepository;
    private final SessionMessageRepository messageRepository;
    private final JournalEntryRepository journalRepository;
    private final SpreadTemplateRepository spreadRepository;
    private final TarotDeckRepository deckRepository;
    private final TarotCardRepository cardRepository;
    private final UserRepository userRepository;
    private final WalletService walletService;
    private final TarotCatalogService catalogService;

    @Transactional
    public ReadingSessionDto createSession(UUID userId, CreateReadingSessionRequest request) {
        User user = userId != null ? userRepository.findById(userId).orElse(null) : null;

        SpreadTemplate spread = spreadRepository.findById(request.getSpreadId())
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Spread template not found: " + request.getSpreadId()));

        TarotDeck deck = deckRepository.findById(request.getDeckId() != null ? request.getDeckId() : "ED-01")
                .orElseGet(() -> deckRepository.findById("ED-01").orElse(null));

        // Deduct crystals if required and user is logged in
        if (user != null && spread.getCrystalCost() > 0) {
            walletService.deductCrystals(userId, spread.getCrystalCost(), "SPREAD_DRAW", spread.getId(), "Spread: " + spread.getNameEn());
        }

        ReadingSession session = ReadingSession.builder()
                .user(user)
                .spread(spread)
                .deck(deck)
                .inputMode(request.getInputMode())
                .personaCode(request.getPersonaCode() != null ? request.getPersonaCode() : "MYSTIC_SAGE")
                .userQuestion(request.getUserQuestion())
                .followUpCount(0)
                .maxFollowUps(2)
                .status("COMPLETED")
                .build();

        ReadingSession savedSession = sessionRepository.save(session);

        List<DrawnCard> drawnCards = new ArrayList<>();
        for (DrawnCardInput cardInput : request.getCards()) {
            TarotCard card = cardRepository.findById(cardInput.getCardId())
                    .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Tarot card not found: " + cardInput.getCardId()));

            DrawnCard drawn = DrawnCard.builder()
                    .session(savedSession)
                    .card(card)
                    .positionIndex(cardInput.getPositionIndex())
                    .positionNameEn(cardInput.getPositionNameEn())
                    .positionNameVi(cardInput.getPositionNameVi())
                    .isReversed(cardInput.getIsReversed() != null ? cardInput.getIsReversed() : false)
                    .isClarifier(cardInput.getIsClarifier() != null ? cardInput.getIsClarifier() : false)
                    .build();
            drawnCards.add(drawn);
        }
        drawnCardRepository.saveAll(drawnCards);
        savedSession.setDrawnCards(drawnCards);

        // Generate holistic reading synthesis
        String synthesis = generateInitialSynthesis(savedSession, drawnCards, user != null ? user.getLocale() : "vi");
        savedSession.setAiSynthesisResult(synthesis);
        savedSession = sessionRepository.save(savedSession);

        return toSessionDto(savedSession);
    }

    @Transactional
    public ReadingSessionDto performDailyDraw(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found"));

        // Check if daily draw already performed in past 24 hours
        Instant past24Hours = Instant.now().minus(24, ChronoUnit.HOURS);
        List<ReadingSession> recentSessions = sessionRepository.findByUserIdAndCreatedAtAfter(userId, past24Hours);
        boolean hasDailyDrawToday = recentSessions.stream()
                .anyMatch(s -> s.getSpread() != null && "S-01".equals(s.getSpread().getId()));

        if (hasDailyDrawToday) {
            log.info("User {} already completed their free daily draw today", userId);
        }

        // Draw random card
        List<TarotCard> allCards = cardRepository.findAll();
        if (allCards.isEmpty()) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "No tarot cards available in catalog");
        }
        TarotCard randomCard = allCards.get(new Random().nextInt(allCards.size()));
        boolean isReversed = new Random().nextBoolean();

        SpreadTemplate dailySpread = spreadRepository.findById("S-01").orElse(null);
        TarotDeck deck = deckRepository.findById("ED-01").orElse(null);

        ReadingSession session = ReadingSession.builder()
                .user(user)
                .spread(dailySpread)
                .deck(deck)
                .inputMode(InputMode.VIRTUAL)
                .personaCode("MYSTIC_SAGE")
                .userQuestion("Daily Energetic Guidance & Reflection")
                .followUpCount(0)
                .maxFollowUps(2)
                .status("COMPLETED")
                .build();
        ReadingSession savedSession = sessionRepository.save(session);

        DrawnCard drawn = DrawnCard.builder()
                .session(savedSession)
                .card(randomCard)
                .positionIndex(0)
                .positionNameEn("Daily Focus & Advice")
                .positionNameVi("Năng lượng & Lời khuyên trọng tâm")
                .isReversed(isReversed)
                .isClarifier(false)
                .build();
        drawnCardRepository.save(drawn);
        savedSession.setDrawnCards(List.of(drawn));

        // Daily reading synthesis
        String synthesis = generateInitialSynthesis(savedSession, List.of(drawn), user.getLocale());
        savedSession.setAiSynthesisResult(synthesis);
        savedSession = sessionRepository.save(savedSession);

        return toSessionDto(savedSession);
    }

    @Transactional
    public ReadingSessionDto askFollowUpQuestion(UUID sessionId, UUID userId, FollowUpChatRequest request) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        if (session.getFollowUpCount() >= session.getMaxFollowUps()) {
            throw new CustomException(ErrorCode.FOLLOW_UP_LIMIT_REACHED);
        }

        // Save user message
        SessionMessage userMsg = SessionMessage.builder()
                .session(session)
                .role("USER")
                .content(request.getQuestion())
                .build();
        messageRepository.save(userMsg);

        // Generate AI Answer
        String aiAnswer = "Dựa trên năng lượng của các lá bài đã xuất hiện và câu hỏi của bạn: '" + request.getQuestion()
                + "', lời khuyên từ vũ trụ nhắc nhở bạn hãy giữ vững tâm trí điềm tĩnh, lắng nghe trực giác và tiến bước tự tin.";

        SessionMessage aiMsg = SessionMessage.builder()
                .session(session)
                .role("AI")
                .content(aiAnswer)
                .build();
        messageRepository.save(aiMsg);

        session.setFollowUpCount(session.getFollowUpCount() + 1);
        session = sessionRepository.save(session);

        return toSessionDto(session);
    }

    @Transactional
    public ReadingSessionDto saveJournal(UUID sessionId, UUID userId, SaveJournalRequest request) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        JournalEntry journal = journalRepository.findById(sessionId).orElseGet(() -> JournalEntry.builder()
                .session(session)
                .build());

        journal.setReflectionNote(request.getReflectionNote());
        if (request.getMoodTags() != null) {
            journal.setMoodTagsJson(String.join(",", request.getMoodTags()));
        }
        journalRepository.save(journal);
        session.setJournalEntry(journal);

        return toSessionDto(session);
    }

    @Transactional(readOnly = true)
    public ReadingSessionDto getSessionById(UUID sessionId) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));
        return toSessionDto(session);
    }

    @Transactional(readOnly = true)
    public Page<ReadingSessionDto> getUserSessions(UUID userId, Pageable pageable) {
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::toSessionDto);
    }

    private String generateInitialSynthesis(ReadingSession session, List<DrawnCard> cards, String locale) {
        boolean isVi = "vi".equalsIgnoreCase(locale);
        StringBuilder sb = new StringBuilder();

        if (isVi) {
            sb.append("✨ **Tổng quan năng lượng trải bài:**\n\n");
            for (DrawnCard dc : cards) {
                String cardName = dc.getCard().getNameVi();
                String orientation = dc.getIsReversed() ? "(Ngược)" : "(Xuôi)";
                String position = dc.getPositionNameVi() != null ? dc.getPositionNameVi() : "Vị trí " + (dc.getPositionIndex() + 1);
                sb.append(String.format("- **%s:** **%s %s** - %s\n",
                        position, cardName, orientation,
                        dc.getIsReversed() ? dc.getCard().getKeywordsReversedVi() : dc.getCard().getKeywordsUprightVi()));
            }
            sb.append("\n**Lời khuyên minh triết:** Hãy dành thời gian tĩnh lặng để chuyển hóa những trở ngại thành cơ hội phát triển.");
        } else {
            sb.append("✨ **Holistic Spread Energetic Synthesis:**\n\n");
            for (DrawnCard dc : cards) {
                String cardName = dc.getCard().getNameEn();
                String orientation = dc.getIsReversed() ? "(Reversed)" : "(Upright)";
                String position = dc.getPositionNameEn() != null ? dc.getPositionNameEn() : "Position " + (dc.getPositionIndex() + 1);
                sb.append(String.format("- **%s:** **%s %s** - %s\n",
                        position, cardName, orientation,
                        dc.getIsReversed() ? dc.getCard().getKeywordsReversedEn() : dc.getCard().getKeywordsUprightEn()));
            }
            sb.append("\n**Sage Counsel:** Take quiet moments of reflection to turn inner obstacles into transformative growth.");
        }

        return sb.toString();
    }

    public ReadingSessionDto toSessionDto(ReadingSession session) {
        List<DrawnCard> drawnCards = session.getDrawnCards() != null ? session.getDrawnCards() : Collections.emptyList();
        List<SessionMessage> messages = session.getMessages() != null ? session.getMessages() : Collections.emptyList();

        List<ReadingSessionDto.DrawnCardView> cardViews = drawnCards.stream()
                .map(dc -> ReadingSessionDto.DrawnCardView.builder()
                        .id(dc.getId())
                        .card(catalogService.toCardDto(dc.getCard()))
                        .positionIndex(dc.getPositionIndex())
                        .positionNameEn(dc.getPositionNameEn())
                        .positionNameVi(dc.getPositionNameVi())
                        .isReversed(dc.getIsReversed())
                        .isClarifier(dc.getIsClarifier())
                        .build())
                .collect(Collectors.toList());

        List<ReadingSessionDto.SessionMessageView> messageViews = messages.stream()
                .map(m -> ReadingSessionDto.SessionMessageView.builder()
                        .id(m.getId())
                        .role(m.getRole())
                        .content(m.getContent())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        ReadingSessionDto.JournalEntryView journalView = session.getJournalEntry() != null
                ? ReadingSessionDto.JournalEntryView.builder()
                .reflectionNote(session.getJournalEntry().getReflectionNote())
                .moodTagsJson(session.getJournalEntry().getMoodTagsJson())
                .updatedAt(session.getJournalEntry().getUpdatedAt())
                .build()
                : null;

        return ReadingSessionDto.builder()
                .id(session.getId())
                .userId(session.getUser() != null ? session.getUser().getId() : null)
                .spreadId(session.getSpread() != null ? session.getSpread().getId() : null)
                .spreadNameEn(session.getSpread() != null ? session.getSpread().getNameEn() : null)
                .spreadNameVi(session.getSpread() != null ? session.getSpread().getNameVi() : null)
                .deckId(session.getDeck() != null ? session.getDeck().getId() : null)
                .inputMode(session.getInputMode())
                .personaCode(session.getPersonaCode())
                .userQuestion(session.getUserQuestion())
                .aiSynthesisResult(session.getAiSynthesisResult())
                .followUpCount(session.getFollowUpCount())
                .maxFollowUps(session.getMaxFollowUps())
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .drawnCards(cardViews)
                .messages(messageViews)
                .journal(journalView)
                .build();
    }
}
