package com.aitarotreader.modules.reading;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReadingSessionRequest {

    @NotNull(message = "Spread ID is required")
    private String spreadId;

    private String deckId;

    @NotNull(message = "Input mode (VIRTUAL or MANUAL) is required")
    private InputMode inputMode;

    private String personaCode;

    @Size(max = 1000, message = "User question must be under 1000 characters")
    private String userQuestion;

    @NotEmpty(message = "At least one card must be drawn or entered")
    private List<DrawnCardInput> cards;
}
