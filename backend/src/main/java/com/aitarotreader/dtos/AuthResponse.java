package com.aitarotreader.dtos;

import com.aitarotreader.entities.*;

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
    private UserDto user;
}
