package com.aitarotreader.modules.tarot;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tarot_cards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarotCard {

    @Id
    private Integer id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Arcana arcana;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Suit suit;

    @Column(nullable = false)
    private Integer number;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    @Column(length = 50)
    private String element;

    @Column(name = "keywords_upright_en", columnDefinition = "TEXT")
    private String keywordsUprightEn;

    @Column(name = "keywords_upright_vi", columnDefinition = "TEXT")
    private String keywordsUprightVi;

    @Column(name = "keywords_reversed_en", columnDefinition = "TEXT")
    private String keywordsReversedEn;

    @Column(name = "keywords_reversed_vi", columnDefinition = "TEXT")
    private String keywordsReversedVi;

    @Column(name = "summary_en", columnDefinition = "TEXT")
    private String summaryEn;

    @Column(name = "summary_vi", columnDefinition = "TEXT")
    private String summaryVi;

    @Column(name = "image_slug", length = 100)
    private String imageSlug;
}
