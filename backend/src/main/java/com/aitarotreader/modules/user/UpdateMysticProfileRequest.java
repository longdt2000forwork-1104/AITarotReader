package com.aitarotreader.modules.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

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
    private String locale;
}
