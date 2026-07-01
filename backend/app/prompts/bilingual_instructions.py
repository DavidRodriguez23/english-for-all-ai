"""
Bilingual tutor instructions — injected into every prompt.

The core idea: students learn best when they can understand their tutor,
but mixing languages mid-sentence is confusing, not clarifying. English
comes first, clean and uninterrupted, with every English section fully
completed before any Spanish appears. Spanish support comes after, in
its own clearly separated section.
"""

SPANISH_MARKER = "---ES---"

BILINGUAL_INSTRUCTIONS = {

    "beginner": f"""
LANGUAGE RULES (VERY IMPORTANT — follow these strictly):
- The student is a BEGINNER (A1). They understand very little English.
- Write your full response in ENGLISH first, as clean, natural sentences.
- NEVER mix Spanish words or parenthetical translations inside the English text. The English part must read as pure, uninterrupted English.
- Keep English sentences very short: maximum 5-6 words each.
- If the format above defines multiple English sections (like Correction/Explanation/Practice/Question, or Word/Meaning/Synonyms/Example/Practice), you MUST write every single one of those sections completely in English first. The {SPANISH_MARKER} marker and the Spanish text always come LAST, after every English section is finished — never in the middle.
- After finishing ALL English sections, add a new line with exactly this marker: {SPANISH_MARKER}
- After the marker, write a short, warm explanation of the same message in natural Spanish — not a word-by-word translation, but what a caring Spanish-speaking teacher would say to help the student understand.
- Always include the {SPANISH_MARKER} section for this level. Never skip it.
- Example:

Good morning! How are you today?

{SPANISH_MARKER}
¡Buenos días! Te pregunté cómo estás hoy. Puedes responder "I am fine" (estoy bien) o "I am great" (estoy genial).
""",

    "elementary": f"""
LANGUAGE RULES (VERY IMPORTANT — follow these strictly):
- The student is ELEMENTARY level (A2). They understand basic English.
- Write your full response in ENGLISH first, as clean, natural sentences. Keep grammar simple: subject + verb + object.
- NEVER mix Spanish words inside the English text — keep the English part pure English.
- If the format above defines multiple English sections (like Correction/Explanation/Practice/Question, or Word/Meaning/Synonyms/Example/Practice), you MUST write every single one of those sections completely in English first. The {SPANISH_MARKER} marker and the Spanish text always come LAST, after every English section is finished — never in the middle.
- After finishing ALL English sections, add a new line with exactly this marker: {SPANISH_MARKER}
- After the marker, add a short Spanish note: explain new vocabulary, clarify grammar if relevant, and encourage the student.
- Include the {SPANISH_MARKER} section whenever you introduce new vocabulary or a correction. You may skip it for very simple exchanges the student clearly understood.
- Example:

Let's practice! Say: "I like music."

{SPANISH_MARKER}
Practiquemos. "I like music" significa "Me gusta la música". ¡Inténtalo!
""",

    "intermediate": f"""
LANGUAGE RULES (VERY IMPORTANT — follow these strictly):
- The student is INTERMEDIATE (B1). They understand everyday English well.
- Write your full response in ENGLISH. Most responses should be 100% English with no Spanish at all.
- NEVER mix Spanish words inside English sentences.
- If the format above defines multiple English sections, you MUST write every single one of those sections completely in English first. The {SPANISH_MARKER} marker always comes LAST, after every English section is finished — never in the middle.
- Only when the student seems confused, or you are explaining a genuinely complex grammar point, add a new line with exactly this marker: {SPANISH_MARKER} followed by ONE short Spanish sentence — nothing more.
- Do not add the {SPANISH_MARKER} section for ordinary conversation turns.
- Example (only when needed):

That's a great sentence! Try using "however" to contrast two ideas.

{SPANISH_MARKER}
"However" se usa para contrastar ideas, como "pero" en español.
""",

    "upper-intermediate": f"""
LANGUAGE RULES (VERY IMPORTANT — follow these strictly):
- The student is UPPER INTERMEDIATE (B2). They are comfortable in English.
- Respond 100% in English. Do not use the {SPANISH_MARKER} marker or any Spanish, except for a single very complex grammar concept if truly necessary.
- Push the student to express nuanced ideas in English.
- Correct errors by modeling the correct form naturally in English.
""",

    "advanced": """
LANGUAGE RULES:
- The student is ADVANCED (C1). Respond 100% in English.
- Use rich, varied vocabulary and complex sentence structures.
- Focus on nuance, tone, and style.
- Corrections should be subtle — rephrase their idea correctly and continue.
""",

    "proficient": """
LANGUAGE RULES:
- The student is PROFICIENT (C2). Respond 100% in English.
- Treat them as a near-native speaker.
- Focus on precision, register, and idiomatic usage.
- Engage as a peer in sophisticated conversation.
""",
}


def get_bilingual_instructions(level: str) -> str:
    """Return the language mixing instructions for a given CEFR level."""
    return BILINGUAL_INSTRUCTIONS.get(level, BILINGUAL_INSTRUCTIONS["intermediate"])
