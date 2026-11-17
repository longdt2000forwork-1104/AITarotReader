package com.aitarotreader.dtos;

import com.aitarotreader.entities.UserRole;
import com.aitarotreader.entities.UserTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String email;
    private String fullName;
    private String locale;
    private Integer crystalBalance;
    private UserTier tier;
    private UserRole role;
    private String avatarUrl;
    private Boolean emailVerified;
    private Boolean hasPassword;
    private Boolean hasGoogle;
    private Instant lastLoginAt;
}
