// Espejo de backend/app/services/prompt_router.py.
// Se usa para decidir dispositivo vs nube en el cliente — el backend
// conserva su propia deteccion independiente para lo que le llegue alla.

const KEYWORDS = {
  pronunciation: ['pronounce', 'pronunciation', 'how do i pronounce', 'how to pronounce', 'sound like'],
  listening: ['listening', 'audio', 'listen', 'hearing', 'listening exercise'],
  speaking: ['speaking', 'conversation practice', 'talk with me', 'speaking exercise'],
  roleplay: ['roleplay', 'interview', 'restaurant', 'airport', 'simulate', 'pretend'],
  vocabulary: ['meaning', 'definition', 'vocabulary', 'what does'],
  grammar: ['correct', 'fix', 'grammar', 'is this correct'],
  assessment: ['test me', 'assessment', 'quiz', 'evaluate my english', 'check my level'],
  lesson_generator: ['lesson', 'teach me', 'learning plan', 'study plan'],
  adaptive_learning: ['what should i improve', 'my weaknesses', 'adaptive learning'],
}

const INTENT_ORDER = [
  'pronunciation', 'listening', 'speaking', 'roleplay',
  'vocabulary', 'grammar', 'assessment', 'lesson_generator', 'adaptive_learning',
]

export function detectIntent(text) {
  const lower = text.toLowerCase()
  for (const intent of INTENT_ORDER) {
    if (KEYWORDS[intent].some((k) => lower.includes(k))) {
      return intent
    }
  }
  return 'conversation'
}
