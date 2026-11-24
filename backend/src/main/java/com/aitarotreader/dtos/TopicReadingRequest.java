package com.aitarotreader.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopicReadingRequest {

    @NotBlank(message = "Topic is required")
    private String topic; // LOVE, FAMILY, CAREER

    @NotBlank(message = "Question is required")
    @Size(max = 1000, message = "Question must be under 1000 characters")
    private String question;

    private String locale;
}
