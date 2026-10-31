package com.aitarotreader.modules.reading;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveJournalRequest {
    private String reflectionNote;
    private List<String> moodTags;
}
