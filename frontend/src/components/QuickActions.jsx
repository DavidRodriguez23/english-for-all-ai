import { motion } from 'framer-motion'
import { useT } from '../hooks/useT'

export function QuickActions({ onSelect }) {
  const t = useT()

  const suggestions = [
    { icon: '💬', label: t.startConversation,    message: "Let's talk! How was your day?" },
    { icon: '✏️', label: t.fixMyGrammar,         message: 'Can you correct this sentence: "Yesterday I go to the store and buyed some food."' },
    { icon: '📖', label: t.learnAWord,            message: 'What does "perseverance" mean? Give me examples.' },
    { icon: '🎭', label: t.roleplayInterview,     message: "Let's roleplay a job interview. I'm applying for a marketing position." },
    { icon: '🎯', label: t.assessMyLevel,         message: 'Test me and evaluate my English level. I will write a few sentences about my life.' },
    { icon: '🗣️', label: t.practicePronunciation, message: 'How do I pronounce "comfortable" and "particularly"? My accent is Spanish.' },
  ]

  return (
    <div className="flex flex-col items-center gap-6 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-5xl mb-4">🎓</div>
        <h2 className="font-display text-2xl font-bold text-cloud-100 mb-2">
          {t.readyToPractice}
        </h2>
        <p className="text-cloud-400 text-sm max-w-xs">
          {t.readySubtitle}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
        {suggestions.map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(s.message)}
            className="flex items-center gap-3 text-left bg-night-800 hover:bg-night-700 border border-night-600 hover:border-violet-500/40 rounded-xl px-4 py-3 transition-all duration-200 group"
          >
            <span className="text-xl">{s.icon}</span>
            <span className="text-sm text-cloud-300 group-hover:text-cloud-100 transition-colors">
              {s.label}
            </span>
            <span className="ml-auto text-cloud-600 group-hover:text-violet-400 transition-colors text-xs">→</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
