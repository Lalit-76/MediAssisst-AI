import os

from dotenv import load_dotenv
from google import genai
from google.genai import types


# ============================================================
# ENVIRONMENT VARIABLES
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. "
        "Please add GEMINI_API_KEY to backend/.env"
    )


# ============================================================
# GEMINI CLIENT
# ============================================================

client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "gemini-3.7-flash"


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are MediAssist AI, a health information assistant.

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


# ============================================================
# ASK AI
# ============================================================

def ask_ai(question: str) -> str:
    """
    Send a question to Gemini and return the generated response.
    """

    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=question.strip(),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=1000
            )
        )

        answer = response.text

        if not answer or not answer.strip():
            raise RuntimeError(
                "Gemini returned an empty response."
            )

        return answer.strip()

    except Exception as error:
        print("========================================")
        print("GEMINI AI ERROR")
        print("========================================")
        print(repr(error))
        print("========================================")

        raise RuntimeError(
            "Unable to generate a response from the AI service."
        ) from error