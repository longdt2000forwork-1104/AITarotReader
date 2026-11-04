package com.aitarotreader.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("supabase")
class DailyDrawControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testDailyDrawEndpointReturnsSuccessWithSeededCatalog() throws Exception {
        mockMvc.perform(post("/api/v1/readings/daily")
                        .param("locale", "vi")
                        .param("force", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.drawnCards").isArray())
                .andExpect(jsonPath("$.data.drawnCards[0].card.nameVi").exists());
    }
}
