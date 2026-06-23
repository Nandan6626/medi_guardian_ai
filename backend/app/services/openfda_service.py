"""
OpenFDA Service — Fetches drug information from the FDA drug label database.
Docs: https://open.fda.gov/apis/drug/label/
"""
import logging

try:
    import httpx
except ImportError:
    httpx = None

logger = logging.getLogger("openfda_service")

OPENFDA_BASE = "https://api.fda.gov/drug/label.json"

# Fields we want to pull from the FDA label response
FDA_FIELDS = [
    "indications_and_usage",
    "dosage_and_administration",
    "warnings",
    "adverse_reactions",
    "drug_interactions",
    "contraindications",
    "precautions",
    "description",
    "active_ingredient",
    "purpose",
    "openfda"
]


def _first(lst: list | None, default: str = "Not available") -> str:
    """Safely get first item from a list, or return default."""
    if lst and isinstance(lst, list) and len(lst) > 0:
        # Trim to 600 chars to avoid overwhelming the UI
        return str(lst[0])[:600].strip()
    return default


async def fetch_fda_drug_info(generic_name: str) -> dict:
    """
    Query OpenFDA drug label API using the generic name.
    Returns structured dict with uses, dosage, warnings, side effects, etc.
    """
    if httpx is None:
        return _empty_fda_response("OpenFDA client is not installed in this environment.")
    if not generic_name or generic_name.lower() in ("unknown", ""):
        return _empty_fda_response("Unknown medicine — no generic name available for lookup.")

    search_term = generic_name.strip().lower()

    # Try both active ingredient search and generic name search
    queries = [
        f"openfda.generic_name:\"{search_term}\"",
        f"active_ingredient:\"{search_term}\"",
        f"openfda.substance_name:\"{search_term}\"",
    ]

    async with httpx.AsyncClient(timeout=12.0) as client:
        for query in queries:
            try:
                resp = await client.get(
                    OPENFDA_BASE,
                    params={"search": query, "limit": 1}
                )

                if resp.status_code == 200:
                    data = resp.json()
                    results = data.get("results", [])
                    if results:
                        result = results[0]
                        openfda = result.get("openfda", {})

                        # Extract brand names and manufacturer
                        brand_names = openfda.get("brand_name", [])
                        manufacturer = openfda.get(
                            "manufacturer_name", ["Not available"])[0]
                        substance = openfda.get(
                            "substance_name", [generic_name.upper()])

                        return {
                            "found": True,
                            "brand_names": brand_names[:3],
                            "manufacturer": manufacturer,
                            "substance_names": substance[:2],
                            "uses": _first(result.get("indications_and_usage") or result.get("purpose")),
                            "dosage": _first(result.get("dosage_and_administration")),
                            "warnings": _first(result.get("warnings") or result.get("contraindications")),
                            "side_effects": _first(result.get("adverse_reactions")),
                            "precautions": _first(result.get("precautions")),
                            "drug_interactions": _first(result.get("drug_interactions")),
                            "description": _first(result.get("description")),
                        }

            except httpx.RequestError as e:
                logger.warning(
                    f"OpenFDA request error for query '{query}': {e}")
            except Exception as e:
                logger.warning(f"OpenFDA parse error for query '{query}': {e}")

    # Nothing found
    logger.info(f"OpenFDA: no results found for '{generic_name}'")
    return _empty_fda_response(f"No FDA database entry found for '{generic_name}'.")


def _empty_fda_response(note: str) -> dict:
    return {
        "found": False,
        "brand_names": [],
        "manufacturer": "Not available",
        "substance_names": [],
        "uses": "Not available",
        "dosage": "Consult your doctor or pharmacist",
        "warnings": "Consult your doctor or pharmacist",
        "side_effects": "Not available",
        "precautions": "Not available",
        "drug_interactions": "Not available",
        "description": note,
    }
