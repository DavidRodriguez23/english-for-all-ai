from pydantic import BaseModel, Field
from datetime import datetime


class Message(BaseModel):
    role: str
    content: str

    timestamp: datetime = Field(
        default_factory=datetime.now
    )