package com.aitarotreader.modules.reading;

import com.aitarotreader.modules.tarot.TarotCard;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "drawn_cards")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawnCard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private ReadingSession session;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "card_id", nullable = false)
    private TarotCard card;

    @Column(name = "position_index", nullable = false)
    private Integer positionIndex;

    @Column(name = "position_name_en")
    private String positionNameEn;

    @Column(name = "position_name_vi")
    private String positionNameVi;

    @Builder.Default
    @Column(name = "is_reversed", nullable = false)
    private Boolean isReversed = false;

    @Builder.Default
    @Column(name = "is_clarifier", nullable = false)
    private Boolean isClarifier = false;
}
