"""
Priority-based intent detection.

Problem with the old approach: a message like
"I want to practice pronunciation at the restaurant"
matched 'restaurant' → roleplay, ignoring 'pronunciation'.

Fix: intents are checked in priority order. More specific
intents (pronunciation, assessment) win over general ones
(roleplay, conversation).
"""

INTENT_RULES = [
    # (intent, keywords) — checked top to bottom, first match wins
    ("assessment", [
        "test me", "assess", "assessment", "quiz me",
        "evaluate my english", "check my level", "what level am i",
        "cefr", "test my english"
    ]),
    ("pronunciation", [
        "pronounce", "pronunciation", "how do i pronounce",
        "how to pronounce", "sound like", "accent", "phonetic",
        "ipa", "stress pattern", "intonation"
    ]),
    ("grammar", [
        "correct this", "fix my", "grammar", "is this correct",
        "check my sentence", "grammatically", "spelling mistake",
        "correct my", "fix this sentence"
    ]),
    ("vocabulary", [
        "what does", "meaning of", "definition of", "vocabulary",
        "synonym", "antonym", "what is the word", "how do you say",
        "word for", "what word"
    ]),
    ("listening", [
        "listening exercise", "listening practice", "audio exercise",
        "comprehension exercise", "dictation"
    ]),
    ("speaking", [
        "speaking exercise", "speaking practice", "talk with me",
        "conversation practice", "speaking topic", "speaking task"
    ]),
    ("roleplay", [
        "roleplay", "role play", "role-play", "simulate",
        "pretend", "act as", "interview practice", "at the restaurant",
        "at the airport", "at the hotel", "at the doctor",
        "job interview", "ordering food", "checking in"
    ]),
    ("lesson_generator", [
        "lesson", "teach me", "learning plan", "study plan",
        "create a lesson", "make a lesson", "give me a lesson"
    ]),
    ("adaptive_learning", [
        "what should i improve", "my weaknesses", "my progress",
        "adaptive", "what to study", "learning recommendations",
        "personalized plan"
    ]),
]


def detect_intent(message: str) -> str:
    text = message.lower().strip()

    for intent, keywords in INTENT_RULES:
        for keyword in keywords:
            if keyword in text:
                return intent

    return "conversation"
