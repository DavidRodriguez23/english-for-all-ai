import { useState, useCallback, useRef } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || '/api'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const audioRef = useRef(null)
  const isSupported = typeof window !== 'undefined'

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current = null
    }
    setIsSpeaking(false)
  }, [])

  const speakBilingual = useCallback(async (text, level) => {
    stopAudio()
    setIsSpeaking(true)

    try {
      // Try ElevenLabs via backend
      const res = await fetch(`${API_BASE}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, level }),
      })

      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audioRef.current = audio
        audio.onended = () => {
          URL.revokeObjectURL(url)
          setIsSpeaking(false)
        }
        audio.onerror = () => {
          URL.revokeObjectURL(url)
          fallbackTTS(text, level)
        }
        await audio.play()
        return
      }
    } catch {
      // ElevenLabs not available — use browser fallback
    }

    fallbackTTS(text, level)
  }, [stopAudio])

  // Browser TTS fallback (when ElevenLabs not configured)
  const fallbackTTS = (text, level) => {
    if (!('speechSynthesis' in window)) {
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = ['beginner', 'elementary'].includes(level) ? 0.82 : 0.92
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.lang.startsWith('en')) || voices[0]
    if (voice) utterance.voice = voice

    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  const speak = speakBilingual

  const stop = useCallback(() => {
    stopAudio()
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [stopAudio])

  return { speak, speakBilingual, stop, isSpeaking, isSupported }
}
