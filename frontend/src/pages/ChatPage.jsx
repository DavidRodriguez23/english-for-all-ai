import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useChat } from '../hooks/useChat'
import { Header } from '../components/Header'
import { ChatBubble } from '../components/ChatBubble'
import { TypingIndicator } from '../components/TypingIndicator'
import { ChatInput } from '../components/ChatInput'
import { QuickActions } from '../components/QuickActions'
import { ErrorBanner } from '../components/ErrorBanner'

export default function ChatPage() {
  const { messages, isLoading, error, sendMessage, newSession, clearError } = useChat()
  const bottomRef = useRef(null)

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Handle autoMessage from profile CTA
  useEffect(() => {
    const auto = sessionStorage.getItem('autoMessage')
    if (auto) {
      sessionStorage.removeItem('autoMessage')
      setTimeout(() => sendMessage(auto), 400)
    }
  }, [])

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col bg-night-950" style={{ height: '100dvh' }}>
      <Header onNewSession={newSession} />

      <ErrorBanner message={error} onDismiss={clearError} />

      {/* Messages area — extra bottom padding for BottomNav */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">

          {isEmpty && !isLoading && (
            <QuickActions onSelect={sendMessage} />
          )}

          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            <AnimatePresence>
              {isLoading && <TypingIndicator />}
            </AnimatePresence>
          </div>

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Input sits above BottomNav */}
      <div className="pb-16">
        <ChatInput
          onSend={sendMessage}
          isLoading={isLoading}
          disabled={false}
        />
      </div>
    </div>
  )
}
