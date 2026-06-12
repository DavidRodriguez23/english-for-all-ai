from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import UserProfile


async def get_or_create_profile(
    user_id: str,
    session: AsyncSession
) -> UserProfile:

    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = UserProfile(user_id=user_id)
        session.add(profile)
        await session.commit()
        await session.refresh(profile)

    return profile


async def save_profile(
    profile: UserProfile,
    session: AsyncSession
) -> UserProfile:

    session.add(profile)
    await session.commit()
    await session.refresh(profile)
    return profile
