from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.db.database import init_db
from app.routes.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("✅ Database initialized")
    yield


app = FastAPI(
    title="English For All AI",
    version="2.0.0",
    description="Free, open-source English learning platform powered by local AI",
    lifespan=lifespan
)

# CORS — allow frontend origins
# FRONTEND_URL env var lets you add any domain without redeploying
FRONTEND_URL = os.getenv("FRONTEND_URL", "")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://english-for-all-ai.vercel.app",
    "https://english-for-all-ai-production.up.railway.app",
]

if FRONTEND_URL:
    origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")


@app.get("/")
async def root():
    return {
        "name": "English For All AI",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
