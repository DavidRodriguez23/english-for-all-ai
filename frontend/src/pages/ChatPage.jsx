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

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-screen bg-night-950">
      <Header onNewSession={newSession} />

      <ErrorBanner message={error} onDismiss={clearError} />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-4">

          {/* Empty state with quick actions */}
          {isEmpty && !isLoading && (
            <QuickActions onSelect={sendMessage} />
          )}

          {/* Message list */}
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatBubble key={msg.id} message={msg} />
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isLoading && <TypingIndicator />}
            </AnimatePresence>
          </div>

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* Input area */}
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        disabled={false}
      />
    </div>
  )
}
