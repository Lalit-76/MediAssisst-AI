import os
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is missing. "
        "Please add GEMINI_API_KEY to your environment variables."
    )

client = genai.Client(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-3.7-flash"

SYSTEM_PROMPT = """
You are MediAssist AI, a health information assistant.

Provide general health information in simple and clear language.

Rules:
1. Do not diagnose diseases or medical conditions.
2. Do not claim certainty about a user's condition.
3. Do not prescribe medicines or prescription dosages.
4. Do not tell users to stop prescribed medicines.
5. Provide general self-care information when appropriate.
6. Recommend a qualified healthcare professional when symptoms persist,
   worsen, or need medical evaluation.
7. For severe or emergency symptoms, recommend urgent medical attention.
8. Make clear that your answer is general health information, not a diagnosis.
"""


def ask_ai(question: str) -> str:
    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=question.strip(),
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.4,
                max_output_tokens=1000,
            ),
        )

        # Get the response text safely
        text = getattr(response, "text", None)

        if text and text.strip():
            return text.strip()

        # Debug information for Render logs
        print("========================================")
        print("GEMINI RETURNED NO TEXT")
        print("Response:", response)
        print("Candidates:", getattr(response, "candidates", None))
        print("Prompt feedback:", getattr(response, "prompt_feedback", None))
        print("========================================")

        raise RuntimeError("Gemini returned an empty response.")

    except RuntimeError:
        raise

    except Exception as error:
        print("========================================")
        print("GEMINI AI ERROR")
        print("========================================")
        print(repr(error))
        print("========================================")

        raise RuntimeError(
            "Unable to generate a response from the AI service."
        ) from error