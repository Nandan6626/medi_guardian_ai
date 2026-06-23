"""
Gemini AI Service — Optimized: single combined prompt for BOTH extraction AND explanation.
One API call instead of two → ~50% faster.
"""
import json
import logging
import re
import os
from typing import Any

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

logger = logging.getLogger("gemini_service")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
MODEL = "models/gemini-2.5-flash-lite"

_client = None


def get_client() -> Any:
    global _client
    if genai is None:
        raise RuntimeError("Google GenAI SDK is not installed.")
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured.")
    if _client is None:
        _client = genai.Client(api_key=GEMINI_API_KEY)
    return _client


# ── Single combined prompt: extraction + explanation in one shot ────────────
COMBINED_PROMPT = """
You are a pharmacist AI assistant. Analyze this OCR text from a medicine image and return ONLY valid JSON.

OCR TEXT:
{ocr_text}

Return a single JSON object with these exact keys (no markdown, no code fences):
{{
  "medicine_name": "brand name or best guess",
  "generic_name": "generic/chemical name",
  "dosage": "e.g. 500mg or unknown",
  "medicine_type": "tablet/capsule/syrup/injection/cream/unknown",
  "confidence": "high/medium/low",
  "cleaned_text": "cleaned OCR text",
  "simple_explanation": "2-3 sentence explanation in very simple, friendly language for an elderly person — what this medicine does, when to take it, and one key warning. No medical jargon."
}}
"""


async def analyze_medicine_from_ocr(ocr_text: str) -> dict:
    """
    Single Gemini call that returns BOTH structured extraction AND simple explanation.
    Previously two separate calls — now combined for ~50% speed improvement.
    """
    try:
        if genai is None or types is None:
            raise RuntimeError(
                "Gemini integration is unavailable in this environment.")
        client = get_client()
        prompt = COMBINED_PROMPT.format(ocr_text=ocr_text)

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.1,
                max_output_tokens=600,   # Limit tokens → faster response
            )
        )

        raw = response.text.strip()

        # Strip any accidental markdown fences
        raw = re.sub(r'^```json\s*', '', raw, flags=re.MULTILINE)
        raw = re.sub(r'^```\s*', '', raw, flags=re.MULTILINE)
        raw = re.sub(r'\s*```$', '', raw)

        data = json.loads(raw)
        logger.info(
            f"Gemini: {data.get('medicine_name')} / {data.get('generic_name')} [{data.get('confidence')}]")
        return data

    except json.JSONDecodeError as e:
        logger.error(f"Gemini returned invalid JSON: {e}")
        return {
            "medicine_name": "Unknown",
            "generic_name": "Unknown",
            "dosage": "Unknown",
            "medicine_type": "Unknown",
            "confidence": "low",
            "cleaned_text": ocr_text,
            "simple_explanation": "We could not identify this medicine. Please consult your doctor or pharmacist."
        }
    except Exception as e:
        logger.error(f"Gemini API error: {e}", exc_info=True)
        raise RuntimeError(f"Gemini AI processing failed: {str(e)}")


# Keep old function signatures for compatibility
async def extract_medicine_info_from_ocr(ocr_text: str) -> dict:
    """Alias — calls combined prompt and returns extraction fields."""
    return await analyze_medicine_from_ocr(ocr_text)


async def generate_simple_explanation(*args, **kwargs) -> str:
    """Deprecated — explanation is now included in extract_medicine_info_from_ocr."""
    return "Please use analyze_medicine_from_ocr for combined extraction + explanation."
