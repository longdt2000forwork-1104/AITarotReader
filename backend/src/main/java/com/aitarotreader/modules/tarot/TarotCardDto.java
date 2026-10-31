package com.aitarotreader.modules.tarot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarotCardDto {
    private Integer id;
    private String code;
    private Arcana arcana;
    private Suit suit;
    private Integer number;
    private String nameEn;
    private String nameVi;
    private String element;
    private String keywordsUprightEn;
    private String keywordsUprightVi;
    private String keywordsReversedEn;
    private String keywordsReversedVi;
    private String summaryEn;
    private String summaryVi;
    private String imageUrl;
}
