import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useT } from '../hooks/useT'

export function LevelSelector() {
  const { level, setLevel, getLevelInfo } = useStore()
  const [open, setOpen] = useState(false)
  const info = getLevelInfo()
  const t = useT()

  const LEVELS = [
    'beginner', 'elementary', 'intermediate',
    'upper-intermediate', 'advanced', 'proficient'
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 glass rounded-xl px-3 py-1.5 hover:border-violet-500/30 transition-all"
      >
        <span className="text-sm">{info.emoji}</span>
        <span className={`level-badge ${info.color}`}>{info.label}</span>
        <svg className={`w-3 h-3 text-cloud-600 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-20 glass rounded-2xl overflow-hidden shadow-2xl shadow-night-950/50 min-w-[240px]"
            >
              <div className="p-2">
                <p className="text-xs text-cloud-600 px-3 py-2 font-medium uppercase tracking-wider">
                  {t.yourLevel}
                </p>
                {LEVELS.map((l) => {
                  const levelData = t.levels[l]
                  const levelInfo = {
                    beginner: { emoji: '🌱', code: 'A1' },
                    elementary: { emoji: '🌿', code: 'A2' },
                    intermediate: { emoji: '⚡', code: 'B1' },
                    'upper-intermediate': { emoji: '🚀', code: 'B2' },
                    advanced: { emoji: '🔥', code: 'C1' },
                    proficient: { emoji: '🏆', code: 'C2' },
                  }[l]

                  return (
                    <button
                      key={l}
                      onClick={() => { setLevel(l); setOpen(false) }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-colors
                        ${level === l
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'hover:bg-night-700 text-cloud-300'
                        }`}
                    >
                      <span className="text-base">{levelInfo.emoji}</span>
                      <div>
                        <div className="text-sm font-medium leading-tight">{levelData.label}</div>
                        <div className="text-xs text-cloud-600">{levelData.desc}</div>
                      </div>
                      {level === l && (
                        <svg className="ml-auto w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
