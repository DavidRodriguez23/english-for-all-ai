import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export function ChatInput({ onSend, isLoading, disabled }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [text])

  const handleSend = () => {
    if (!text.trim() || isLoading || disabled) return
    onSend(text)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = text.trim().length > 0 && !isLoading && !disabled

  return (
    <div className="p-3 pb-safe">
      <div className="glass rounded-2xl flex items-end gap-2 p-2 max-w-2xl mx-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading || disabled}
          placeholder="Type a message or ask anything... (Enter to send)"
          rows={1}
          className="flex-1 bg-transparent text-cloud-200 placeholder-cloud-600 text-sm resize-none outline-none px-3 py-2 leading-relaxed disabled:opacity-50 max-h-40 overflow-y-auto"
        />

        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          whileTap={{ scale: 0.92 }}
          className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
            ${canSend
              ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-lg shadow-violet-500/25'
              : 'bg-night-700 text-cloud-600 cursor-not-allowed'
            }`}
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-cloud-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </motion.button>
      </div>

      <p className="text-center text-xs text-cloud-600 mt-2">
        Shift + Enter for new line · Your tutor adapts to your level
      </p>
    </div>
  )
}
