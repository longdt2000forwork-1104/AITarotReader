package com.aitarotreader.modules.tarot;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tarot_decks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TarotDeck {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    @Column(nullable = false)
    private String artist;

    @Builder.Default
    @Column(name = "unlock_tier", nullable = false, length = 20)
    private String unlockTier = "FREE";

    @Builder.Default
    @Column(name = "credit_cost", nullable = false)
    private Integer creditCost = 0;

    @Builder.Default
    @Column(name = "card_count", nullable = false)
    private Integer cardCount = 78;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    private String descriptionVi;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
