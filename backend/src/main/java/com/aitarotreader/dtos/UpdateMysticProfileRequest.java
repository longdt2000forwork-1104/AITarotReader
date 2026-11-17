package com.aitarotreader.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMysticProfileRequest {
    private LocalDate birthDate;
    private String zodiacSign;
    private Integer lifePathNumber;
    private String preferredDeckId;
    private String preferredBackId;
    private Boolean allowAiContext;
    private List<String> focusAreas;
    private String locale;
}
