// Espejo de backend/app/services/prompt_router.py.
// Se usa para decidir dispositivo vs nube en el cliente — el backend
// conserva su propia deteccion independiente para lo que le llegue alla.

const KEYWORDS = {
  pronunciation: [
    'pronounce', 'pronunciation', 'how do i pronounce', 'how to pronounce', 'sound like',
    'pronunciar', 'pronunciación', 'pronunciacion', 'cómo pronuncio', 'como pronuncio',
    'cómo se pronuncia', 'como se pronuncia',
  ],
  listening: [
    'listening', 'audio', 'listen', 'hearing', 'listening exercise',
    'escuchar', 'escucha', 'ejercicio de escucha',
  ],
  speaking: [
    'speaking', 'conversation practice', 'talk with me', 'speaking exercise',
    'hablar', 'práctica de conversación', 'practica de conversacion', 'habla conmigo',
  ],
  roleplay: [
    'roleplay', 'interview', 'restaurant', 'airport', 'simulate', 'pretend',
    'juego de roles', 'simular', 'simula', 'entrevista', 'restaurante', 'aeropuerto',
    'finge', 'fingir',
  ],
  vocabulary: [
    'meaning', 'definition', 'vocabulary', 'what does',
    'significado', 'definición', 'definicion', 'vocabulario', 'qué significa', 'que significa',
  ],
  grammar: [
    'correct', 'fix', 'grammar', 'is this correct',
    'corregir', 'corrige', 'corrígeme', 'corrigeme', 'gramática', 'gramatica',
    'está bien esto', 'esta bien esto', 'arreglar',
  ],
  assessment: [
    'test me', 'assessment', 'quiz', 'evaluate my english', 'check my level',
    'evalúa mi inglés', 'evalua mi ingles', 'evaluar mi nivel', 'examen',
    'prueba de nivel', 'cuál es mi nivel', 'cual es mi nivel',
  ],
  lesson_generator: [
    'lesson', 'teach me', 'learning plan', 'study plan',
    'lección', 'leccion', 'enséñame', 'ensename', 'plan de estudio', 'plan de aprendizaje',
  ],
  adaptive_learning: [
    'what should i improve', 'my weaknesses', 'adaptive learning',
    'qué debo mejorar', 'que debo mejorar', 'mis debilidades', 'aprendizaje adaptativo',
  ],
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
