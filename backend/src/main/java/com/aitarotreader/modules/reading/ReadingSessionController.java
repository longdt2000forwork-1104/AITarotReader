package com.aitarotreader.modules.reading;

import com.aitarotreader.common.ApiResponse;
import com.aitarotreader.common.CustomException;
import com.aitarotreader.common.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Reading Sessions", description = "Virtual and manual Tarot reading sessions, daily draw, AI synthesis, and follow-up dialogue")
@RestController
@RequestMapping("/api/v1/readings")
@RequiredArgsConstructor
public class ReadingSessionController {

    private final ReadingSessionService readingSessionService;

    @Operation(summary = "Create a new reading session (Virtual Shuffle or Manual Entry)")
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<ReadingSessionDto>> createSession(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateReadingSessionRequest request) {
        ReadingSessionDto session = readingSessionService.createSession(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Reading session created", session));
    }

    @Operation(summary = "Perform Daily Card Draw (1 free per 24 hours)")
    @PostMapping("/daily")
    public ResponseEntity<ApiResponse<ReadingSessionDto>> performDailyDraw(@AuthenticationPrincipal UUID userId) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, "Login required to perform and track daily draw");
        }
        ReadingSessionDto session = readingSessionService.performDailyDraw(userId);
        return ResponseEntity.ok(ApiResponse.ok("Daily draw completed", session));
    }

    @Operation(summary = "Get user reading session history (Journal archive)")
    @GetMapping("/sessions")
    public ResponseEntity<ApiResponse<Page<ReadingSessionDto>>> getUserSessions(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        Page<ReadingSessionDto> sessions = readingSessionService.getUserSessions(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(sessions));
    }

    @Operation(summary = "Get reading session details by id")
    @GetMapping("/sessions/{id}")
    public ResponseEntity<ApiResponse<ReadingSessionDto>> getSessionById(@PathVariable UUID id) {
        ReadingSessionDto session = readingSessionService.getSessionById(id);
        return ResponseEntity.ok(ApiResponse.ok(session));
    }

    @Operation(summary = "Ask a follow-up question to the AI Reader persona (up to 2 per session)")
    @PostMapping("/sessions/{id}/chat")
    public ResponseEntity<ApiResponse<ReadingSessionDto>> askFollowUpQuestion(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody FollowUpChatRequest request) {
        ReadingSessionDto session = readingSessionService.askFollowUpQuestion(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Follow-up response generated", session));
    }

    @Operation(summary = "Save or update seeker journal reflection notes and mood tags")
    @PutMapping("/sessions/{id}/journal")
    public ResponseEntity<ApiResponse<ReadingSessionDto>> saveJournal(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId,
            @RequestBody SaveJournalRequest request) {
        ReadingSessionDto session = readingSessionService.saveJournal(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Journal updated successfully", session));
    }

    @Operation(summary = "Generate shareable card metadata and social preview links")
    @PostMapping("/sessions/{id}/share-card")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getShareCardMetadata(@PathVariable UUID id) {
        ReadingSessionDto session = readingSessionService.getSessionById(id);
        Map<String, Object> shareData = Map.of(
                "sessionId", session.getId(),
                "spreadName", session.getSpreadNameVi() != null ? session.getSpreadNameVi() : "Trải bài Tarot",
                "cardCount", session.getDrawnCards() != null ? session.getDrawnCards().size() : 0,
                "shareUrl", "https://aitarotreader.com/app/readings/" + session.getId() + "/share",
                "previewImageUrl", session.getDrawnCards() != null && !session.getDrawnCards().isEmpty()
                        ? session.getDrawnCards().get(0).getCard().getImageUrl() : "/assets/decks/rider-waite-1909/cards/00_the_fool.webp"
        );
        return ResponseEntity.ok(ApiResponse.ok("Share card metadata generated", shareData));
    }
}
