import time
import uuid
from typing import Dict, Any, List, Optional
from backend.app.core.exceptions import PermissionDeniedException, ResourceNotFoundException

class UserService:
    def __init__(self):
        # Transactional in-memory stores backing PostGIS/PostgreSQL multi-tenant tables
        self._user_trips: Dict[str, dict] = {}       # trip_id -> trip_dict
        self._user_saved_places: Dict[str, set] = {} # user_id -> set(place_id)
        self._user_favorites: Dict[str, set] = {}    # user_id -> set(place_id)
        self._user_saved_routes: Dict[str, dict] = {}# route_id -> route_dict

    # --- TRIPS MANAGEMENT ---
    def create_trip(self, user_id: str, title: str, origin: str, destination: str, places: List[str] = None) -> dict:
        trip_id = f"trip-{uuid.uuid4().hex[:10]}"
        trip = {
            "id": trip_id,
            "userId": user_id,
            "title": title,
            "origin": origin,
            "destination": destination,
            "places": places or [],
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "updatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        self._user_trips[trip_id] = trip
        return trip

    def get_user_trips(self, user_id: str) -> List[dict]:
        return [trip for trip in self._user_trips.values() if trip["userId"] == user_id]

    def get_trip_by_id(self, trip_id: str, requesting_user_id: str) -> dict:
        trip = self._user_trips.get(trip_id)
        if not trip:
            raise ResourceNotFoundException(f"Trip '{trip_id}' not found.")
        if trip["userId"] != requesting_user_id:
            raise PermissionDeniedException(f"Forbidden: You do not own trip '{trip_id}'.")
        return trip

    def delete_trip(self, trip_id: str, requesting_user_id: str) -> bool:
        trip = self.get_trip_by_id(trip_id, requesting_user_id)
        del self._user_trips[trip_id]
        return True

    # --- SAVED PLACES ---
    def save_place(self, user_id: str, place_id: str) -> List[str]:
        if user_id not in self._user_saved_places:
            self._user_saved_places[user_id] = set()
        self._user_saved_places[user_id].add(place_id)
        return list(self._user_saved_places[user_id])

    def get_saved_places(self, user_id: str) -> List[str]:
        return list(self._user_saved_places.get(user_id, set()))

    def remove_saved_place(self, user_id: str, place_id: str) -> List[str]:
        if user_id in self._user_saved_places and place_id in self._user_saved_places[user_id]:
            self._user_saved_places[user_id].remove(place_id)
        return list(self._user_saved_places.get(user_id, set()))

    # --- FAVORITES ---
    def add_favorite(self, user_id: str, place_id: str) -> List[str]:
        if user_id not in self._user_favorites:
            self._user_favorites[user_id] = set()
        self._user_favorites[user_id].add(place_id)
        return list(self._user_favorites[user_id])

    def get_favorites(self, user_id: str) -> List[str]:
        return list(self._user_favorites.get(user_id, set()))

    def remove_favorite(self, user_id: str, place_id: str) -> List[str]:
        if user_id in self._user_favorites and place_id in self._user_favorites[user_id]:
            self._user_favorites[user_id].remove(place_id)
        return list(self._user_favorites.get(user_id, set()))

    # --- SAVED ROUTES ---
    def save_route(self, user_id: str, title: str, origin: str, destination: str, distance_km: float) -> dict:
        route_id = f"route-{uuid.uuid4().hex[:10]}"
        route = {
            "id": route_id,
            "userId": user_id,
            "title": title,
            "origin": origin,
            "destination": destination,
            "distanceKm": distance_km,
            "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ")
        }
        self._user_saved_routes[route_id] = route
        return route

    def get_saved_routes(self, user_id: str) -> List[dict]:
        return [r for r in self._user_saved_routes.values() if r["userId"] == user_id]

    def get_route_by_id(self, route_id: str, requesting_user_id: str) -> dict:
        route = self._user_saved_routes.get(route_id)
        if not route:
            raise ResourceNotFoundException(f"Route '{route_id}' not found.")
        if route["userId"] != requesting_user_id:
            raise PermissionDeniedException(f"Forbidden: You do not own route '{route_id}'.")
        return route

user_service = UserService()
