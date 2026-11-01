package com.aitarotreader.dtos;

import com.aitarotreader.entities.*;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
