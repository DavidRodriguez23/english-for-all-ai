import { generateVocabularyLocally } from './localVocabulary'

// Registro central: que intents pueden resolverse en el dispositivo.
// Fase 1 solo llena "vocabulary". Fase 3 va a ir agregando generadores
// locales aqui (grammar, conversation, roleplay) sin tocar useChat.js.

export const intentRegistry = {
  vocabulary: {
    local: generateVocabularyLocally,
  },
  // grammar: { local: generateGrammarLocally },            // Fase 3
  // conversation: { local: generateConversationLocally },  // Fase 3
  // roleplay: { local: generateRoleplayLocally },          // Fase 3
}

export function getLocalHandler(intent) {
  return intentRegistry[intent]?.local ?? null
}
