import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../services/api'
import { v4 as uuidv4 } from 'uuid'

export function useChat() {
  const {
    userId,
    sessionId,
    level,
    messages,
    isLoading,
    error,
    addMessage,
    setLoading,
    setError,
    clearError,
    newSession,
  } = useStore()

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return

      clearError()

      // Add user message immediately
      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      }
      addMessage(userMessage)
      setLoading(true)

      try {
        const data = await api.chat({
          sessionId,
          userId,
          message: text.trim(),
          level,
        })

        const assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          profileUpdated: data.profile_updated,
        }
        addMessage(assistantMessage)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [userId, sessionId, level, isLoading, addMessage, setLoading, setError, clearError]
  )

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    newSession,
    clearError,
  }
}
