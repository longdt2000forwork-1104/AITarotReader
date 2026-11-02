package com.aitarotreader.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "mystic_profiles")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MysticProfile {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "zodiac_sign", length = 50)
    private String zodiacSign;

    @Column(name = "life_path_number")
    private Integer lifePathNumber;

    @Builder.Default
    @Column(name = "preferred_deck_id", nullable = false, length = 50)
    private String preferredDeckId = "ED-01";

    @Builder.Default
    @Column(name = "preferred_back_id", nullable = false, length = 50)
    private String preferredBackId = "classic-navy";

    @Builder.Default
    @Column(name = "allow_ai_context", nullable = false)
    private Boolean allowAiContext = true;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
