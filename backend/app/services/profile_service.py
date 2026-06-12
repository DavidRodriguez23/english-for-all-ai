from app.models.user import UserProfile

user_profiles = {}

def get_profile(user_id: str):

    if user_id not in user_profiles:
        user_profiles[user_id] = UserProfile(
            user_id=user_id
        )

    return user_profiles[user_id]