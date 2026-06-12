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


def get_prompt(intent: str):

    prompts = {
    "conversation": CONVERSATION_PROMPT,
    "grammar": GRAMMAR_PROMPT,
    "vocabulary": VOCABULARY_PROMPT,
    "roleplay": ROLEPLAY_PROMPT,
    "pronunciation": PRONUNCIATION_PROMPT,
    "listening": LISTENING_PROMPT,
    "speaking": SPEAKING_PROMPT,
    "assessment": ASSESSMENT_PROMPT,
    "lesson_generator": LESSON_GENERATOR_PROMPT,
    "adaptive_learning": ADAPTIVE_LEARNING_PROMPT
}

    return prompts.get(
        intent,
        CONVERSATION_PROMPT
    )