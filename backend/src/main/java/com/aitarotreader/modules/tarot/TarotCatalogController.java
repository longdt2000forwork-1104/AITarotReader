package com.aitarotreader.modules.tarot;

import com.aitarotreader.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Tarot Catalog", description = "Canonical 78-card Tarot catalog, deck editions, and spread layouts")
@RestController
@RequestMapping("/api/v1/tarot")
@RequiredArgsConstructor
public class TarotCatalogController {

    private final TarotCatalogService catalogService;

    @Operation(summary = "Get bilingual Tarot cards with optional arcana or suit filter")
    @GetMapping("/cards")
    public ResponseEntity<ApiResponse<List<TarotCardDto>>> getCards(
            @RequestParam(required = false) String arcana,
            @RequestParam(required = false) String suit) {
        List<TarotCardDto> cards = catalogService.getAllCards(arcana, suit);
        return ResponseEntity.ok(ApiResponse.ok(cards));
    }

    @Operation(summary = "Get specific Tarot card details by id")
    @GetMapping("/cards/{id}")
    public ResponseEntity<ApiResponse<TarotCardDto>> getCardById(@PathVariable Integer id) {
        TarotCardDto card = catalogService.getCardById(id);
        return ResponseEntity.ok(ApiResponse.ok(card));
    }

    @Operation(summary = "List curated Tarot deck editions")
    @GetMapping("/decks")
    public ResponseEntity<ApiResponse<List<TarotDeck>>> getDecks() {
        List<TarotDeck> decks = catalogService.getActiveDecks();
        return ResponseEntity.ok(ApiResponse.ok(decks));
    }

    @Operation(summary = "List available spread layout templates and Crystal costs")
    @GetMapping("/spreads")
    public ResponseEntity<ApiResponse<List<SpreadTemplate>>> getSpreads() {
        List<SpreadTemplate> spreads = catalogService.getAllSpreads();
        return ResponseEntity.ok(ApiResponse.ok(spreads));
    }
}
