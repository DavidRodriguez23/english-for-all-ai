from app.models.user import UserProfile

from app.prompts.conversation_prompt import CONVERSATION_PROMPT
from app.prompts.grammar_prompt import GRAMMAR_PROMPT
from app.prompts.vocabulary_prompt import VOCABULARY_PROMPT
from app.prompts.roleplay_prompt import ROLEPLAY_PROMPT
from app.prompts.pronunciation_prompt import PRONUNCIATION_PROMPT
from app.prompts.listening_prompt import LISTENING_PROMPT
from app.prompts.speaking_prompt import SPEAKING_PROMPT
from app.prompts.assessment_prompt import ASSESSMENT_PROMPT
from app.prompts.lesson_generator_prompt import LESSON_GENERATOR_PROMPT
from app.prompts.adaptive_learning_prompt import ADAPTIVE_LEARNING_PROMPT


def _detect_scenario(message: str) -> str:
    """Extract a roleplay scenario from the user message."""
    text = message.lower()
    scenarios = {
        "restaurant": "Restaurant — ordering food and drinks",
        "airport": "Airport — check-in, security, boarding",
        "hotel": "Hotel — check-in, room service, complaints",
        "doctor": "Doctor's office — describing symptoms, asking questions",
        "interview": "Job interview — professional English",
        "shop": "Shopping — asking for help, prices, returns",
        "bank": "Bank — opening an account, transactions",
    }
    for keyword, scenario in scenarios.items():
        if keyword in text:
            return scenario
    return "General English conversation practice"


def build_prompt(
    intent: str,
    message: str,
    level: str,
    profile: UserProfile,
    history: str = ""
) -> str:
    """
    Return the fully formatted prompt for the given intent.
    Every placeholder is filled — nothing reaches the LLM as {variable}.
    """

    profile_context = profile.to_context_string()

    # Each intent gets exactly the variables its template uses
    templates = {
        "conversation": lambda: CONVERSATION_PROMPT.format(
            level=level,
            history=history or "This is the start of the conversation.",
            message=message,
        ),
        "grammar": lambda: GRAMMAR_PROMPT.format(
            level=level,
            message=message,
        ),
        "vocabulary": lambda: VOCABULARY_PROMPT.format(
            level=level,
            message=message,
        ),
        "pronunciation": lambda: PRONUNCIATION_PROMPT.format(
            level=level,
            message=message,
        ),
        "listening": lambda: LISTENING_PROMPT.format(
            level=level,
            message=message,
        ),
        "speaking": lambda: SPEAKING_PROMPT.format(
            level=level,
            message=message,
        ),
        "assessment": lambda: ASSESSMENT_PROMPT.format(
            message=message,
        ),
        "lesson_generator": lambda: LESSON_GENERATOR_PROMPT.format(
            level=level,
            message=message,
        ),
        "adaptive_learning": lambda: ADAPTIVE_LEARNING_PROMPT.format(
            profile=profile_context,
            history=history or "No conversation history yet.",
            message=message,
        ),
        "roleplay": lambda: ROLEPLAY_PROMPT.format(
            scenario=_detect_scenario(message),
            level=level,
            message=message,
        ),
    }

    builder = templates.get(intent, templates["conversation"])
    filled_prompt = builder()

    # Append profile context to every prompt so the model
    # always knows who it's talking to
    return f"{filled_prompt}\n\n---\n{profile_context}"
