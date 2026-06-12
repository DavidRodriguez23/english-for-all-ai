# English For All — Frontend

React + Vite + Tailwind CSS. Mobile-first, PWA-ready.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Requires the backend running on port 8000. The Vite dev server proxies `/api` automatically.

## Build for production

```bash
npm run build
# Output goes to dist/
```

## Stack

- **React 18** — UI
- **Vite** — build tool, HMR, dev proxy
- **Tailwind CSS** — styling
- **Framer Motion** — animations
- **Zustand** — global state (persisted to localStorage)
- **vite-plugin-pwa** — installable on mobile

## Structure

```
src/
├── components/
│   ├── ChatBubble.jsx      # Message bubbles with smart formatting
│   ├── ChatInput.jsx       # Auto-resize textarea + send button
│   ├── ErrorBanner.jsx     # Dismissible error notification
│   ├── Header.jsx          # App bar with level selector
│   ├── LevelSelector.jsx   # CEFR level dropdown
│   ├── QuickActions.jsx    # Suggestion chips for empty chat
│   └── TypingIndicator.jsx # Animated dots while AI responds
├── hooks/
│   └── useChat.js          # Send message, manage loading/error state
├── pages/
│   └── ChatPage.jsx        # Main chat screen
├── services/
│   └── api.js              # Fetch calls to FastAPI backend
├── store/
│   └── useStore.js         # Zustand store (userId, level, messages)
├── App.jsx
├── main.jsx
└── index.css
```

## Design system

Dark night theme (`#0F0E17`) with electric violet (`#6C63FF`) as primary and mint (`#4ECDC4`) for success states. Inter for body text, Plus Jakarta Sans for display. All animations use Framer Motion with reduced-motion support.
