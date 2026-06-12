import { motion, AnimatePresence } from 'framer-motion'

export function ErrorBanner({ message, onDismiss }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mx-4 mt-2 flex items-center gap-3 max-w-2xl mx-auto"
        >
          <span className="text-lg">⚠️</span>
          <p className="text-sm text-red-300 flex-1">{message}</p>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-200 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
