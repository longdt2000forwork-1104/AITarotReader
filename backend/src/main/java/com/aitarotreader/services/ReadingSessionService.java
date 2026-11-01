package com.aitarotreader.services;

import com.aitarotreader.entities.*;
import com.aitarotreader.dtos.*;
import com.aitarotreader.repositories.*;
import com.aitarotreader.utils.*;
import com.aitarotreader.exceptions.*;

import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;



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

    public static final UUID DEFAULT_SEEKER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private final ReadingSessionRepository sessionRepository;
    private final DrawnCardRepository drawnCardRepository;
    private final SessionMessageRepository messageRepository;
    private final JournalEntryRepository journalRepository;
    private final SpreadTemplateRepository spreadRepository;
    private final TarotDeckRepository deckRepository;
    private final TarotCardRepository cardRepository;
    private final UserRepository userRepository;
    private final MysticProfileRepository mysticProfileRepository;
    private final WalletService walletService;
    private final TarotCatalogService catalogService;
    private final GeminiService geminiService;

    @Transactional
    public User getOrCreateEffectiveUser(UUID userId) {
        UUID effectiveId = userId != null ? userId : DEFAULT_SEEKER_ID;
        return userRepository.findById(effectiveId).orElseGet(() -> {
            log.info("Provisioning default seeker user in Supabase: {}", effectiveId);
            User defaultUser = User.builder()
                    .id(effectiveId)
                    .email("seeker@aitarotreader.com")
                    .fullName("Seeker of Truth")
                    .locale("vi")
                    .crystalBalance(50)
                    .tier(UserTier.FREE)
                    .role(UserRole.USER)
                    .build();
            User saved = userRepository.save(defaultUser);

            MysticProfile profile = MysticProfile.builder()
                    .user(saved)
                    .preferredDeckId("ED-01")
                    .preferredBackId("classic-navy")
                    .allowAiContext(true)
                    .build();
            mysticProfileRepository.save(profile);
            return saved;
        });
    }

    @Transactional
    public ReadingSessionDto createSession(UUID userId, CreateReadingSessionRequest request) {
        User user = getOrCreateEffectiveUser(userId);

        SpreadTemplate spread = spreadRepository.findById(request.getSpreadId())
                .orElseGet(() -> spreadRepository.findAll().stream().findFirst()
                        .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Spread template not found: " + request.getSpreadId())));

        TarotDeck deck = deckRepository.findById(request.getDeckId() != null ? request.getDeckId() : "ED-01")
                .orElseGet(() -> deckRepository.findById("ED-01").orElse(null));

        if (spread.getCrystalCost() > 0 && user.getCrystalBalance() >= spread.getCrystalCost()) {
            walletService.deductCrystals(user.getId(), spread.getCrystalCost(), "SPREAD_DRAW", spread.getId(), "Spread: " + spread.getNameEn());
        }

        ReadingSession session = ReadingSession.builder()
                .user(user)
                .spread(spread)
                .deck(deck)
                .inputMode(request.getInputMode())
                .personaCode(request.getPersonaCode())
                .userQuestion(request.getUserQuestion())
                .followUpCount(0)
                .maxFollowUps(2)
                .status(request.getCards() != null && !request.getCards().isEmpty() ? "COMPLETED" : "CREATED")
                .build();

        ReadingSession savedSession = sessionRepository.save(session);

        List<DrawnCard> drawnCards = new ArrayList<>();
        if (request.getCards() != null && !request.getCards().isEmpty()) {
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
            if (savedSession.getDrawnCards() == null) {
                savedSession.setDrawnCards(new ArrayList<>());
            }
            savedSession.getDrawnCards().clear();
            savedSession.getDrawnCards().addAll(drawnCards);

            String synthesis = generateInitialSynthesis(savedSession, drawnCards, user.getLocale());
            savedSession.setAiSynthesisResult(synthesis);
            savedSession = sessionRepository.save(savedSession);
        }

        return toSessionDto(savedSession);
    }

    @Transactional
    public ReadingSessionDto drawCards(UUID sessionId, UUID userId) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        if (session.getDrawnCards() != null && !session.getDrawnCards().isEmpty()) {
            return toSessionDto(session);
        }

        SpreadTemplate spread = session.getSpread();
        int count = spread != null ? spread.getCardCount() : 3;

        List<TarotCard> allCards = cardRepository.findAll();
        if (allCards.isEmpty()) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "No tarot cards available in catalog");
        }
        Collections.shuffle(allCards);
        List<TarotCard> selectedCards = allCards.subList(0, Math.min(count, allCards.size()));

        List<DrawnCard> drawnCards = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < selectedCards.size(); i++) {
            TarotCard card = selectedCards.get(i);
            boolean isReversed = random.nextInt(100) < 25;
            DrawnCard drawn = DrawnCard.builder()
                    .session(session)
                    .card(card)
                    .positionIndex(i)
                    .positionNameEn("Position " + (i + 1))
                    .positionNameVi("Vị trí " + (i + 1))
                    .isReversed(isReversed)
                    .isClarifier(false)
                    .build();
            drawnCards.add(drawn);
        }
        drawnCardRepository.saveAll(drawnCards);
        if (session.getDrawnCards() == null) {
            session.setDrawnCards(new ArrayList<>());
        }
        session.getDrawnCards().clear();
        session.getDrawnCards().addAll(drawnCards);
        session.setStatus("DRAWING");
        session = sessionRepository.save(session);

        return toSessionDto(session);
    }

    @Transactional
    public ReadingSessionDto interpret(UUID sessionId, UUID userId) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        List<DrawnCard> drawnCards = session.getDrawnCards();
        if (drawnCards == null || drawnCards.isEmpty()) {
            // Auto draw if not drawn yet
            return interpret(drawCards(sessionId, userId).getId(), userId);
        }

        User user = session.getUser();
        String locale = user != null && user.getLocale() != null ? user.getLocale() : "vi";
        String synthesis = generateInitialSynthesis(session, drawnCards, locale);
        session.setAiSynthesisResult(synthesis);
        session.setStatus("COMPLETED");
        session = sessionRepository.save(session);

        return toSessionDto(session);
    }

    @Transactional
    public ReadingSessionDto performDailyDraw(UUID userId) {
        User user = getOrCreateEffectiveUser(userId);

        Instant past24Hours = Instant.now().minus(24, ChronoUnit.HOURS);
        List<ReadingSession> recentSessions = sessionRepository.findByUserIdAndCreatedAtAfter(user.getId(), past24Hours);
        boolean hasDailyDrawToday = recentSessions.stream()
                .anyMatch(s -> s.getSpread() != null && "S-01".equals(s.getSpread().getId()));

        if (hasDailyDrawToday) {
            log.info("User {} already completed their free daily draw today", user.getId());
        }

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
        if (savedSession.getDrawnCards() == null) {
            savedSession.setDrawnCards(new ArrayList<>());
        }
        savedSession.getDrawnCards().clear();
        savedSession.getDrawnCards().add(drawn);

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

        SessionMessage userMsg = SessionMessage.builder()
                .session(session)
                .role("USER")
                .content(request.getQuestion())
                .build();
        messageRepository.save(userMsg);

        String aiAnswer = null;
        if (geminiService != null && geminiService.isConfigured()) {
            aiAnswer = geminiService.generateFollowUpAnswer(session, request.getQuestion(), session.getUser() != null ? session.getUser().getLocale() : "vi");
        }
        if (aiAnswer == null || aiAnswer.isBlank()) {
            aiAnswer = "Dựa trên năng lượng của các lá bài đã xuất hiện và câu hỏi của bạn: '" + request.getQuestion()
                    + "', vũ trụ khuyên bạn hãy tập trung lắng nghe trực giác nội tâm và kiên định với mục tiêu dài hạn.";
        }

        SessionMessage aiMsg = SessionMessage.builder()
                .session(session)
                .role("AI_READER")
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
        UUID effectiveId = userId != null ? userId : DEFAULT_SEEKER_ID;
        return sessionRepository.findByUserIdOrderByCreatedAtDesc(effectiveId, pageable)
                .map(this::toSessionDto);
    }

    @Transactional(readOnly = true)
    public List<ReadingSessionDto> getAllUserSessionsList(UUID userId) {
        UUID effectiveId = userId != null ? userId : DEFAULT_SEEKER_ID;
        return sessionRepository.findAll().stream()
                .filter(s -> s.getUser() == null || effectiveId.equals(s.getUser().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::toSessionDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getJournalList(UUID userId) {
        UUID effectiveId = userId != null ? userId : DEFAULT_SEEKER_ID;
        return sessionRepository.findAll().stream()
                .filter(s -> s.getJournalEntry() != null && (s.getUser() == null || effectiveId.equals(s.getUser().getId())))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(s -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", "JN-" + s.getId().toString().substring(0, 8));
                    map.put("readingSessionId", s.getId().toString());
                    map.put("sessionCode", "SESSION-" + s.getId().toString().substring(0, 8));
                    map.put("title", "Ghi chép: " + (s.getUserQuestion() != null ? s.getUserQuestion() : "Trải bài Tarot"));
                    map.put("summary", s.getAiSynthesisResult() != null ? s.getAiSynthesisResult().substring(0, Math.min(120, s.getAiSynthesisResult().length())) : "Nghiệm lý trải bài");
                    map.put("userNotes", s.getJournalEntry().getReflectionNote());
                    map.put("tags", s.getJournalEntry().getMoodTagsJson() != null ? Arrays.asList(s.getJournalEntry().getMoodTagsJson().split(",")) : List.of("Reading"));
                    map.put("spreadNameEn", s.getSpread() != null ? s.getSpread().getNameEn() : "Tarot Spread");
                    map.put("spreadNameVi", s.getSpread() != null ? s.getSpread().getNameVi() : "Trải bài Tarot");
                    map.put("cardCount", s.getDrawnCards() != null ? s.getDrawnCards().size() : 3);
                    map.put("createdAt", s.getCreatedAt().toString());
                    return map;
                })
                .collect(Collectors.toList());
    }

    private String generateInitialSynthesis(ReadingSession session, List<DrawnCard> cards, String locale) {
        if (geminiService != null && geminiService.isConfigured()) {
            String geminiSynthesis = geminiService.generateTarotSynthesis(session, cards, locale);
            if (geminiSynthesis != null && !geminiSynthesis.isBlank()) {
                return geminiSynthesis;
            }
        }

        boolean isVi = locale == null || "vi".equalsIgnoreCase(locale);
        StringBuilder sb = new StringBuilder();

        if (isVi) {
            sb.append("### ✨ Phân tích Tổng quan Trải bài (")
              .append(session.getSpread() != null ? session.getSpread().getNameVi() : "Trải bài")
              .append(")\n\n");
            for (DrawnCard dc : cards) {
                String cardName = dc.getCard().getNameVi();
                String orientation = dc.getIsReversed() ? "(Ngược)" : "(Xuôi)";
                String position = dc.getPositionNameVi() != null ? dc.getPositionNameVi() : "Vị trí " + (dc.getPositionIndex() + 1);
                sb.append(String.format("1. **%s (%s %s)**:\n%s\n\n",
                        position, cardName, orientation,
                        dc.getIsReversed() ? dc.getCard().getKeywordsReversedVi() : dc.getCard().getKeywordsUprightVi()));
            }
            sb.append("**Lời khuyên đúc kết**: Năng lượng các lá bài nhắc nhở bạn giữ vững sự kiên định, mở rộng tầm nhìn và tự tin lắng nghe trực giác trong mọi quyết định.");
        } else {
            sb.append("### ✨ Reading Synthesis (")
              .append(session.getSpread() != null ? session.getSpread().getNameEn() : "Spread")
              .append(")\n\n");
            for (DrawnCard dc : cards) {
                String cardName = dc.getCard().getNameEn();
                String orientation = dc.getIsReversed() ? "(Reversed)" : "(Upright)";
                String position = dc.getPositionNameEn() != null ? dc.getPositionNameEn() : "Position " + (dc.getPositionIndex() + 1);
                sb.append(String.format("1. **%s (%s %s)**:\n%s\n\n",
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
