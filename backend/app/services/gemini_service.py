"""
Gemini AI Service — Cleans OCR output and extracts structured medicine data.
Uses the new google-genai SDK (google.genai package).
Converts medical terminology into simple language for elderly users.
"""
import json
import logging
import re
import os
from google import genai
from google.genai import types

logger = logging.getLogger("gemini_service")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDc8MOZ7XqMkDDF74WyyAMcmTZcPbCqdn8")

_client = None

def get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


MODEL = "models/gemini-2.5-flash-lite"

EXTRACTION_PROMPT = """
You are a pharmacist AI assistant. I will give you raw OCR text extracted from a medicine image (tablet strip, bottle, package, or prescription).

OCR TEXT:
{ocr_text}

Your tasks:
1. Identify the medicine brand name (if visible)
2. Identify the generic/chemical medicine name
3. Identify dosage (e.g. 500mg, 10mg)
4. Identify medicine type (tablet, capsule, syrup, injection, etc.)
5. Estimate confidence in your extraction (high/medium/low)
6. Clean any OCR garbled text

Return ONLY valid JSON in this exact format, no markdown code blocks, no extra text:
{{
  "medicine_name": "brand name or best guess from text",
  "generic_name": "generic/chemical name",
  "dosage": "e.g. 500mg or unknown",
  "medicine_type": "tablet/capsule/syrup/injection/cream/unknown",
  "confidence": "high/medium/low",
  "cleaned_text": "cleaned version of the OCR text"
}}
"""

EXPLANATION_PROMPT = """
You are a caring pharmacist explaining medicine information to an elderly patient in very simple, friendly language.
Do NOT use complicated medical words. Explain like you are talking to someone's grandmother.

Medicine Information:
- Brand Name: {medicine_name}
- Generic Name: {generic_name}
- Uses: {uses}
- Side Effects: {side_effects}
- Warnings: {warnings}
- Dosage: {dosage}

Write a SHORT (4-5 sentences max), warm, simple explanation that covers:
1. What this medicine does (in very simple terms)
2. One key thing to remember when taking it
3. One important warning if any

Return ONLY the plain text explanation, no JSON, no bullet points, no markdown.
"""


async def extract_medicine_info_from_ocr(ocr_text: str) -> dict:
    """Call Gemini to parse OCR text and return structured medicine data."""
    try:
        client = get_client()
        prompt = EXTRACTION_PROMPT.format(ocr_text=ocr_text)

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.1)
        )

        raw = response.text.strip()

        # Strip markdown code fences if present
        raw = re.sub(r'^```json\s*', '', raw, flags=re.MULTILINE)
        raw = re.sub(r'^```\s*', '', raw, flags=re.MULTILINE)
        raw = re.sub(r'\s*```$', '', raw)

        data = json.loads(raw)
        logger.info(f"Gemini extracted: {data.get('medicine_name')} / {data.get('generic_name')}")
        return data

    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned invalid JSON: {e}")
        return {
            "medicine_name": "Unknown",
            "generic_name": "Unknown",
            "dosage": "Unknown",
            "medicine_type": "Unknown",
            "confidence": "low",
            "cleaned_text": ocr_text
        }
    except Exception as e:
        logger.error(f"Gemini API error: {e}", exc_info=True)
        raise RuntimeError(f"Gemini AI processing failed: {str(e)}")


async def generate_simple_explanation(
    medicine_name: str,
    generic_name: str,
    uses: str,
    side_effects: str,
    warnings: str,
    dosage: str
) -> str:
    """Generate a plain-language explanation for elderly users using Gemini."""
    try:
        client = get_client()
        prompt = EXPLANATION_PROMPT.format(
            medicine_name=medicine_name,
            generic_name=generic_name,
            uses=uses,
            side_effects=side_effects,
            warnings=warnings,
            dosage=dosage
        )

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.7)
        )
        return response.text.strip()
    except Exception as e:
        logger.error(f"Gemini explanation generation failed: {e}")
        return f"{medicine_name} is a medicine. Please consult your doctor or pharmacist for more information."
