# ED-02 batch generation instructions (shared by all illustrator subagents)

1. Read the style brief (v2, golden rule = faithful content, nothing added) AND the per-card content checklist h:\Projects\AITarotReader\docs\art\RWS_1909_composition_reference.md. Compositions MUST follow the checklist line for each card. Style brief: h:\Projects\AITarotReader\docs\art\ED-02_sunlit_botanical_style_brief.md
2. STYLE REFERENCES (approved pilots) — pass these as reference images on EVERY generation for RENDERING STYLE ONLY (never copy their content/objects) so the deck stays consistent (same border, corner flourishes, paper tone, line weight, palette):
   - C:\Users\Windows\.gemini\antigravity\brain\187329d6-225a-4cd9-aa5b-206f538a4839\00_the_fool_1793440124052.jpg
   - C:\Users\Windows\.gemini\antigravity\brain\187329d6-225a-4cd9-aa5b-206f538a4839\01_the_magician_1793440453298.jpg
   - C:\Users\Windows\.gemini\antigravity\brain\187329d6-225a-4cd9-aa5b-206f538a4839\rejected\51_two_of_swords_1793440467694.jpg
3. SIZE: every card must be the SAME portrait 9:16 aspect (approved pilots are 768x1376). Same border inset on every card.
4. Prompt template:
   "Tarot card illustration of [CARD NAME], matching the exact vintage copperplate botanical engraving art style, paper texture, and border design of the reference images. Composition: [copy the card's checklist line from RWS_1909_composition_reference.md verbatim]. Do not add any element not listed.. Style: Fine-line copperplate botanical engraving and archival herbarium print, warm sepia ink etching with cross-hatching and stipple shading on warm alabaster paper (#FAF9F6) with faint paper grain. Restrained hand-tinted watercolor washes of soft emerald green, muted terracotta, pale golden ochre, and dusty rose, with untinted cream paper background. Inset thin double-rule sepia border with matching botanical corner flourishes. Absolutely NO text, NO letters, NO numbers, NO Roman numerals anywhere."
5. Rules:
   - Use your knowledge of the RWS 1909 imagery; the correct NUMBER of wands/cups/swords/pentacles must be visible on pip cards.
   - Do NOT add elements not in the RWS original (e.g. no decorative sun in the corner unless the original has one).
   - Mature themes (Death, Devil, Tower, Three/Nine/Ten of Swords, Five of Pentacles) stay symbolic and tasteful: no gore, no blood, no nudity (draped figures for Lovers/Devil/Star/World).
   - Never render any text, letters, numbers, Hebrew/Latin inscriptions (Wheel of Fortune, High Priestess scroll, etc.) — replace with abstract engraved ornament.
6. File naming: save each image with the filename starting with the card code, e.g. `01_the_magician`, in your default output directory.
7. Inspect each result; regenerate once if it contains text/numbers, wrong symbol count, or a different border style.
8. Reply with a list: card code -> saved absolute path, plus any card you could not fix.
