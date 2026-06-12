import { useState, useCallback, useRef } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef(null)
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  const getVoice = (lang) => {
    const voices = window.speechSynthesis.getVoices()
    if (lang === 'es') {
      // Best Spanish voices
      const preferred = ['Monica', 'Paulina', 'Google español', 'Microsoft Sabina', 'Conchita', 'Jorge']
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name))
        if (v) return v
      }
      return voices.find(v => v.lang.startsWith('es')) || null
    } else {
      // Best English voices
      const preferred = ['Samantha', 'Karen', 'Google US English', 'Microsoft Aria', 'Microsoft Jenny', 'Alex']
      for (const name of preferred) {
        const v = voices.find(v => v.name.includes(name))
        if (v) return v
      }
      return voices.find(v => v.lang.startsWith('en')) || null
    }
  }

  // Split mixed text into segments by language
  // Spanish text: anything between parentheses OR after common Spanish markers
  const splitByLanguage = (text) => {
    const segments = []
    // Split on parenthetical translations like "(Soy tu tutor)"
    const parts = text.split(/(\([^)]+\))/)
    parts.forEach(part => {
      if (!part.trim()) return
      const isSpanish = part.startsWith('(') && part.endsWith(')')
      segments.push({
        text: isSpanish ? part.slice(1, -1) : part,
        lang: isSpanish ? 'es' : 'en'
      })
    })
    return segments.length > 0 ? segments : [{ text, lang: 'en' }]
  }

  const speakSegment = (text, lang, rate, onEnd) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang === 'es' ? 'es-ES' : 'en-US'
    utterance.rate = rate
    utterance.pitch = 1.0
    utterance.volume = 1.0

    const voice = getVoice(lang)
    if (voice) utterance.voice = voice

    utterance.onend = onEnd
    utterance.onerror = onEnd
    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  const speakBilingual = useCallback((text, level) => {
    if (!isSupported) return
    window.speechSynthesis.cancel()

    const beginnerLevels = ['beginner', 'elementary']
    const rate = beginnerLevels.includes(level) ? 0.85 : 0.92
    setIsSpeaking(true)

    if (!beginnerLevels.includes(level)) {
      // For intermediate+ just speak in English
      speakSegment(text, 'en', rate, () => setIsSpeaking(false))
      return
    }

    // For beginners: split and speak each segment in its language
    const doSpeak = () => {
      const segments = splitByLanguage(text)

      const speakNext = (index) => {
        if (index >= segments.length) {
          setIsSpeaking(false)
          return
        }
        const { text: segText, lang } = segments[index]
        speakSegment(segText.trim(), lang, rate, () => speakNext(index + 1))
      }

      speakNext(0)
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = doSpeak
    } else {
      doSpeak()
    }
  }, [isSupported])

  const speak = useCallback((text, lang = 'en') => {
    if (!isSupported) return
    window.speechSynthesis.cancel()
    setIsSpeaking(true)
    const doSpeak = () => speakSegment(text, lang, 0.92, () => setIsSpeaking(false))
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = doSpeak
    } else {
      doSpeak()
    }
  }, [isSupported])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { speak, speakBilingual, stop, isSpeaking, isSupported }
}
