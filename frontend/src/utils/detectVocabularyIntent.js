// Espejo simplificado de vocabulary_keywords en backend/app/services/prompt_router.py.
// Solo decide dispositivo vs nube — el backend conserva su propia deteccion completa.

const VOCAB_KEYWORDS = ['meaning', 'definition', 'vocabulary', 'what does']

export function isVocabularyQuestion(text) {
  const lower = text.toLowerCase()
  return VOCAB_KEYWORDS.some((k) => lower.includes(k))
}
