package com.aitarotreader.dtos;

import com.aitarotreader.entities.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MysticProfileDto {
    private UUID userId;
    private LocalDate birthDate;
    private String zodiacSign;
    private Integer lifePathNumber;
    private String preferredDeckId;
    private String preferredBackId;
    private Boolean allowAiContext;
    private String locale;
}
