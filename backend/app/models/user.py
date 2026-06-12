from sqlmodel import SQLModel, Field
from typing import Optional
import json


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    user_id: str = Field(primary_key=True)

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

    # JSON arrays stored as strings in SQLite
    strengths_json: str = Field(default="[]")
    weaknesses_json: str = Field(default="[]")

    completed_lessons: int = 0

    def get_strengths(self) -> list[str]:
        return json.loads(self.strengths_json or "[]")

    def set_strengths(self, value: list[str]):
        self.strengths_json = json.dumps(value)

    def get_weaknesses(self) -> list[str]:
        return json.loads(self.weaknesses_json or "[]")

    def set_weaknesses(self, value: list[str]):
        self.weaknesses_json = json.dumps(value)

    def to_context_string(self) -> str:
        strengths = self.get_strengths()
        weaknesses = self.get_weaknesses()
        return f"""Student Profile:
- Name: {self.name or 'Unknown'}
- Age: {self.age or 'Unknown'}
- Native Language: {self.native_language}
- English Level: {self.english_level}
- Learning Goal: {self.learning_goal}
- Grammar Score: {self.grammar_score}/100
- Vocabulary Score: {self.vocabulary_score}/100
- Completed Lessons: {self.completed_lessons}
- Strengths: {', '.join(strengths) or 'Not yet assessed'}
- Weaknesses: {', '.join(weaknesses) or 'Not yet assessed'}"""
