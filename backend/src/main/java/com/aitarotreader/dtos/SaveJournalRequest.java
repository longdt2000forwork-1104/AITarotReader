package com.aitarotreader.dtos;

import com.aitarotreader.entities.*;

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
    private String notes;
    private List<String> moodTags;
    private List<String> tags;

    public String getReflectionNote() {
        if (reflectionNote != null && !reflectionNote.isBlank()) return reflectionNote;
        return notes != null ? notes : "";
    }

    public List<String> getMoodTags() {
        if (moodTags != null && !moodTags.isEmpty()) return moodTags;
        return tags;
    }
}
