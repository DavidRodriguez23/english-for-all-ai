import { motion } from 'framer-motion'
import { useT } from '../hooks/useT'

const SPANISH_MARKER = '---ES---'

const sectionHeaders = [
  'Correction:', 'Explanation:', 'Practice:', 'Question:',
  'Word:', 'Meaning:', 'Synonyms:', 'Example:', 'Example Sentences:',
  'Pronunciation Guide:', 'Difficult Sounds:', 'Feedback:',
  'Audio Script:', 'Questions:', 'Answers:',
  'Topic:', 'Instructions:', 'Lesson Title:', 'Vocabulary:',
  'Grammar:', 'Exercises:', 'Quiz:', 'Learning Analysis:',
  'Strengths:', 'Areas For Improvement:', 'Recommended Exercises:', 'Next Goal:',
  'Estimated CEFR Level:', 'Grammar Score:', 'Vocabulary Score:', 'Fluency Score:',
]
const headerRegex = new RegExp(
  `(${sectionHeaders.map((h) => h.replace(':', '\\:')).join('|')})`, 'g'
)

function formatSection(text) {
  const parts = text.split(headerRegex)
  return parts.map((part, i) => {
    if (sectionHeaders.includes(part)) {
      return <span key={i} className="block text-violet-400 font-semibold text-sm mt-3 mb-1">{part}</span>
    }
    if (!part.trim()) return null
    return <span key={i} className="whitespace-pre-wrap">{part}</span>
  })
}

function formatResponse(text) {
  const markerIndex = text.indexOf(SPANISH_MARKER)

  // Sin marcador: respuesta normal, sin seccion de espanol (niveles altos)
  if (markerIndex === -1) {
    return <div>{formatSection(text)}</div>
  }

  const englishPart = text.slice(0, markerIndex).trim()
  const spanishPart = text.slice(markerIndex + SPANISH_MARKER.length).trim()

  return (
    <div>
      <div>{formatSection(englishPart)}</div>
      {spanishPart && (
        <div className="mt-4 pt-3 border-t border-night-600">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-cloud-500 mb-1.5">
            <span aria-hidden="true">🇪🇸</span> En español
          </span>
          <div className="text-cloud-400 text-sm">{formatSection(spanishPart)}</div>
        </div>
      )}
    </div>
  )
}

export function ChatBubble({ message }) {
  const isUser = message.role === 'user'
  const t = useT()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${isUser
          ? 'bg-violet-500 text-white'
          : 'bg-gradient-to-br from-mint-400 to-violet-500 text-white'
        }`}>
        {isUser ? '✦' : '🎓'}
      </div>

      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
        ${isUser
          ? 'bg-violet-500 text-white rounded-tr-sm'
          : 'bg-night-800 text-cloud-200 rounded-tl-sm border border-night-600'
        }`}>
        {isUser
          ? <p className="whitespace-pre-wrap">{message.content}</p>
          : formatResponse(message.content)
        }
        {message.profileUpdated && (
          <div className="mt-2 flex items-center gap-1 text-xs text-mint-400">
            <span>✓</span>
            <span>{t.profileUpdated}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
