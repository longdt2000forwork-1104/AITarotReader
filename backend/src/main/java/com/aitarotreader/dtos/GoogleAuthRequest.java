package com.aitarotreader.dtos;

import com.aitarotreader.entities.*;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    @NotBlank(message = "Id token or credential is required")
    private String idToken;

    private String email;

    private String name;

    private String picture;
}
