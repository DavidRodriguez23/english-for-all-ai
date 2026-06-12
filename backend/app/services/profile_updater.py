import re

def update_profile(profile, message: str):

    text = message.lower()

    name_match = re.search(
        r"my name is ([a-zA-Z]+)",
        message,
        re.IGNORECASE
    )

    if name_match:
        profile.name = name_match.group(1)

    if "job interview" in text:
        profile.learning_goal = "job interview"

    if "business english" in text:
        profile.learning_goal = "business english"

    if "travel english" in text:
        profile.learning_goal = "travel"

    if "beginner" in text:
        profile.english_level = "beginner"

    if "intermediate" in text:
        profile.english_level = "intermediate"

    if "advanced" in text:
        profile.english_level = "advanced"

    return profile