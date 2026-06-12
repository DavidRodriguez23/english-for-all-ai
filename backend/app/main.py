from fastapi import FastAPI
from app.routes.chat import router as chat_router

app = FastAPI(
    title="English For All AI",
    version="1.0.0"
)

app.include_router(chat_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "English For All AI"
    }