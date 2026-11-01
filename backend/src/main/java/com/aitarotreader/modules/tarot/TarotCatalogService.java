package com.aitarotreader.modules.tarot;

import com.aitarotreader.common.CustomException;
import com.aitarotreader.common.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TarotCatalogService {

    private final TarotCardRepository cardRepository;
    private final TarotDeckRepository deckRepository;
    private final SpreadTemplateRepository spreadRepository;

    @Transactional(readOnly = true)
    public List<TarotCardDto> getAllCards(String arcana, String suit) {
        List<TarotCard> cards;
        if (arcana != null && !arcana.isBlank()) {
            cards = cardRepository.findByArcana(Arcana.valueOf(arcana.toUpperCase()));
        } else if (suit != null && !suit.isBlank()) {
            cards = cardRepository.findBySuit(Suit.valueOf(suit.toUpperCase()));
        } else {
            cards = cardRepository.findAll();
        }

        return cards.stream().map(this::toCardDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TarotCardDto getCardById(Integer id) {
        TarotCard card = cardRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "Tarot card not found: " + id));
        return toCardDto(card);
    }

    @Transactional(readOnly = true)
    public List<TarotDeck> getActiveDecks() {
        return deckRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<SpreadTemplate> getAllSpreads() {
        return spreadRepository.findAll();
    }

    public TarotCardDto toCardDto(TarotCard card) {
        String imageUrl = "/decks/rider-waite-1909/cards/" + (card.getImageSlug() != null ? card.getImageSlug() : card.getCode() + ".webp");
        return TarotCardDto.builder()
                .id(card.getId())
                .code(card.getCode())
                .arcana(card.getArcana())
                .suit(card.getSuit())
                .number(card.getNumber())
                .nameEn(card.getNameEn())
                .nameVi(card.getNameVi())
                .element(card.getElement())
                .keywordsUprightEn(card.getKeywordsUprightEn())
                .keywordsUprightVi(card.getKeywordsUprightVi())
                .keywordsReversedEn(card.getKeywordsReversedEn())
                .keywordsReversedVi(card.getKeywordsReversedVi())
                .summaryEn(card.getSummaryEn())
                .summaryVi(card.getSummaryVi())
                .imageUrl(imageUrl)
                .build();
    }
}
