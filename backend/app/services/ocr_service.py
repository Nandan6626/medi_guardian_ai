"""
OCR Service — Uses EasyOCR to extract text from medicine images.
Supports blurry strips, rotated text, and prescription images.
"""
import io
import logging
from typing import Optional
from PIL import Image, ImageEnhance, ImageFilter
import easyocr

logger = logging.getLogger("ocr_service")

# Lazy-load reader (expensive to init; reuse across requests)
_reader: Optional[easyocr.Reader] = None

def get_reader() -> easyocr.Reader:
    global _reader
    if _reader is None:
        logger.info("Initializing EasyOCR reader (first-time load, may take ~10s)...")
        _reader = easyocr.Reader(
            ['en'],
            gpu=False,
            model_storage_directory='/tmp/easyocr_models',
            download_enabled=True
        )
        logger.info("EasyOCR reader ready.")
    return _reader


def preprocess_image(image_bytes: bytes) -> bytes:
    """Enhance image before OCR for better accuracy on blurry/dark medicine strips."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")

        # Resize if very small (OCR works better on larger images)
        w, h = img.size
        if w < 800:
            scale = 800 / w
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        # Sharpen + enhance contrast for blurry strips
        img = ImageEnhance.Sharpness(img).enhance(2.5)
        img = ImageEnhance.Contrast(img).enhance(1.8)

        output = io.BytesIO()
        img.save(output, format="JPEG", quality=95)
        return output.getvalue()
    except Exception as e:
        logger.warning(f"Image preprocessing failed, using raw bytes: {e}")
        return image_bytes


def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Run EasyOCR on the image and return a clean concatenated text string.
    Handles rotated text and prescription images via EasyOCR's built-in rotation.
    """
    try:
        processed = preprocess_image(image_bytes)
        reader = get_reader()

        # detail=1 gives confidence scores; paragraph=False for per-word results
        results = reader.readtext(
            processed,
            detail=1,
            paragraph=False,
            rotation_info=[0, 90, 180, 270]  # Handle rotated medicine strips
        )

        # Filter low-confidence results (< 30%) and join remaining text
        lines = [text for (_, text, conf) in results if conf >= 0.30]
        extracted = " | ".join(lines).strip()

        logger.info(f"OCR extracted {len(lines)} text segments.")
        return extracted if extracted else "No text could be extracted from the image."

    except Exception as e:
        logger.error(f"OCR extraction failed: {e}", exc_info=True)
        raise RuntimeError(f"OCR processing failed: {str(e)}")
