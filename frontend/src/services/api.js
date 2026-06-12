const BASE_URL = '/api'

export const api = {
  async chat({ sessionId, userId, message, level }) {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        user_id: userId,
        message,
        level,
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.detail || 'Something went wrong. Please try again.')
    }
    return res.json()
  },

  async getProfile(userId) {
    const res = await fetch(`${BASE_URL}/profile/${userId}`)
    if (!res.ok) throw new Error('Could not load profile.')
    return res.json()
  },

  async getHistory(sessionId, userId) {
    const res = await fetch(`${BASE_URL}/history/${sessionId}/${userId}`)
    if (!res.ok) throw new Error('Could not load history.')
    return res.json()
  },
}
