from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from googleplaces import GooglePlaces, types, lang

router = APIRouter()

# API Key provided by user
API_KEY = 'AIzaSyApglyJyZ3ldaK5hC_oGwPfmuGvsP5iOZo'
google_places = GooglePlaces(API_KEY)

class Location(BaseModel):
    lat: float
    lng: float

class Hospital(BaseModel):
    name: str
    location: Location
    vicinity: Optional[str] = None
    rating: Optional[float] = None
    place_id: Optional[str] = None

@router.get("/nearby-hospitals", response_model=List[Hospital])
async def get_nearby_hospitals(
    lat: float = Query(..., description="Latitude of the location"),
    lng: float = Query(..., description="Longitude of the location"),
    radius: int = Query(5000, description="Search radius in meters")
):
    """
    Find nearby hospitals based on latitude and longitude using Google Places API.
    """
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
        raise HTTPException(status_code=500, detail=str(e))
