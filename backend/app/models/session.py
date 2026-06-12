from pydantic import BaseModel, Field
from typing import List

from app.models.message import Message


class ChatSession(BaseModel):

    session_id: str

    user_id: str

    messages: List[Message] = Field(
        default_factory=list
    )