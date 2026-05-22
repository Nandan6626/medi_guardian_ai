"""
Medicine Verify Endpoint — Full AI medicine analysis pipeline.
Route: POST /api/medicine-verify/analyze
Accepts: multipart/form-data image upload
Returns: Complete medicine analysis with OCR + Gemini + OpenFDA data
"""
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List

from app.services.ocr_service import extract_text_from_image
from app.services.gemini_service import extract_medicine_info_from_ocr, generate_simple_explanation
from app.services.openfda_service import fetch_fda_drug_info

logger = logging.getLogger("medicine_verify")

router = APIRouter()

# ─── Response Models ───────────────────────────────────────────────────────────

class AIExtraction(BaseModel):
    medicine_name: str
    generic_name: str
    dosage: str
    medicine_type: str
    confidence: str
    cleaned_ocr_text: str

class FDAInfo(BaseModel):
    found: bool
    brand_names: List[str]
    manufacturer: str
    uses: str
    dosage: str
    warnings: str
    side_effects: str
    precautions: str
    drug_interactions: str
    description: str

class MedicineAnalysisResponse(BaseModel):
    success: bool
    raw_ocr_text: str
    ai_extraction: AIExtraction
    fda_info: FDAInfo
    simple_explanation: str
    reminder_compatible: bool = True


# ─── Main Analyze Endpoint ─────────────────────────────────────────────────────

@router.post("/analyze", response_model=MedicineAnalysisResponse)
async def analyze_medicine_image(
    file: UploadFile = File(..., description="Medicine image (JPG, PNG, WEBP)")
):
    """
    Full AI pipeline:
    1. Read uploaded image bytes
    2. EasyOCR → extract raw text
    3. Gemini AI → clean OCR, extract structured medicine info
    4. OpenFDA → fetch detailed drug label data using generic name
    5. Gemini AI → generate simple explanation for elderly users
    6. Return comprehensive JSON response
    """

    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Only image files are accepted (JPG, PNG, WEBP, etc.)"
        )

    # Read image bytes
    try:
        image_bytes = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read uploaded file: {str(e)}")

    if len(image_bytes) < 100:
        raise HTTPException(status_code=400, detail="Uploaded file appears to be empty.")

    logger.info(f"Processing image: {file.filename} ({len(image_bytes)} bytes)")

    # Step 1: OCR
    try:
        raw_ocr = extract_text_from_image(image_bytes)
        logger.info(f"OCR result (preview): {raw_ocr[:100]}")
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))

    # Step 2: Gemini AI extraction
    try:
        ai_data = await extract_medicine_info_from_ocr(raw_ocr)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    # Step 3: OpenFDA lookup using generic name
    generic_name = ai_data.get("generic_name", "")
    medicine_name = ai_data.get("medicine_name", "Unknown")

    try:
        fda_data = await fetch_fda_drug_info(generic_name)
    except Exception as e:
        logger.warning(f"OpenFDA lookup failed: {e}, continuing with empty FDA data.")
        fda_data = {
            "found": False, "brand_names": [], "manufacturer": "Not available",
            "substance_names": [], "uses": "Not available",
            "dosage": ai_data.get("dosage", "Consult doctor"),
            "warnings": "Consult your doctor", "side_effects": "Not available",
            "precautions": "Not available", "drug_interactions": "Not available",
            "description": "OpenFDA lookup failed."
        }

    # Step 4: Generate simple Gemini explanation
    try:
        simple_explanation = await generate_simple_explanation(
            medicine_name=medicine_name,
            generic_name=generic_name,
            uses=fda_data.get("uses", "Not available"),
            side_effects=fda_data.get("side_effects", "Not available"),
            warnings=fda_data.get("warnings", "Consult doctor"),
            dosage=ai_data.get("dosage", "As prescribed")
        )
    except Exception as e:
        logger.warning(f"Explanation generation failed: {e}")
        simple_explanation = f"This is {medicine_name}. Please ask your doctor or pharmacist for details."

    # Build response
    return MedicineAnalysisResponse(
        success=True,
        raw_ocr_text=raw_ocr,
        ai_extraction=AIExtraction(
            medicine_name=medicine_name,
            generic_name=generic_name or "Not identified",
            dosage=ai_data.get("dosage", "Unknown"),
            medicine_type=ai_data.get("medicine_type", "Unknown"),
            confidence=ai_data.get("confidence", "low"),
            cleaned_ocr_text=ai_data.get("cleaned_text", raw_ocr)
        ),
        fda_info=FDAInfo(
            found=fda_data.get("found", False),
            brand_names=fda_data.get("brand_names", []),
            manufacturer=fda_data.get("manufacturer", "Not available"),
            uses=fda_data.get("uses", "Not available"),
            dosage=fda_data.get("dosage", ai_data.get("dosage", "As prescribed")),
            warnings=fda_data.get("warnings", "Consult your doctor"),
            side_effects=fda_data.get("side_effects", "Not available"),
            precautions=fda_data.get("precautions", "Not available"),
            drug_interactions=fda_data.get("drug_interactions", "Not available"),
            description=fda_data.get("description", "")
        ),
        simple_explanation=simple_explanation,
        reminder_compatible=True
    )


@router.get("/status")
async def verify_status():
    return {"status": "ok", "service": "Medicine AI Verify"}
