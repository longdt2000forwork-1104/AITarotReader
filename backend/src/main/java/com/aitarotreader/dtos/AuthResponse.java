package com.aitarotreader.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String tokenType;
    private String accessToken;
    private String refreshToken;
    private Long expiresInSeconds;
    private Boolean requiresVerification;
    private UserDto user;
}
