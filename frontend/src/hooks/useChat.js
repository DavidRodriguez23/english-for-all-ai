import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import { api } from '../services/api'
import { v4 as uuidv4 } from 'uuid'
import { isWebGPUSupported } from '../services/webllmEngine'
import { detectIntent } from '../utils/detectIntent'
import { getLocalHandler } from '../services/intentRegistry'

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
    setWebllmStatus,
  } = useStore()

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || isLoading) return

      clearError()

      const userMessage = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
      }
      addMessage(userMessage)
      setLoading(true)

      const intent = detectIntent(text)
      const localHandler = getLocalHandler(intent)

      // Si este intent tiene generador local y el dispositivo soporta
      // WebGPU, intenta primero ahi. Costo $0, sin cuota. Cualquier
      // falla cae automaticamente a la nube.
      if (isWebGPUSupported() && localHandler) {
        try {
          setWebllmStatus('loading')
          const content = await localHandler(text.trim(), level, (progress) => {
            setWebllmStatus(progress < 1 ? 'loading' : 'ready')
          })
          setWebllmStatus('ready')

          addMessage({
            id: uuidv4(),
            role: 'assistant',
            content,
            timestamp: new Date().toISOString(),
            source: 'local',
            intent,
          })
          setLoading(false)
          return
        } catch (err) {
          console.warn(`[router] "${intent}" local fallo, usando la nube:`, err)
          setWebllmStatus('unsupported')
        }
      }

      try {
        const data = await api.chat({
          sessionId,
          userId,
          message: text.trim(),
          level,
        })

        addMessage({
          id: uuidv4(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString(),
          profileUpdated: data.profile_updated,
          intent,
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    },
    [userId, sessionId, level, isLoading, addMessage, setLoading, setError, clearError, setWebllmStatus]
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
