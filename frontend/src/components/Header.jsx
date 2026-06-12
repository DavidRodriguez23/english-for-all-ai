import { motion } from 'framer-motion'
import { LevelSelector } from './LevelSelector'

export function Header({ onNewSession }) {
  return (
    <header className="glass border-b border-night-700 sticky top-0 z-30">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-mint-400 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-violet-500/30">
            E
          </div>
          <span className="font-display font-bold text-cloud-100 text-base hidden sm:block">
            English For All
          </span>
          <span className="font-display font-bold text-cloud-100 text-base sm:hidden">
            EFA
          </span>
          <span className="text-xs bg-mint-400/10 text-mint-400 border border-mint-400/20 px-2 py-0.5 rounded-full font-medium hidden sm:block">
            Free
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LevelSelector />

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onNewSession}
            title="Start a new conversation"
            className="w-8 h-8 rounded-xl bg-night-800 hover:bg-night-700 border border-night-600 hover:border-violet-500/30 flex items-center justify-center transition-all"
          >
            <svg className="w-4 h-4 text-cloud-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        </div>
      </div>
    </header>
  )
}
