package com.aitarotreader.modules.reading;

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
public class FollowUpChatRequest {

    @NotBlank(message = "Question message is required")
    @Size(max = 500, message = "Follow-up question must be under 500 characters")
    private String question;
}
