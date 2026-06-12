from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.database import init_db
from app.routes.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize the database tables
    await init_db()
    print("✅ Database initialized")
    yield
    # Shutdown: nothing to clean up for SQLite


app = FastAPI(
    title="English For All AI",
    version="2.0.0",
    description="Free, open-source English learning platform powered by local AI",
    lifespan=lifespan
)

# CORS — allow the frontend (React dev server + production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative dev port
        "http://127.0.0.1:5173",
    ],
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
