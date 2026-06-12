def detect_intent(message: str):
    

    text = message.lower()

    pronunciation_keywords = [
        "pronounce",
        "pronunciation",
        "how do i pronounce",
        "how to pronounce",
        "sound like"
    ]

    listening_keywords = [
        "listening",
        "audio",
        "listen",
        "hearing",
        "listening exercise"
    ]

    speaking_keywords = [
        "speaking",
        "conversation practice",
        "talk with me",
        "speaking exercise"
    ]

    roleplay_keywords = [
        "roleplay",
        "interview",
        "restaurant",
        "airport",
        "simulate",
        "pretend"
    ]

    vocabulary_keywords = [
        "meaning",
        "definition",
        "vocabulary",
        "what does"
    ]

    grammar_keywords = [
        "correct",
        "fix",
        "grammar",
        "is this correct"
    ]

    assessment_keywords = [
        "test me",
        "assessment",
        "quiz",
        "evaluate my english",
        "check my level"
    ]

    lesson_keywords = [
        "lesson",
        "teach me",
        "learning plan",
        "study plan"
    ]

    adaptive_keywords = [
        "what should i improve",
        "my weaknesses",
        "adaptive learning"
    ]

    for keyword in pronunciation_keywords:
        if keyword in text:
            return "pronunciation"

    for keyword in listening_keywords:
        if keyword in text:
            return "listening"

    for keyword in speaking_keywords:
        if keyword in text:
            return "speaking"

    for keyword in roleplay_keywords:
        if keyword in text:
            return "roleplay"

    for keyword in vocabulary_keywords:
        if keyword in text:
            return "vocabulary"

    for keyword in grammar_keywords:
        if keyword in text:
            return "grammar"

    for keyword in assessment_keywords:
        if keyword in text:
            return "assessment"

    for keyword in lesson_keywords:
        if keyword in text:
            return "lesson_generator"

    for keyword in adaptive_keywords:
        if keyword in text:
            return "adaptive_learning"

    return "conversation"