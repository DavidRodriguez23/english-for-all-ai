import { useState, useCallback, useRef } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const getBestVoice = (lang = 'en-US') => {
    const voices = window.speechSynthesis.getVoices()
    if (lang === 'en-US') {
      const preferred = ['Samantha', 'Karen', 'Daniel', 'Google US English',
        'Microsoft Aria', 'Microsoft Jenny', 'Alex']
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name))
        if (v) return v
      }
      return voices.find(v => v.lang.startsWith('en')) || voices[0]
    } else {
      // Spanish voice for bilingual responses
      return voices.find(v => v.lang.startsWith('es')) || voices[0]
    }
  }

  const speak = useCallback((text, lang = 'en-US') => {
    if (!isSupported) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = 0.9   // slightly slower = clearer for learners
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const trySpeak = () => {
      const voice = getBestVoice(lang)
      if (voice) utterance.voice = voice
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend   = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = trySpeak
    } else {
      trySpeak()
    }
  }, [isSupported])

  // For beginner/elementary levels, use a mixed-language speaker approach:
  // split text by language markers and speak each part with the right voice
  const speakBilingual = useCallback((text, level) => {
    if (!isSupported) return
    const beginnerLevels = ['beginner', 'elementary']
    if (!beginnerLevels.includes(level)) {
      speak(text, 'en-US')
      return
    }
    // For beginner/elementary: speak the whole thing — the browser
    // will use the language of the utterance. We set en-US but the
    // text already contains Spanish mixed in, which is fine for TTS.
    // The key is speaking slowly and clearly.
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 0.82   // even slower for beginners
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const trySpeak = () => {
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.lang.startsWith('en')) || voices[0]
      if (voice) utterance.voice = voice
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend   = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = trySpeak
    } else {
      trySpeak()
    }
  }, [isSupported, speak])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { speak, speakBilingual, stop, isSpeaking, isSupported }
}
