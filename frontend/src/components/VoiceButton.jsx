import { motion, AnimatePresence } from 'framer-motion'
import { useVoiceInput } from '../hooks/useVoiceInput'

export function VoiceButton({ onResult, disabled }) {
  const { isListening, isSupported, error, start, stop } = useVoiceInput({
    onResult,
    language: 'en-US',
  })

  if (!isSupported) return null

  return (
    <div className="relative">
      <motion.button
        onClick={isListening ? stop : start}
        disabled={disabled}
        whileTap={{ scale: 0.92 }}
        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 relative overflow-hidden
          ${isListening
            ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
            : 'bg-night-700 hover:bg-night-600 text-cloud-400 hover:text-cloud-200 border border-night-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Pulse ring when listening */}
        <AnimatePresence>
          {isListening && (
            <>
              <motion.div
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
                className="absolute inset-0 rounded-xl bg-red-500"
              />
              <motion.div
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: 1.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                className="absolute inset-0 rounded-xl bg-red-500"
              />
            </>
          )}
        </AnimatePresence>

        {/* Icon */}
        <span className="relative z-10">
          {isListening ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </span>
      </motion.button>

      {/* Error tooltip */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full mb-2 right-0 bg-red-500/90 text-white text-xs rounded-xl px-3 py-2 w-52 text-center shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
