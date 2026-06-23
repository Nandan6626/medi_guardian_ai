"""
OCR Service — Optimized EasyOCR with:
- No rotation scan (biggest speed win)
- asyncio thread-pool execution (non-blocking)
- Lightweight preprocessing only
"""
import io
import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Any

try:
    from PIL import Image, ImageEnhance
except ImportError:
    Image = None
    ImageEnhance = None

try:
    import easyocr
except ImportError:
    easyocr = None

logger = logging.getLogger("ocr_service")

# Singleton reader + dedicated thread pool for CPU-bound OCR
_reader: Optional[Any] = None
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="easyocr")


def _init_reader() -> Any:
    """Initialize EasyOCR reader (call once at startup)."""
    global _reader
    if easyocr is None:
        raise RuntimeError("EasyOCR is not installed in this environment.")
    if _reader is None:
        logger.info("Initializing EasyOCR reader...")
        _reader = easyocr.Reader(
            ['en'],
            gpu=False,
            model_storage_directory='/tmp/easyocr_models',
            download_enabled=True,
            verbose=False
        )
        logger.info("EasyOCR ready.")
    return _reader


def get_reader() -> Any:
    return _init_reader()


def _preprocess_image(image_bytes: bytes) -> bytes:
    """Lightweight preprocessing — resize only if tiny, minimal sharpening."""
    if Image is None or ImageEnhance is None:
        return image_bytes
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size
        # Only resize if very small — don't waste time on already large images
        if max(w, h) < 600:
            scale = 600 / max(w, h)
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)
        # Single pass: just sharpening
        img = ImageEnhance.Sharpness(img).enhance(2.0)
        out = io.BytesIO()
        img.save(out, format="JPEG", quality=92)
        return out.getvalue()
    except Exception:
        return image_bytes


def _run_ocr_sync(image_bytes: bytes) -> str:
    """Synchronous OCR — runs in thread pool."""
    processed = _preprocess_image(image_bytes)
    reader = get_reader()

    # NO rotation_info — single pass is ~4x faster
    results = reader.readtext(
        processed,
        detail=1,
        paragraph=False,
        # batch_size=4 improves throughput on multi-text images
        batch_size=4,
        contrast_ths=0.1,
        adjust_contrast=0.5,
    )

    lines = [text for (_, text, conf) in results if conf >= 0.25]
    extracted = " | ".join(lines).strip()
    logger.info(f"OCR extracted {len(lines)} segments.")
    return extracted or "No text could be extracted from the image."


async def extract_text_from_image(image_bytes: bytes) -> str:
    """
    Non-blocking async OCR — offloads CPU-bound EasyOCR to thread pool
    so the FastAPI event loop stays responsive.
    """
    if easyocr is None:
        raise RuntimeError("OCR dependencies are not installed.")
    loop = asyncio.get_event_loop()
    try:
        return await loop.run_in_executor(_executor, _run_ocr_sync, image_bytes)
    except Exception as e:
        logger.error(f"OCR failed: {e}", exc_info=True)
        raise RuntimeError(f"OCR processing failed: {str(e)}")


def warmup_ocr():
    """Pre-warm the EasyOCR model at app startup (eliminates first-request lag)."""
    if easyocr is None:
        logger.warning("Skipping OCR warmup because EasyOCR is not installed.")
        return
    try:
        logger.info("Pre-warming EasyOCR model...")
        reader = _init_reader()
        # Tiny test image to force model load
        import numpy as np
        dummy = np.zeros((32, 200, 3), dtype=np.uint8)
        reader.readtext(dummy, detail=0)
        logger.info("EasyOCR warmup complete.")
    except Exception as e:
        logger.warning(f"EasyOCR warmup failed (non-fatal): {e}")
