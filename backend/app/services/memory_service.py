from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.models.session import Message, ChatSession


async def ensure_session(
    session_id: str,
    user_id: str,
    db: AsyncSession
):
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    chat_session = result.scalar_one_or_none()

    if not chat_session:
        chat_session = ChatSession(
            session_id=session_id,
            user_id=user_id
        )
        db.add(chat_session)
        await db.commit()

    return chat_session


async def add_message(
    session_id: str,
    user_id: str,
    role: str,
    content: str,
    db: AsyncSession
):
    await ensure_session(session_id, user_id, db)

    message = Message(
        session_id=session_id,
        user_id=user_id,
        role=role,
        content=content
    )
    db.add(message)

    # Update session timestamp
    result = await db.execute(
        select(ChatSession).where(ChatSession.session_id == session_id)
    )
    chat_session = result.scalar_one_or_none()
    if chat_session:
        chat_session.updated_at = datetime.now()
        db.add(chat_session)

    await db.commit()
    return message


async def get_conversation_history(
    session_id: str,
    user_id: str,
    db: AsyncSession,
    limit: int = 20
) -> list[Message]:

    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .where(Message.user_id == user_id)
        .order_by(Message.timestamp.desc())
        .limit(limit)
    )
    messages = result.scalars().all()
    # Return in chronological order
    return list(reversed(messages))


def format_history_for_prompt(messages: list[Message]) -> str:
    if not messages:
        return "No previous messages."

    lines = []
    for msg in messages:
        role_label = "Student" if msg.role == "user" else "Tutor"
        lines.append(f"{role_label}: {msg.content}")

    return "\n".join(lines)
