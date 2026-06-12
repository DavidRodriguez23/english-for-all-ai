# English For All AI — Backend v2.0

Free, open-source English learning platform powered by local AI. No ads, no subscriptions, no data sent to the cloud.

## What changed in v2.0

| Area | Before | After |
|------|--------|-------|
| Persistence | In-memory dict (lost on restart) | SQLite via SQLModel |
| HTTP client | `requests` (sync, blocking) | `httpx` (async) |
| FastAPI | Sync endpoints | Fully async |
| Prompts | Placeholders never filled (`{level}` sent to LLM) | All placeholders correctly resolved |
| Intent router | Naive keyword match (wrong priority) | Priority-ordered rules |
| Profile updater | Basic regex | Smarter extraction with false-positive guard |

## Requirements

- Python 3.11+
- [Ollama](https://ollama.com) running locally with a model pulled

```bash
ollama pull llama3.2        # default model
# or better:
ollama pull mistral         # recommended for English tutoring
ollama pull llama3.1:8b     # best quality/speed balance
```

## Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the env file and adjust if needed:
```bash
cp .env.example .env
```

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

## API Endpoints

### POST /api/chat
```json
{
  "session_id": "unique-session-id",
  "user_id": "unique-user-id",
  "message": "What does ephemeral mean?",
  "level": "B1"
}
```

Response:
```json
{
  "response": "Great question! Ephemeral means...",
  "history_count": 5,
  "profile_updated": false
}
```

### GET /api/profile/{user_id}
Returns the persisted user profile.

### GET /api/history/{session_id}/{user_id}
Returns the full conversation history for a session.

## Supported intents (auto-detected)

The tutor automatically routes each message to the right module:

| Intent | Triggers |
|--------|---------|
| `conversation` | General chat (default) |
| `grammar` | "correct this", "fix my sentence", "grammar" |
| `vocabulary` | "what does X mean", "definition of" |
| `pronunciation` | "how to pronounce", "accent", "IPA" |
| `listening` | "listening exercise", "comprehension" |
| `speaking` | "speaking practice", "speaking topic" |
| `roleplay` | "roleplay", "at the restaurant", "job interview" |
| `assessment` | "test me", "assess my English", "what level am I" |
| `lesson_generator` | "teach me", "create a lesson", "learning plan" |
| `adaptive_learning` | "what should I improve", "my weaknesses" |

## Project structure

```
backend/
├── app/
│   ├── db/
│   │   └── database.py          # SQLite engine + session factory
│   ├── models/
│   │   ├── user.py              # UserProfile (persisted)
│   │   └── session.py           # Message + ChatSession (persisted)
│   ├── prompts/
│   │   ├── conversation_prompt.py
│   │   ├── grammar_prompt.py
│   │   ├── vocabulary_prompt.py
│   │   ├── pronunciation_prompt.py
│   │   ├── listening_prompt.py
│   │   ├── speaking_prompt.py
│   │   ├── roleplay_prompt.py
│   │   ├── assessment_prompt.py
│   │   ├── lesson_generator_prompt.py
│   │   └── adaptive_learning_prompt.py
│   ├── routes/
│   │   └── chat.py              # /api/chat, /api/profile, /api/history
│   ├── services/
│   │   ├── llm_service.py       # Async Ollama client
│   │   ├── memory_service.py    # Async conversation persistence
│   │   ├── profile_service.py   # Async user profile CRUD
│   │   ├── profile_updater.py   # Extract profile info from messages
│   │   ├── prompt_manager.py    # Fill all prompt placeholders
│   │   └── prompt_router.py     # Priority-based intent detection
│   └── main.py                  # FastAPI app + CORS + DB init
├── requirements.txt
└── .env
```

## Roadmap

- [ ] Frontend: React + Vite + PWA
- [ ] Speech-to-text: Whisper integration
- [ ] Text-to-speech: Coqui TTS / piper-tts
- [ ] Pronunciation scoring: wav2vec2
- [ ] Spaced repetition vocabulary system
- [ ] Progress dashboard
- [ ] Multi-language UI (Spanish, Portuguese, French)
