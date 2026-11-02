package com.aitarotreader.entities;




import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "reading_sessions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "spread_id")
    private SpreadTemplate spread;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id")
    private TarotDeck deck;

    @Enumerated(EnumType.STRING)
    @Column(name = "input_mode", nullable = false, length = 20)
    private InputMode inputMode;

    @Builder.Default
    @Column(name = "persona_code", nullable = false, length = 50)
    private String personaCode = "MYSTIC_SAGE";

    @Column(name = "user_question", length = 1000)
    private String userQuestion;

    @Column(name = "ai_synthesis_result", columnDefinition = "TEXT")
    private String aiSynthesisResult;

    @Builder.Default
    @Column(name = "follow_up_count", nullable = false)
    private Integer followUpCount = 0;

    @Builder.Default
    @Column(name = "max_follow_ups", nullable = false)
    private Integer maxFollowUps = 2;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "COMPLETED";

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DrawnCard> drawnCards = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SessionMessage> messages = new ArrayList<>();

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private JournalEntry journalEntry;
}
