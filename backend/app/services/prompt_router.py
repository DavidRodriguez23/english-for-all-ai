def detect_intent(message: str):

    text = message.lower()

    pronunciation_keywords = [
        "pronounce", "pronunciation", "how do i pronounce", "how to pronounce", "sound like",
        "pronunciar", "pronunciación", "pronunciacion", "cómo pronuncio", "como pronuncio",
        "cómo se pronuncia", "como se pronuncia",
    ]

    listening_keywords = [
        "listening", "audio", "listen", "hearing", "listening exercise",
        "escuchar", "escucha", "ejercicio de escucha",
    ]

    speaking_keywords = [
        "speaking", "conversation practice", "talk with me", "speaking exercise",
        "hablar", "práctica de conversación", "practica de conversacion", "habla conmigo",
    ]

    roleplay_keywords = [
        "roleplay", "interview", "restaurant", "airport", "simulate", "pretend",
        "juego de roles", "simular", "simula", "entrevista", "restaurante", "aeropuerto",
        "finge", "fingir",
    ]

    vocabulary_keywords = [
        "meaning", "definition", "vocabulary", "what does",
        "significado", "definición", "definicion", "vocabulario", "qué significa", "que significa",
    ]

    grammar_keywords = [
        "correct", "fix", "grammar", "is this correct",
        "corregir", "corrige", "corrígeme", "corrigeme", "gramática", "gramatica",
        "está bien esto", "esta bien esto", "arreglar",
    ]

    assessment_keywords = [
        "test me", "assessment", "quiz", "evaluate my english", "check my level",
        "evalúa mi inglés", "evalua mi ingles", "evaluar mi nivel", "examen",
        "prueba de nivel", "cuál es mi nivel", "cual es mi nivel",
    ]

    lesson_keywords = [
        "lesson", "teach me", "learning plan", "study plan",
        "lección", "leccion", "enséñame", "ensename", "plan de estudio", "plan de aprendizaje",
    ]

    adaptive_keywords = [
        "what should i improve", "my weaknesses", "adaptive learning",
        "qué debo mejorar", "que debo mejorar", "mis debilidades", "aprendizaje adaptativo",
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
