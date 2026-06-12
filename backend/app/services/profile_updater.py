import re
from app.models.user import UserProfile


def update_profile_from_message(
    profile: UserProfile,
    message: str
) -> tuple[UserProfile, bool]:
    """
    Parse the user's message for profile signals and update
    the profile accordingly.

    Returns (updated_profile, was_changed).
    """
    text = message.lower().strip()
    changed = False

    # Extract name
    name_patterns = [
        r"my name is ([A-Za-záéíóúñ]+)",
        r"i'm ([A-Za-záéíóúñ]+)",
        r"call me ([A-Za-záéíóúñ]+)",
    ]
    for pattern in name_patterns:
        match = re.search(pattern, message, re.IGNORECASE)
        if match and not profile.name:
            candidate = match.group(1).strip().title()
            # Avoid false positives like "I'm a beginner"
            if len(candidate) > 1 and candidate.lower() not in {
                "a", "an", "the", "learning", "trying", "going",
                "beginner", "intermediate", "advanced"
            }:
                profile.name = candidate
                changed = True
                break

    # Extract learning goal
    goal_map = {
        "job interview": "job interview",
        "business english": "business english",
        "business meeting": "business english",
        "travel": "travel",
        "travelling": "travel",
        "academic": "academic english",
        "ielts": "academic english",
        "toefl": "academic english",
        "daily conversation": "daily conversation",
        "everyday english": "daily conversation",
    }
    for keyword, goal in goal_map.items():
        if keyword in text:
            profile.learning_goal = goal
            changed = True
            break

    # Extract English level
    level_map = {
        "complete beginner": "beginner",
        "total beginner": "beginner",
        "beginner": "beginner",
        "elementary": "beginner",
        "a1": "beginner",
        "a2": "elementary",
        "intermediate": "intermediate",
        "b1": "intermediate",
        "b2": "upper-intermediate",
        "upper intermediate": "upper-intermediate",
        "advanced": "advanced",
        "c1": "advanced",
        "c2": "proficient",
        "fluent": "proficient",
    }
    for keyword, level in level_map.items():
        if keyword in text:
            profile.english_level = level
            changed = True
            break

    return profile, changed
