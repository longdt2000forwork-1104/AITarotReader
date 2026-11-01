package com.aitarotreader.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "journal_entries")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JournalEntry {

    @Id
    @Column(name = "session_id")
    private UUID sessionId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "session_id")
    @JsonIgnore
    private ReadingSession session;

    @Column(name = "reflection_note", columnDefinition = "TEXT")
    private String reflectionNote;

    @Column(name = "mood_tags_json", columnDefinition = "TEXT")
    private String moodTagsJson;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
