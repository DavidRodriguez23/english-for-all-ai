from pydantic import BaseModel, Field
from typing import Optional

class UserProfile(BaseModel):
    user_id: str

    name: Optional[str] = None
    age: Optional[int] = None

    native_language: str = "Spanish"
    english_level: str = "beginner"
    learning_goal: str = "general"

    grammar_score: int = 0
    vocabulary_score: int = 0
    pronunciation_score: int = 0
    listening_score: int = 0
    speaking_score: int = 0

    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)

    completed_lessons: int = 0