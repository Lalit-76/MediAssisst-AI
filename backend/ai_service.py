import os
import time

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

PRIMARY_MODEL = "gemini-3.7-flash"
FALLBACK_MODEL = "gemini-3.6-flash"

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


def generate_with_model(model_name: str, question: str) -> str:
    response = client.models.generate_content(
        model=model_name,
        contents=question.strip(),
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=0.4,
            max_output_tokens=1000,
        ),
    )

    text = getattr(response, "text", None)

    if text and text.strip():
        return text.strip()

    raise RuntimeError(
        f"{model_name} returned an empty response."
    )


def ask_ai(question: str) -> str:
    if not question or not question.strip():
        raise ValueError("Question cannot be empty.")

    question = question.strip()

    # ----------------------------------------------------------
    # TRY PRIMARY MODEL
    # ----------------------------------------------------------

    primary_delays = [2, 5, 10]

    for attempt, delay in enumerate(primary_delays, start=1):
        try:
            return generate_with_model(
                PRIMARY_MODEL,
                question
            )

        except Exception as error:
            error_text = str(error)

            print("========================================")
            print(
                f"GEMINI PRIMARY MODEL ERROR "
                f"(attempt {attempt})"
            )
            print(error_text)
            print("========================================")

            # Retry only for temporary service/rate errors
            temporary_error = any(
                code in error_text
                for code in (
                    "503",
                    "UNAVAILABLE",
                    "429",
                    "RESOURCE_EXHAUSTED",
                    "Too Many Requests",
                    "high demand",
                )
            )

            if not temporary_error:
                break

            if attempt < len(primary_delays):
                time.sleep(delay)

    # ----------------------------------------------------------
    # FALLBACK MODEL
    # ----------------------------------------------------------

    fallback_delays = [2, 5]

    for attempt, delay in enumerate(
        fallback_delays,
        start=1
    ):
        try:
            print(
                f"Trying fallback model: "
                f"{FALLBACK_MODEL}"
            )

            return generate_with_model(
                FALLBACK_MODEL,
                question
            )

        except Exception as error:
            error_text = str(error)

            print("========================================")
            print(
                f"GEMINI FALLBACK ERROR "
                f"(attempt {attempt})"
            )
            print(error_text)
            print("========================================")

            temporary_error = any(
                code in error_text
                for code in (
                    "503",
                    "UNAVAILABLE",
                    "429",
                    "RESOURCE_EXHAUSTED",
                    "Too Many Requests",
                    "high demand",
                )
            )

            if not temporary_error:
                break

            if attempt < len(fallback_delays):
                time.sleep(delay)

    # ----------------------------------------------------------
    # FINAL ERROR
    # ----------------------------------------------------------

    raise RuntimeError(
        "Unable to generate a response from the AI service "
        "after retrying the primary model and fallback model."
    )