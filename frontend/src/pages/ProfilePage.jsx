import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { api } from '../services/api'

const CEFR_LEVELS = [
  { key: 'beginner',            label: 'A1', name: 'Beginner',           color: 'bg-mint-400',   textColor: 'text-mint-400',   bar: 'bg-mint-400' },
  { key: 'elementary',          label: 'A2', name: 'Elementary',         color: 'bg-mint-500',   textColor: 'text-mint-500',   bar: 'bg-mint-500' },
  { key: 'intermediate',        label: 'B1', name: 'Intermediate',       color: 'bg-violet-400', textColor: 'text-violet-400', bar: 'bg-violet-400' },
  { key: 'upper-intermediate',  label: 'B2', name: 'Upper Intermediate', color: 'bg-violet-500', textColor: 'text-violet-500', bar: 'bg-violet-500' },
  { key: 'advanced',            label: 'C1', name: 'Advanced',           color: 'bg-coral-400',  textColor: 'text-coral-400',  bar: 'bg-coral-400' },
  { key: 'proficient',          label: 'C2', name: 'Proficient',         color: 'bg-coral-500',  textColor: 'text-coral-500',  bar: 'bg-coral-500' },
]

function ScoreBar({ label, score, color }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-sm text-cloud-400">{label}</span>
        <span className="text-sm font-semibold text-cloud-200">{score}/100</span>
      </div>
      <div className="h-2 bg-night-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

function StatCard({ emoji, label, value }) {
  return (
    <div className="bg-night-800 border border-night-600 rounded-2xl p-4 flex flex-col items-center gap-1">
      <span className="text-2xl">{emoji}</span>
      <span className="text-xl font-bold text-cloud-100">{value}</span>
      <span className="text-xs text-cloud-600 text-center">{label}</span>
    </div>
  )
}

export default function ProfilePage() {
  const { userId, level, userName, getLevelInfo } = useStore()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const levelInfo = getLevelInfo()
  const cefrLevel = CEFR_LEVELS.find(l => l.key === level) || CEFR_LEVELS[0]

  useEffect(() => {
    api.getProfile(userId)
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userId])

  const scores = [
    { label: 'Grammar',       score: profile?.grammar_score       ?? 0, color: 'bg-violet-400' },
    { label: 'Vocabulary',    score: profile?.vocabulary_score    ?? 0, color: 'bg-mint-400' },
    { label: 'Pronunciation', score: profile?.pronunciation_score ?? 0, color: 'bg-coral-400' },
    { label: 'Listening',     score: profile?.listening_score     ?? 0, color: 'bg-violet-400' },
    { label: 'Speaking',      score: profile?.speaking_score      ?? 0, color: 'bg-mint-400' },
  ]

  const strengths = profile ? JSON.parse(profile.strengths_json || '[]') : []
  const weaknesses = profile ? JSON.parse(profile.weaknesses_json || '[]') : []

  return (
    <div className="min-h-screen bg-night-950 pb-24">
      {/* Header */}
      <div className="glass border-b border-night-700 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <h1 className="font-display font-bold text-cloud-100 text-lg">My Profile</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* Hero card — level + name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 flex items-center gap-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-mint-400 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-violet-500/30 flex-shrink-0">
            {levelInfo.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-cloud-400 text-sm mb-0.5">
              {loading ? '...' : (profile?.name || userName || 'Learner')}
            </p>
            <h2 className="font-display font-bold text-cloud-100 text-xl">
              {cefrLevel.label} — {cefrLevel.name}
            </h2>
            <p className="text-xs text-cloud-600 mt-1">
              {profile?.native_language || 'Spanish'} speaker · {profile?.learning_goal || 'General English'}
            </p>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard emoji="📚" label="Lessons completed" value={profile?.completed_lessons ?? 0} />
          <StatCard emoji="💬" label="Native language" value={profile?.native_language?.slice(0,3) ?? 'ES'} />
          <StatCard emoji="🎯" label="Current level" value={cefrLevel.label} />
        </motion.div>

        {/* CEFR progress path */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-cloud-400 uppercase tracking-wider mb-4">
            CEFR Progress Path
          </h3>
          <div className="flex items-center gap-1">
            {CEFR_LEVELS.map((l, i) => {
              const isActive = l.key === level
              const isPast = CEFR_LEVELS.indexOf(CEFR_LEVELS.find(x => x.key === level)) > i
              return (
                <div key={l.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-2 rounded-full transition-all ${
                    isActive ? 'bg-violet-500' :
                    isPast ? 'bg-violet-500/40' :
                    'bg-night-700'
                  }`} />
                  <span className={`text-xs font-bold ${
                    isActive ? 'text-violet-400' :
                    isPast ? 'text-cloud-600' :
                    'text-night-600'
                  }`}>{l.label}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Skill scores */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 space-y-4"
        >
          <h3 className="text-sm font-semibold text-cloud-400 uppercase tracking-wider">
            Skill Scores
          </h3>
          {scores.map((s) => (
            <ScoreBar key={s.label} {...s} />
          ))}
          {scores.every(s => s.score === 0) && (
            <p className="text-sm text-cloud-600 text-center py-2">
              Complete an assessment to see your scores ✦
            </p>
          )}
        </motion.div>

        {/* Strengths & weaknesses */}
        {(strengths.length > 0 || weaknesses.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-mint-400 uppercase tracking-wider mb-3">
                Strengths
              </h3>
              <ul className="space-y-1.5">
                {strengths.length > 0 ? strengths.map((s, i) => (
                  <li key={i} className="text-xs text-cloud-300 flex items-start gap-1.5">
                    <span className="text-mint-400 mt-0.5">✓</span>{s}
                  </li>
                )) : (
                  <li className="text-xs text-cloud-600">Not yet assessed</li>
                )}
              </ul>
            </div>
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-coral-400 uppercase tracking-wider mb-3">
                To improve
              </h3>
              <ul className="space-y-1.5">
                {weaknesses.length > 0 ? weaknesses.map((w, i) => (
                  <li key={i} className="text-xs text-cloud-300 flex items-start gap-1.5">
                    <span className="text-coral-400 mt-0.5">→</span>{w}
                  </li>
                )) : (
                  <li className="text-xs text-cloud-600">Not yet assessed</li>
                )}
              </ul>
            </div>
          </motion.div>
        )}

        {/* CTA — take assessment */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-violet-500/10 border border-violet-500/30 rounded-2xl p-5 flex items-center gap-4"
        >
          <span className="text-3xl">🎯</span>
          <div className="flex-1">
            <p className="font-semibold text-cloud-100 text-sm">Take a level assessment</p>
            <p className="text-xs text-cloud-400 mt-0.5">Get your CEFR score and personalized recommendations</p>
          </div>
          <a
            href="/"
            className="flex-shrink-0 bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
            onClick={() => {
              sessionStorage.setItem('autoMessage', 'Test me and evaluate my English level. I will write a few sentences so you can assess me.')
            }}
          >
            Start
          </a>
        </motion.div>

      </div>
    </div>
  )
}
