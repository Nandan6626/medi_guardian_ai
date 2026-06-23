import os
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

try:
    from dotenv import load_dotenv
except ImportError:
    load_dotenv = None

try:
    from googleplaces import GooglePlaces, types
except ImportError:
    GooglePlaces = None
    types = None

if load_dotenv:
    load_dotenv()
router = APIRouter()

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "").strip()
google_places = GooglePlaces(API_KEY) if API_KEY and GooglePlaces else None


class Location(BaseModel):
    lat: float
    lng: float


class Hospital(BaseModel):
    name: str
    location: Location
    vicinity: Optional[str] = None
    rating: Optional[float] = None
    place_id: Optional[str] = None


FALLBACK_HOSPITALS = [
    {
        "name": "City General Hospital",
        "location": {"lat": 37.7749, "lng": -122.4194},
        "vicinity": "123 Main St",
        "rating": 4.5,
        "place_id": "mock-1"
    },
    {
        "name": "St. Jude Medical Center",
        "location": {"lat": 37.7849, "lng": -122.4094},
        "vicinity": "456 Oak Ave",
        "rating": 4.8,
        "place_id": "mock-2"
    },
    {
        "name": "Mercy Emergency Clinic",
        "location": {"lat": 37.7649, "lng": -122.4294},
        "vicinity": "789 Pine Rd",
        "rating": 4.2,
        "place_id": "mock-3"
    }
]


@router.get("/nearby-hospitals", response_model=List[Hospital])
async def get_nearby_hospitals(
    lat: float = Query(..., description="Latitude of the location"),
    lng: float = Query(..., description="Longitude of the location"),
    radius: int = Query(5000, description="Search radius in meters")
):
    """
    Find nearby hospitals based on latitude and longitude using Google Places API.
    """
    if google_places is None or types is None:
        return [Hospital(**hospital) for hospital in FALLBACK_HOSPITALS]

    try:
        query_result = google_places.nearby_search(
            lat_lng={'lat': lat, 'lng': lng},
            radius=radius,
            types=[types.TYPE_HOSPITAL]
        )

        hospitals = []
        for place in query_result.places:
            hospital = Hospital(
                name=place.name,
                location=Location(
                    lat=float(place.geo_location['lat']),
                    lng=float(place.geo_location['lng'])
                ),
                place_id=place.place_id,
            )
            # Fetch details if available (note: requires an extra API call per place, keeping it light for now)
            # place.get_details()
            # hospital.vicinity = place.vicinity
            # hospital.rating = place.rating

            hospitals.append(hospital)

        return hospitals
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Google Places lookup failed. {str(e)}"
        )
