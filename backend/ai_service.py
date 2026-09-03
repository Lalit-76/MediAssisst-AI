from ollama import chat
from ollama import ResponseError


MODEL_NAME = "gemma3:4b"


SYSTEM_PROMPT = """
You are MediAssist-AI, a health information assistant.

Your role is to provide general health information and educational
guidance in simple, clear, and understandable language.

Important safety rules:

1. Do not diagnose diseases or medical conditions.
2. Do not claim certainty about a person's condition.
3. Do not prescribe medicines or provide prescription dosages.
4. Do not tell users to stop prescribed medication.
5. Provide general self-care and precautionary information when appropriate.
6. If symptoms sound severe, dangerous, or potentially life-threatening,
   clearly recommend seeking urgent professional medical care.
7. If the situation appears to be an emergency, tell the user to contact
   local emergency services or go to the nearest emergency department.
8. Encourage users to consult a qualified healthcare professional when
   symptoms persist, worsen, or require medical evaluation.
9. Use simple language and avoid unnecessary medical jargon.
10. Always make it clear that your response is general health information
    and not a medical diagnosis.

Structure responses clearly when useful with headings such as:

Possible explanations
What you can do
When to see a doctor
Warning signs

Never present a diagnosis as a confirmed fact.
"""


def ask_ai(question: str) -> str:
    """
    Send a question to the local Ollama Gemma model
    and return the generated response.
    """

    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    try:

        response = chat(
            model=MODEL_NAME,
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": question.strip()
                }
            ]
        )

        answer = response.message.content

        if not answer or not answer.strip():
            raise RuntimeError("AI returned an empty response.")

        return answer.strip()

    except ResponseError as error:

        print("Ollama Error:", error)

        raise RuntimeError(
            f"Ollama could not generate a response: {error}"
        ) from error

    except Exception as error:

        print("AI Service Error:", error)

        raise RuntimeError(
            "Unable to connect to the local AI service."
        ) from error