import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'

export const useStore = create(
  persist(
    (set, get) => ({
      // User identity (persisted locally)
      userId: uuidv4(),
      sessionId: uuidv4(),
      level: 'beginner',
      userName: null,

      // UI language — 'es' default for Spanish speakers
      uiLanguage: 'es',

      // Chat messages for current session
      messages: [],

      // UI state
      isLoading: false,
      error: null,
      webllmStatus: 'idle', // 'idle' | 'loading' | 'ready' | 'unsupported'

      // Profile data from backend
      profile: null,

      // Actions
      setLevel: (level) => set({ level }),
      setUserName: (userName) => set({ userName }),
      setProfile: (profile) => set({ profile }),
      setUiLanguage: (uiLanguage) => set({ uiLanguage }),
      toggleLanguage: () => set((state) => ({
        uiLanguage: state.uiLanguage === 'es' ? 'en' : 'es'
      })),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      setWebllmStatus: (webllmStatus) => set({ webllmStatus }),

      newSession: () =>
        set({
          sessionId: uuidv4(),
          messages: [],
          error: null,
        }),

      getLevelInfo: () => {
        const { level } = get()
        const levels = {
          beginner:            { label: 'A1', color: 'bg-mint-400/20 text-mint-400',    emoji: '🌱' },
          elementary:          { label: 'A2', color: 'bg-mint-400/20 text-mint-400',    emoji: '🌿' },
          intermediate:        { label: 'B1', color: 'bg-violet-400/20 text-violet-400', emoji: '⚡' },
          'upper-intermediate':{ label: 'B2', color: 'bg-violet-400/20 text-violet-400', emoji: '🚀' },
          advanced:            { label: 'C1', color: 'bg-coral-400/20 text-coral-400',  emoji: '🔥' },
          proficient:          { label: 'C2', color: 'bg-coral-400/20 text-coral-400',  emoji: '🏆' },
        }
        return levels[level] || levels.beginner
      },
    }),
    {
      name: 'english-for-all-store',
      partialize: (state) => ({
        userId: state.userId,
        level: state.level,
        userName: state.userName,
        uiLanguage: state.uiLanguage,
      }),
    }
  )
)
