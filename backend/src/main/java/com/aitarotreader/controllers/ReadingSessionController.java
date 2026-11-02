package com.aitarotreader.controllers;

import com.aitarotreader.entities.*;
import com.aitarotreader.dtos.*;
import com.aitarotreader.services.*;
import com.aitarotreader.repositories.*;
import com.aitarotreader.utils.*;
import com.aitarotreader.exceptions.*;

import com.aitarotreader.utils.ApiResponse;
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

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Reading Sessions", description = "Virtual and manual Tarot reading sessions, daily draw, AI synthesis, and follow-up dialogue")
@RestController
@RequestMapping("/api/v1/readings")
@RequiredArgsConstructor
public class ReadingSessionController {

    private final ReadingSessionService readingSessionService;

    @Operation(summary = "Create a new reading session (Virtual Shuffle or Manual Entry)")
    @PostMapping({"/sessions", ""})
    public ResponseEntity<ApiResponse<ReadingSessionDto>> createSession(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateReadingSessionRequest request) {
        ReadingSessionDto session = readingSessionService.createSession(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Reading session created", session));
    }

    @Operation(summary = "Draw cards for a created reading session")
    @PostMapping({"/sessions/{id}/draw", "/{id}/draw"})
    public ResponseEntity<ApiResponse<ReadingSessionDto>> drawCards(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        ReadingSessionDto session = readingSessionService.drawCards(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Cards drawn", session));
    }

    @Operation(summary = "Generate AI interpretation for drawn session")
    @PostMapping({"/sessions/{id}/interpret", "/{id}/interpret"})
    public ResponseEntity<ApiResponse<ReadingSessionDto>> interpret(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId) {
        ReadingSessionDto session = readingSessionService.interpret(id, userId);
        return ResponseEntity.ok(ApiResponse.ok("Interpretation generated", session));
    }

    @Operation(summary = "Perform Daily Card Draw (1 free per 24 hours)")
    @PostMapping("/daily")
    public ResponseEntity<ApiResponse<ReadingSessionDto>> performDailyDraw(@AuthenticationPrincipal UUID userId) {
        ReadingSessionDto session = readingSessionService.performDailyDraw(userId);
        return ResponseEntity.ok(ApiResponse.ok("Daily draw completed", session));
    }

    @Operation(summary = "Get user reading session history (Journal archive)")
    @GetMapping({"/sessions", "/history"})
    public ResponseEntity<ApiResponse<List<ReadingSessionDto>>> getUserSessions(
            @AuthenticationPrincipal UUID userId) {
        List<ReadingSessionDto> sessions = readingSessionService.getAllUserSessionsList(userId);
        return ResponseEntity.ok(ApiResponse.ok(sessions));
    }

    @Operation(summary = "Get user reading session history (Paginated)")
    @GetMapping("/sessions/paged")
    public ResponseEntity<ApiResponse<Page<ReadingSessionDto>>> getUserSessionsPaged(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReadingSessionDto> sessions = readingSessionService.getUserSessions(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(sessions));
    }

    @Operation(summary = "Get reading session details by id")
    @GetMapping({"/sessions/{id}", "/{id}"})
    public ResponseEntity<ApiResponse<ReadingSessionDto>> getSessionById(@PathVariable UUID id) {
        ReadingSessionDto session = readingSessionService.getSessionById(id);
        return ResponseEntity.ok(ApiResponse.ok(session));
    }

    @Operation(summary = "Ask a follow-up question to the AI Reader persona (up to 2 per session)")
    @PostMapping({"/sessions/{id}/chat", "/{id}/chat"})
    public ResponseEntity<ApiResponse<ReadingSessionDto>> askFollowUpQuestion(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody FollowUpChatRequest request) {
        ReadingSessionDto session = readingSessionService.askFollowUpQuestion(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Follow-up response generated", session));
    }

    @Operation(summary = "Save or update seeker journal reflection notes and mood tags")
    @RequestMapping(value = {"/sessions/{id}/journal", "/{id}/journal"}, method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<ApiResponse<ReadingSessionDto>> saveJournal(
            @PathVariable UUID id,
            @AuthenticationPrincipal UUID userId,
            @RequestBody SaveJournalRequest request) {
        ReadingSessionDto session = readingSessionService.saveJournal(id, userId, request);
        return ResponseEntity.ok(ApiResponse.ok("Journal updated successfully", session));
    }

    @Operation(summary = "Get seeker journal reflection archive")
    @GetMapping({"/journal", "/sessions/journal"})
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getJournal(
            @AuthenticationPrincipal UUID userId) {
        List<Map<String, Object>> entries = readingSessionService.getJournalList(userId);
        return ResponseEntity.ok(ApiResponse.ok(entries));
    }

    @Operation(summary = "Generate shareable card metadata and social preview links")
    @PostMapping({"/sessions/{id}/share-card", "/{id}/share-card"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getShareCardMetadata(@PathVariable UUID id) {
        ReadingSessionDto session = readingSessionService.getSessionById(id);
        Map<String, Object> shareData = Map.of(
                "sessionId", session.getId(),
                "spreadName", session.getSpreadNameVi() != null ? session.getSpreadNameVi() : "Trải bài Tarot",
                "cardCount", session.getDrawnCards() != null ? session.getDrawnCards().size() : 0,
                "shareUrl", "https://aitarotreader.com/app/readings/" + session.getId() + "/share",
                "previewImageUrl", session.getDrawnCards() != null && !session.getDrawnCards().isEmpty()
                        ? session.getDrawnCards().get(0).getCard().getImageUrl() : "/decks/rider-waite-1909/cards/00_the_fool.webp"
        );
        return ResponseEntity.ok(ApiResponse.ok("Share card metadata generated", shareData));
    }
}
