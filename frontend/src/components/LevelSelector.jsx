import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'

const LEVELS = [
  { value: 'beginner',            label: 'A1 — Beginner',            desc: 'Just starting out' },
  { value: 'elementary',          label: 'A2 — Elementary',          desc: 'Basic conversations' },
  { value: 'intermediate',        label: 'B1 — Intermediate',        desc: 'Everyday topics' },
  { value: 'upper-intermediate',  label: 'B2 — Upper Intermediate',  desc: 'Complex discussions' },
  { value: 'advanced',            label: 'C1 — Advanced',            desc: 'Fluent and precise' },
  { value: 'proficient',          label: 'C2 — Proficient',          desc: 'Near-native level' },
]

export function LevelSelector() {
  const { level, setLevel, getLevelInfo } = useStore()
  const [open, setOpen] = useState(false)
  const info = getLevelInfo()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 hover:border-violet-500/30 transition-all"
      >
        <span className="text-sm">{info.emoji}</span>
        <span className={`level-badge ${info.color}`}>{info.label}</span>
        <svg
          className={`w-3 h-3 text-cloud-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-20 glass rounded-2xl overflow-hidden shadow-2xl shadow-night-950/50 min-w-[220px]"
            >
              <div className="p-2">
                <p className="text-xs text-cloud-600 px-3 py-2 font-medium uppercase tracking-wider">
                  Your level
                </p>
                {LEVELS.map((l) => (
                  <button
                    key={l.value}
                    onClick={() => { setLevel(l.value); setOpen(false) }}
                    className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors
                      ${level === l.value
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'hover:bg-night-700 text-cloud-300'
                      }`}
                  >
                    <span className="text-sm font-semibold min-w-[28px]">
                      {l.label.split('—')[0].trim()}
                    </span>
                    <div>
                      <div className="text-sm font-medium leading-tight">
                        {l.label.split('—')[1]?.trim()}
                      </div>
                      <div className="text-xs text-cloud-600">{l.desc}</div>
                    </div>
                    {level === l.value && (
                      <svg className="ml-auto w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
