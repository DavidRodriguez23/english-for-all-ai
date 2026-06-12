import { useState, useRef, useCallback } from 'react'

export function useVoiceInput({ onResult, language = 'en-US' }) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  )
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  const start = useCallback(() => {
    if (!isSupported) {
      setError('Voice input is not supported in this browser.')
      return
    }

    setError(null)

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    recognition.onerror = (event) => {
      setError(
        event.error === 'no-speech'     ? 'No speech detected. Try again.' :
        event.error === 'not-allowed'   ? 'Microphone access denied. Please allow it in your browser settings.' :
        event.error === 'network'       ? 'Network error. Check your connection.' :
        `Voice error: ${event.error}`
      )
      setIsListening(false)
    }

    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, language, onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isListening, isSupported, error, start, stop }
}
