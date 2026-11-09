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
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadingSessionService {

    public static final UUID DEFAULT_SEEKER_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");
    public static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    public Instant getStartOfToday() {
        return LocalDate.now(VIETNAM_ZONE).atStartOfDay(VIETNAM_ZONE).toInstant();
    }

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
            autoEnsureJournalEntry(savedSession, drawnCards);
        }

        return toSessionDto(savedSession);
    }

    @Transactional
    public ReadingSessionDto drawCards(UUID sessionId, UUID userId) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        List<DrawnCard> existing = drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(sessionId);
        if (existing != null && !existing.isEmpty()) {
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

        String[] posVi3 = {"Hiện Trạng", "Hành Động", "Kết Quả"};
        String[] posEn3 = {"Situation", "Action", "Outcome"};

        List<DrawnCard> drawnCards = new ArrayList<>();
        Random random = new Random();
        for (int i = 0; i < selectedCards.size(); i++) {
            TarotCard card = selectedCards.get(i);
            boolean isReversed = random.nextInt(100) < 25;
            String posVi = (count == 3 && i < 3) ? posVi3[i] : ("Vị trí " + (i + 1));
            String posEn = (count == 3 && i < 3) ? posEn3[i] : ("Position " + (i + 1));
            DrawnCard drawn = DrawnCard.builder()
                    .session(session)
                    .card(card)
                    .positionIndex(i)
                    .positionNameEn(posEn)
                    .positionNameVi(posVi)
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
        session.setStatus("COMPLETED");
        session = sessionRepository.save(session);
        autoEnsureJournalEntry(session, drawnCards);

        return toSessionDto(session);
    }

    @Transactional
    public ReadingSessionDto interpret(UUID sessionId, UUID userId) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        List<DrawnCard> drawnCards = drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(sessionId);
        if (drawnCards == null || drawnCards.isEmpty()) {
            // Auto draw if not drawn yet
            drawCards(sessionId, userId);
            drawnCards = drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(sessionId);
        }

        User user = session.getUser();
        String locale = user != null && user.getLocale() != null ? user.getLocale() : "vi";
        String synthesis = generateInitialSynthesis(session, drawnCards, locale);
        session.setAiSynthesisResult(synthesis);
        session.setStatus("COMPLETED");
        session = sessionRepository.save(session);
        autoEnsureJournalEntry(session, drawnCards);

        return toSessionDto(session);
    }

    @Transactional(readOnly = true)
    public ReadingSessionDto getTodayDailyDraw(UUID userId) {
        UUID effectiveId = userId != null ? userId : DEFAULT_SEEKER_ID;
        Instant startOfToday = getStartOfToday();
        List<ReadingSession> todaySessions = sessionRepository.findByUserIdAndCreatedAtAfter(effectiveId, startOfToday);
        ReadingSession existingDaily = todaySessions.stream()
                .filter(s -> s.getSpread() != null && "S-01".equals(s.getSpread().getId()))
                .max(Comparator.comparing(ReadingSession::getCreatedAt))
                .orElse(null);

        if (existingDaily != null) {
            log.info("Found existing flipped daily card for today (since 00:00 {}) for user {}: {}", startOfToday, effectiveId, existingDaily.getId());
            return toSessionDto(existingDaily);
        }
        return null;
    }

    @Transactional
    public ReadingSessionDto performDailyDraw(UUID userId) {
        return performDailyDraw(userId, false);
    }

    @Transactional
    public ReadingSessionDto performDailyDraw(UUID userId, boolean force) {
        User user = getOrCreateEffectiveUser(userId);

        Instant startOfToday = getStartOfToday();
        if (!force) {
            List<ReadingSession> todaySessions = sessionRepository.findByUserIdAndCreatedAtAfter(user.getId(), startOfToday);
            ReadingSession existingDaily = todaySessions.stream()
                    .filter(s -> s.getSpread() != null && "S-01".equals(s.getSpread().getId()))
                    .max(Comparator.comparing(ReadingSession::getCreatedAt))
                    .orElse(null);

            if (existingDaily != null) {
                log.info("Returning existing daily draw for today (since 00:00 {}) for user {}: {}", startOfToday, user.getId(), existingDaily.getId());
                return toSessionDto(existingDaily);
            }
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
                .maxFollowUps(10)
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
        autoEnsureJournalEntry(savedSession, List.of(drawn));

        return toSessionDto(savedSession);
    }

    @Transactional
    public ReadingSessionDto askFollowUpQuestion(UUID sessionId, UUID userId, FollowUpChatRequest request) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        if (session.getMaxFollowUps() == null || session.getMaxFollowUps() < 10) {
            session.setMaxFollowUps(10);
        }

        if (session.getFollowUpCount() >= session.getMaxFollowUps()) {
            throw new CustomException(ErrorCode.FOLLOW_UP_LIMIT_REACHED);
        }

        SessionMessage userMsg = SessionMessage.builder()
                .session(session)
                .role("USER")
                .content(request.getQuestion())
                .build();
        userMsg = messageRepository.save(userMsg);

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
        aiMsg = messageRepository.save(aiMsg);

        if (session.getMessages() == null) {
            session.setMessages(new ArrayList<>());
        }
        session.getMessages().add(userMsg);
        session.getMessages().add(aiMsg);

        session.setFollowUpCount(session.getFollowUpCount() + 1);
        session = sessionRepository.save(session);

        return toSessionDto(session);
    }

    private static final int MAX_TOTAL_CARDS = 10;

    @Transactional
    public ReadingSessionDto drawClarifierCard(UUID sessionId, UUID userId) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));

        ensureChronologicalClarifiers(session);

        List<DrawnCard> existingDrawn = drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(sessionId);
        if (existingDrawn.size() >= MAX_TOTAL_CARDS) {
            throw new CustomException(ErrorCode.BAD_REQUEST, "Phiên trải bài đã đạt giới hạn tối đa 10 lá bài (tính cả lá khởi đầu).");
        }

        Set<Integer> usedIds = existingDrawn.stream()
                .filter(dc -> dc.getCard() != null)
                .map(dc -> dc.getCard().getId())
                .collect(Collectors.toSet());

        List<TarotCard> allCards = cardRepository.findAll();
        List<TarotCard> availableCards = allCards.stream()
                .filter(c -> !usedIds.contains(c.getId()))
                .collect(Collectors.toList());
        if (availableCards.isEmpty()) {
            availableCards = allCards;
        }

        Random random = new Random();
        TarotCard clarifierCard = availableCards.get(random.nextInt(availableCards.size()));
        boolean isReversed = random.nextInt(100) < 30;
        int nextIndex = existingDrawn.stream()
                .mapToInt(dc -> dc.getPositionIndex() != null ? dc.getPositionIndex() : 0)
                .max()
                .orElse(-1) + 1;

        DrawnCard drawn = DrawnCard.builder()
                .session(session)
                .card(clarifierCard)
                .positionIndex(nextIndex)
                .positionNameEn("Clarifier Insight")
                .positionNameVi("Lá Làm Rõ (Clarifier)")
                .isReversed(isReversed)
                .isClarifier(true)
                .build();
        drawn = drawnCardRepository.save(drawn);

        if (session.getDrawnCards() == null) {
            session.setDrawnCards(new ArrayList<>());
        }
        session.getDrawnCards().add(drawn);

        String locale = (session.getUser() != null && session.getUser().getLocale() != null)
                ? session.getUser().getLocale()
                : "vi";
        boolean isVi = !"en".equalsIgnoreCase(locale);
        String cardName = isVi ? clarifierCard.getNameVi() : clarifierCard.getNameEn();
        String orientLabel = isReversed ? (isVi ? "Ngược" : "Reversed") : (isVi ? "Xuôi" : "Upright");
        String keywords = isReversed
                ? (isVi ? clarifierCard.getKeywordsReversedVi() : clarifierCard.getKeywordsReversedEn())
                : (isVi ? clarifierCard.getKeywordsUprightVi() : clarifierCard.getKeywordsUprightEn());
        String summary = isVi ? clarifierCard.getSummaryVi() : clarifierCard.getSummaryEn();

        String userPrompt = isVi
                ? "Tôi vừa rút thêm lá bài làm rõ (Clarifier): " + cardName + " (" + orientLabel + "). Hãy giải nghĩa sâu lá bài này trong tổng thể trải bài."
                : "I just drew a Clarifier card: " + cardName + " (" + orientLabel + "). Please interpret how this clarifies the reading.";

        SessionMessage userMsg = SessionMessage.builder()
                .session(session)
                .role("USER")
                .content(userPrompt)
                .build();
        messageRepository.save(userMsg);

        String aiAnswer = null;
        if (geminiService != null && geminiService.isConfigured()) {
            aiAnswer = geminiService.generateFollowUpAnswer(session, userPrompt, locale);
        }
        if (aiAnswer == null || aiAnswer.isBlank()) {
            aiAnswer = isVi
                    ? "✦ **Giải mã Lá Làm Rõ — " + cardName + " (" + orientLabel + "):**\n"
                    + (summary != null ? summary + "\n" : "")
                    + "Từ khóa trọng tâm: *" + (keywords != null ? keywords : "") + "*. "
                    + "Sự xuất hiện của lá bài này bổ sung góc nhìn sâu sắc cho trải bài hiện tại, nhắc nhở bạn kết nối trực giác với hành động thực tế."
                    : "✦ **Clarifier Interpretation — " + cardName + " (" + orientLabel + "):**\n"
                    + (summary != null ? summary + "\n" : "")
                    + "Core keywords: *" + (keywords != null ? keywords : "") + "*.";
        }

        SessionMessage aiMsg = SessionMessage.builder()
                .session(session)
                .role("AI_READER")
                .content(aiAnswer)
                .build();
        messageRepository.save(aiMsg);
        autoEnsureJournalEntry(session, session.getDrawnCards());

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

    @Transactional
    public void ensureChronologicalClarifiers(ReadingSession session) {
        if (session == null || session.getId() == null) return;
        List<DrawnCard> existing = drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(session.getId());
        List<SessionMessage> msgs = messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        if (msgs.isEmpty()) return;

        List<TarotCard> allCards = cardRepository.findAll();
        List<DrawnCard> baseCards = existing.stream()
                .filter(dc -> !Boolean.TRUE.equals(dc.getIsClarifier()))
                .collect(Collectors.toList());
        List<DrawnCard> clarifierCards = new ArrayList<>(existing.stream()
                .filter(dc -> Boolean.TRUE.equals(dc.getIsClarifier()))
                .collect(Collectors.toList()));

        Set<Integer> existingCardIds = existing.stream()
                .filter(dc -> dc.getCard() != null)
                .map(dc -> dc.getCard().getId())
                .collect(Collectors.toSet());

        List<Integer> chronologicalClarifierCardIds = new ArrayList<>();
        boolean dirty = false;

        for (SessionMessage m : msgs) {
            String content = m.getContent() != null ? m.getContent() : "";
            String lower = content.toLowerCase();
            boolean isClarifierTurn = lower.contains("vừa rút thêm lá bài làm rõ")
                    || lower.contains("just drew a clarifier")
                    || lower.contains("lá bài bổ sung (clarifier)");
            if (!isClarifierTurn) continue;

            for (TarotCard tc : allCards) {
                String vi = tc.getNameVi() != null ? tc.getNameVi().toLowerCase() : "";
                String en = tc.getNameEn() != null ? tc.getNameEn().toLowerCase() : "";
                if ((!vi.isEmpty() && lower.contains(vi)) || (!en.isEmpty() && lower.contains(en))) {
                    // Skip if it's one of the base cards
                    boolean isBase = baseCards.stream()
                            .anyMatch(bc -> bc.getCard() != null && bc.getCard().getId().equals(tc.getId()));
                    if (isBase) continue;

                    if (!chronologicalClarifierCardIds.contains(tc.getId())) {
                        chronologicalClarifierCardIds.add(tc.getId());
                    }
                    if (!existingCardIds.contains(tc.getId()) && (baseCards.size() + clarifierCards.size()) < MAX_TOTAL_CARDS) {
                        boolean isRev = lower.contains("ngược") || lower.contains("reversed");
                        DrawnCard added = DrawnCard.builder()
                                .session(session)
                                .card(tc)
                                .positionIndex(baseCards.size() + clarifierCards.size())
                                .positionNameEn("Clarifier Insight")
                                .positionNameVi("Lá Làm Rõ (Clarifier)")
                                .isReversed(isRev)
                                .isClarifier(true)
                                .build();
                        added = drawnCardRepository.save(added);
                        clarifierCards.add(added);
                        existingCardIds.add(tc.getId());
                        dirty = true;
                    }
                }
            }
        }

        // Sort clarifierCards according to chronologicalClarifierCardIds order, keeping any others at the end
        if (!chronologicalClarifierCardIds.isEmpty() && clarifierCards.size() > 1) {
            clarifierCards.sort((a, b) -> {
                int idA = a.getCard() != null ? a.getCard().getId() : -1;
                int idB = b.getCard() != null ? b.getCard().getId() : -1;
                int idxA = chronologicalClarifierCardIds.indexOf(idA);
                int idxB = chronologicalClarifierCardIds.indexOf(idB);
                if (idxA == -1) idxA = 999 + (a.getPositionIndex() != null ? a.getPositionIndex() : 0);
                if (idxB == -1) idxB = 999 + (b.getPositionIndex() != null ? b.getPositionIndex() : 0);
                return Integer.compare(idxA, idxB);
            });

            int pos = baseCards.size();
            for (DrawnCard dc : clarifierCards) {
                if (dc.getPositionIndex() == null || dc.getPositionIndex() != pos) {
                    dc.setPositionIndex(pos);
                    drawnCardRepository.save(dc);
                    dirty = true;
                }
                pos++;
            }
        }
    }

    @Transactional
    public ReadingSessionDto getSessionById(UUID sessionId) {
        ReadingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Session not found"));
        ensureChronologicalClarifiers(session);
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
        List<ReadingSession> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getUser() == null || effectiveId.equals(s.getUser().getId()) || DEFAULT_SEEKER_ID.equals(s.getUser().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        Map<UUID, List<DrawnCard>> cardsBySession = drawnCardRepository.findAll().stream()
                .filter(dc -> dc.getSession() != null && dc.getSession().getId() != null)
                .sorted(Comparator.comparingInt(dc -> dc.getPositionIndex() != null ? dc.getPositionIndex() : 0))
                .collect(Collectors.groupingBy(dc -> dc.getSession().getId()));

        Map<UUID, List<SessionMessage>> msgsBySession = messageRepository.findAll().stream()
                .filter(m -> m.getSession() != null && m.getSession().getId() != null)
                .sorted(Comparator.comparing(m -> m.getCreatedAt() != null ? m.getCreatedAt() : Instant.EPOCH))
                .collect(Collectors.groupingBy(m -> m.getSession().getId()));

        return sessions.stream()
                .filter(s -> !cardsBySession.getOrDefault(s.getId(), Collections.emptyList()).isEmpty())
                .map(s -> toSessionDtoWithPreloaded(
                        s,
                        cardsBySession.getOrDefault(s.getId(), Collections.emptyList()),
                        msgsBySession.getOrDefault(s.getId(), Collections.emptyList())
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    public void autoEnsureJournalEntry(ReadingSession session, List<DrawnCard> cards) {
        if (session == null || session.getId() == null) return;
        List<DrawnCard> actualCards = (cards != null && !cards.isEmpty())
                ? cards
                : drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(session.getId());
        if (actualCards.isEmpty()) return;

        List<String> cardTags = actualCards.stream()
                .filter(dc -> dc.getCard() != null && dc.getCard().getNameVi() != null)
                .map(dc -> dc.getCard().getNameVi())
                .limit(5)
                .collect(Collectors.toList());
        if (cardTags.isEmpty()) {
            cardTags.add("Trải Bài Tarot");
        }

        JournalEntry journal = journalRepository.findById(session.getId()).orElse(null);
        if (journal == null) {
            String defaultNote = session.getAiSynthesisResult() != null && !session.getAiSynthesisResult().isBlank()
                    ? session.getAiSynthesisResult()
                    : "Phiên trải bài đã được tự động lưu vào Nhật Ký.";
            journal = JournalEntry.builder()
                    .session(session)
                    .reflectionNote(defaultNote)
                    .moodTagsJson(String.join(",", cardTags))
                    .build();
            journal = journalRepository.save(journal);
            session.setJournalEntry(journal);
        } else if (journal.getMoodTagsJson() == null || journal.getMoodTagsJson().isBlank()) {
            journal.setMoodTagsJson(String.join(",", cardTags));
            journal = journalRepository.save(journal);
            session.setJournalEntry(journal);
        }
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getJournalList(UUID userId) {
        UUID effectiveId = userId != null ? userId : DEFAULT_SEEKER_ID;
        List<ReadingSession> sessions = sessionRepository.findAll().stream()
                .filter(s -> s.getUser() == null || effectiveId.equals(s.getUser().getId()) || DEFAULT_SEEKER_ID.equals(s.getUser().getId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        Map<UUID, List<DrawnCard>> cardsBySession = drawnCardRepository.findAll().stream()
                .filter(dc -> dc.getSession() != null && dc.getSession().getId() != null)
                .sorted(Comparator.comparingInt(dc -> dc.getPositionIndex() != null ? dc.getPositionIndex() : 0))
                .collect(Collectors.groupingBy(dc -> dc.getSession().getId()));

        Map<UUID, JournalEntry> journalsBySession = journalRepository.findAll().stream()
                .filter(j -> j.getSessionId() != null)
                .collect(Collectors.toMap(JournalEntry::getSessionId, j -> j, (a, b) -> a));

        return sessions.stream()
                .map(s -> {
                    List<DrawnCard> sessionCards = cardsBySession.getOrDefault(s.getId(), Collections.emptyList());
                    JournalEntry je = journalsBySession.getOrDefault(s.getId(), s.getJournalEntry());
                    if (sessionCards.isEmpty() && je == null) {
                        return null;
                    }

                    List<String> cardNamesVi = sessionCards.stream()
                            .filter(dc -> dc.getCard() != null && dc.getCard().getNameVi() != null)
                            .map(dc -> dc.getCard().getNameVi())
                            .collect(Collectors.toList());

                    String rawQuestion = s.getUserQuestion();
                    String displayTitle;
                    if (rawQuestion == null || rawQuestion.isBlank() || "Daily Energetic Guidance & Reflection".equalsIgnoreCase(rawQuestion)) {
                        String spreadLabel = s.getSpread() != null && s.getSpread().getNameVi() != null
                                ? s.getSpread().getNameVi()
                                : "Trải Bài Hàng Ngày";
                        displayTitle = spreadLabel + (!cardNamesVi.isEmpty() ? " · " + String.join(", ", cardNamesVi.subList(0, Math.min(3, cardNamesVi.size()))) : "");
                    } else {
                        displayTitle = rawQuestion;
                    }

                    String cleanSummary = s.getAiSynthesisResult() != null
                            ? s.getAiSynthesisResult().replaceAll("[#*✦]+", "").trim()
                            : "Nghiệm lý trải bài Tarot";
                    if (cleanSummary.length() > 160) {
                        cleanSummary = cleanSummary.substring(0, 160) + "...";
                    }

                    List<String> tags = !cardNamesVi.isEmpty()
                            ? cardNamesVi
                            : (je != null && je.getMoodTagsJson() != null && !je.getMoodTagsJson().isBlank()
                                    ? Arrays.asList(je.getMoodTagsJson().split(","))
                                    : List.of("Trải Bài Tarot"));

                    String notes = (je != null && je.getReflectionNote() != null && !je.getReflectionNote().isBlank())
                            ? je.getReflectionNote()
                            : (s.getAiSynthesisResult() != null ? s.getAiSynthesisResult() : "");

                    Map<String, Object> map = new HashMap<>();
                    map.put("id", "JN-" + s.getId().toString().substring(0, 8));
                    map.put("readingSessionId", s.getId().toString());
                    map.put("sessionCode", "SESSION-" + s.getId().toString().substring(0, 8).toUpperCase());
                    map.put("title", displayTitle);
                    map.put("summary", cleanSummary);
                    map.put("userNotes", notes);
                    map.put("tags", tags);
                    map.put("spreadNameEn", s.getSpread() != null ? s.getSpread().getNameEn() : "Tarot Spread");
                    map.put("spreadNameVi", s.getSpread() != null ? s.getSpread().getNameVi() : "Trải bài Tarot");
                    map.put("cardCount", !sessionCards.isEmpty() ? sessionCards.size() : 1);
                    map.put("createdAt", s.getCreatedAt().toString());
                    return map;
                })
                .filter(Objects::nonNull)
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
        List<DrawnCard> drawnCards = (session.getId() != null)
                ? drawnCardRepository.findBySessionIdOrderByPositionIndexAsc(session.getId())
                : (session.getDrawnCards() != null ? session.getDrawnCards() : Collections.emptyList());
        List<SessionMessage> messages = (session.getId() != null)
                ? messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId())
                : (session.getMessages() != null ? session.getMessages() : Collections.emptyList());
        return toSessionDtoWithPreloaded(session, drawnCards, messages);
    }

    public ReadingSessionDto toSessionDtoWithPreloaded(
            ReadingSession session,
            List<DrawnCard> drawnCards,
            List<SessionMessage> messages
    ) {

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
