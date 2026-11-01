package com.aitarotreader.dtos;

import com.aitarotreader.entities.*;

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

    private InputMode inputMode;

    private String personaCode;
    private String persona;

    @Size(max = 1000, message = "User question must be under 1000 characters")
    private String userQuestion;
    private String question;

    private List<DrawnCardInput> cards;

    public InputMode getInputMode() {
        return inputMode != null ? inputMode : InputMode.VIRTUAL;
    }

    public String getPersonaCode() {
        if (personaCode != null && !personaCode.isBlank()) return personaCode;
        if (persona != null && !persona.isBlank()) return persona;
        return "MYSTIC_SAGE";
    }

    public String getUserQuestion() {
        if (userQuestion != null && !userQuestion.isBlank()) return userQuestion;
        if (question != null && !question.isBlank()) return question;
        return "General energetic guidance and spiritual clarity.";
    }
}
