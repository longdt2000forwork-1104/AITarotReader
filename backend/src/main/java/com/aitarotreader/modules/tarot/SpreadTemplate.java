package com.aitarotreader.modules.tarot;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "spread_templates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpreadTemplate {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, unique = true, length = 100)
    private String code;

    @Column(name = "name_en", nullable = false)
    private String nameEn;

    @Column(name = "name_vi", nullable = false)
    private String nameVi;

    @Column(name = "card_count", nullable = false)
    private Integer cardCount;

    @Builder.Default
    @Column(name = "crystal_cost", nullable = false)
    private Integer crystalCost = 0;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "description_vi", columnDefinition = "TEXT")
    private String descriptionVi;

    @Column(name = "positions_json", nullable = false, columnDefinition = "TEXT")
    private String positionsJson;
}
