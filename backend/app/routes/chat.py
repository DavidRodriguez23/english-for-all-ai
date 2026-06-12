from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
import traceback

from app.db.database import get_session
from app.services.llm_service import generate_tutor_response
from app.services.memory_service import (
    add_message,
    get_conversation_history,
    format_history_for_prompt,
)
from app.services.profile_service import get_or_create_profile, save_profile
from app.services.profile_updater import update_profile_from_message

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str
    user_id: str
    message: str
    level: str = "beginner"


class ChatResponse(BaseModel):
    response: str
    intent: str | None = None
    history_count: int = 0
    profile_updated: bool = False


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_session)
):
    try:
        # 1. Load persistent user profile
        profile = await get_or_create_profile(request.user_id, db)

        # 2. Update profile from what the user said
        profile, profile_changed = update_profile_from_message(
            profile, request.message
        )
        if profile_changed:
            await save_profile(profile, db)

        # 3. Persist user message
        await add_message(
            request.session_id,
            request.user_id,
            role="user",
            content=request.message,
            db=db
        )

        # 4. Load conversation history and format for prompt
        history_messages = await get_conversation_history(
            request.session_id,
            request.user_id,
            db=db,
            limit=20
        )
        history_text = format_history_for_prompt(history_messages)

        # 5. Generate LLM response
        response_text = await generate_tutor_response(
            message=request.message,
            level=request.level or profile.english_level,
            profile=profile,
            history=history_text,
        )

        # 6. Persist assistant response
        await add_message(
            request.session_id,
            request.user_id,
            role="assistant",
            content=response_text,
            db=db
        )

        return ChatResponse(
            response=response_text,
            history_count=len(history_messages),
            profile_updated=profile_changed,
        )

    except Exception as e:
        print("\n========= ERROR =========")
        traceback.print_exc()
        print("=========================\n")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/{user_id}")
async def get_profile(
    user_id: str,
    db: AsyncSession = Depends(get_session)
):
    profile = await get_or_create_profile(user_id, db)
    return profile


@router.get("/history/{session_id}/{user_id}")
async def get_history(
    session_id: str,
    user_id: str,
    db: AsyncSession = Depends(get_session)
):
    messages = await get_conversation_history(session_id, user_id, db)
    return {
        "session_id": session_id,
        "message_count": len(messages),
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp.isoformat()
            }
            for m in messages
        ]
    }
