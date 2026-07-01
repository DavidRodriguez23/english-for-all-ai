import { getEngine } from './webllmEngine'

function buildVocabularyPrompt(word, level) {
  return `You are an English vocabulary coach for a Spanish-speaking student.

Explain the following word or phrase clearly for a student at level ${level}.

Return exactly this format:

Word:
${word}

Meaning:
<simple definition>

Synonyms:
<2-3 synonyms>

Example:
<one example sentence>

Practice:
<one short exercise for the student>`
}

export async function generateVocabularyLocally(word, level, onProgress) {
  const engine = await getEngine(onProgress)

  const reply = await engine.chat.completions.create({
    messages: [{ role: 'user', content: buildVocabularyPrompt(word, level) }],
    max_tokens: 400,
    temperature: 0.6,
  })

  return reply.choices[0].message.content.trim()
}
