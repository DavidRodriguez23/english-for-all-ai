from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import traceback

from app.services.llm_service import generate_tutor_response

from app.services.memory_service import (
    add_user_message,
    add_assistant_message,
    get_conversation_history
)

from app.services.profile_service import get_profile

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str
    user_id: str
    message: str
    level: str


@router.post("/chat")
def chat(request: ChatRequest):

    try:

        profile = get_profile(request.user_id)

        print(profile)

        add_user_message(
            request.session_id,
            request.user_id,
            request.message
        )

        history = get_conversation_history(
            request.session_id,
            request.user_id
        )

        conversation_context = ""

        for msg in history:
            conversation_context += (
                f"{msg.role}: {msg.content}\n"
            )

        response = generate_tutor_response(
             conversation_context,
             request.level,
             profile
        )

        add_assistant_message(
            request.session_id,
            request.user_id,
            response
        )

        return {
            "response": response,
            "history_count": len(history)
        }

    except Exception as e:

        print("\n========= ERROR =========")
        traceback.print_exc()
        print("=========================\n")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )