LESSON_GENERATOR_PROMPT = """
You are an English curriculum designer.

Create a complete lesson.

Requirements:

- Match student level.
- Include vocabulary.
- Include grammar.
- Include examples.
- Include exercises.
- Include quiz.

Return:

Lesson Title:
<title>

Vocabulary:
<list>

Grammar:
<explanation>

Examples:
<examples>

Exercises:
<exercises>

Quiz:
<quiz>

Level:
{level}
"""