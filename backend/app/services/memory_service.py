from app.models.session import ChatSession
from app.models.message import Message

conversation_store = {}


def get_session(session_id: str, user_id: str):

    if session_id not in conversation_store:

        conversation_store[session_id] = ChatSession(
            session_id=session_id,
            user_id=user_id
        )

    return conversation_store[session_id]


def add_user_message(
    session_id: str,
    user_id: str,
    content: str
):

    session = get_session(session_id, user_id)

    session.messages.append(
        Message(
            role="user",
            content=content
        )
    )


def add_assistant_message(
    session_id: str,
    user_id: str,
    content: str
):

    session = get_session(session_id, user_id)

    session.messages.append(
        Message(
            role="assistant",
            content=content
        )
    )


def get_conversation_history(
    session_id: str,
    user_id: str
):

    session = get_session(session_id, user_id)

    return session.messages