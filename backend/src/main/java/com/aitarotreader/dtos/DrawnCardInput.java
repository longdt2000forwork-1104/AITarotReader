package com.aitarotreader.dtos;

import com.aitarotreader.entities.*;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawnCardInput {

    @NotNull(message = "Card ID is required")
    private Integer cardId;

    @NotNull(message = "Position index is required")
    private Integer positionIndex;

    private String positionNameEn;
    private String positionNameVi;

    @Builder.Default
    private Boolean isReversed = false;

    @Builder.Default
    private Boolean isClarifier = false;
}
