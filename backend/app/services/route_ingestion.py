import math
import xml.etree.ElementTree as ET
from typing import List, Dict, Any, Tuple
from backend.app.schemas.routes import RouteCreate, RouteResponse, TrackPoint
from backend.app.services.places_service import calculate_haversine
from backend.app.core.exceptions import ValidationException
from backend.app.core.security import UserContext

class RouteIngestionService:
    def __init__(self):
        self._routes_db: Dict[str, dict] = {
            "kolli-hills-70-hairpin-pass": {
                "id": "r-1",
                "slug": "kolli-hills-70-hairpin-pass",
                "title": "Kolli Hills 70 Hairpin Pass",
                "district": "Namakkal",
                "difficulty": "Hard",
                "distanceKm": 46.8,
                "elevationGainM": 1240.0,
                "hairpinBends": 70,
                "verified": True,
                "wktLineString": "LINESTRING(78.3375 11.2721, 78.3400 11.2750, 78.3450 11.2800)",
                "createdBy": "Pranav",
                "createdAt": "2026-08-08T10:00:00Z"
            }
        }

    def calculate_heading_angle(self, p1: Tuple[float, float], p2: Tuple[float, float]) -> float:
        """Calculate compass heading angle in degrees between two coordinates (lat, lng)."""
        lat1, lon1 = map(math.radians, p1)
        lat2, lon2 = map(math.radians, p2)
        dlon = lon2 - lon1
        y = math.sin(dlon) * math.cos(lat2)
        x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)
        initial_bearing = math.atan2(y, x)
        return (math.degrees(initial_bearing) + 360) % 360

    def parse_gpx_content(self, gpx_xml: str) -> Tuple[List[TrackPoint], float, float, int, str]:
        """
        Parses raw GPX XML string:
        - Extracts track points (latitude, longitude, elevation)
        - Computes 3D distance (Haversine + elevation change)
        - Computes cumulative elevation gain
        - Detects hairpin bends (heading angle change > 120°)
        - Formats PostGIS WKT LineString: 'LINESTRING(lng1 lat1, lng2 lat2, ...)'
        """
        try:
            root = ET.fromstring(gpx_xml)
        except Exception as e:
            raise ValidationException(f"Invalid GPX format: Unable to parse XML ({str(e)})")

        namespace = {"gpx": "http://www.topografix.com/GPX/1/1"}
        trkpts = root.findall(".//gpx:trkpt", namespace)
        if not trkpts:
            # Fallback without namespace
            trkpts = root.findall(".//trkpt")

        if not trkpts:
            raise ValidationException("Invalid GPX format: Zero trackpoints found in file.")

        points: List[TrackPoint] = []
        wkt_coords: List[str] = []

        for pt in trkpts:
            lat = float(pt.attrib.get("lat", 0.0))
            lng = float(pt.attrib.get("lon", 0.0))
            
            # WGS84 Geofence check for Tamil Nadu bounds
            if lat < 8.0 or lat > 13.6 or lng < 76.0 or lng > 80.5:
                raise ValidationException(f"Invalid GPX trackpoint [{lat}, {lng}]: Point falls outside Tamil Nadu WGS84 bounds.")

            ele_elem = pt.find("gpx:ele", namespace) if pt.find("gpx:ele", namespace) is not None else pt.find("ele")
            ele = float(ele_elem.text) if ele_elem is not None and ele_elem.text else 0.0

            points.append(TrackPoint(lat=lat, lng=lng, elevation=ele))
            wkt_coords.append(f"{lng} {lat}")

        # Metrics calculation
        total_dist_km = 0.0
        elevation_gain_m = 0.0
        hairpin_count = 0

        prev_heading = None

        for i in range(1, len(points)):
            p_prev = points[i - 1]
            p_curr = points[i]

            # Haversine 2D distance
            dist_2d = calculate_haversine(p_prev.lat, p_prev.lng, p_curr.lat, p_curr.lng)
            
            # 3D distance elevation correction
            ele_diff_km = (p_curr.elevation - p_prev.elevation) / 1000.0
            dist_3d = math.sqrt(dist_2d**2 + ele_diff_km**2)
            total_dist_km += dist_3d

            # Cumulative elevation gain
            if p_curr.elevation > p_prev.elevation:
                elevation_gain_m += (p_curr.elevation - p_prev.elevation)

            # Hairpin bend detection via heading change
            curr_heading = self.calculate_heading_angle((p_prev.lat, p_prev.lng), (p_curr.lat, p_curr.lng))
            if prev_heading is not None:
                heading_diff = abs(curr_heading - prev_heading)
                if heading_diff > 180:
                    heading_diff = 360 - heading_diff
                if heading_diff >= 120.0:
                    hairpin_count += 1
            prev_heading = curr_heading

        wkt_linestring = f"LINESTRING({', '.join(wkt_coords)})"
        return points, round(total_dist_km, 2), round(elevation_gain_m, 1), hairpin_count, wkt_linestring

    def ingest_gpx_route(self, title: str, district: str, difficulty: str, gpx_xml: str, user: UserContext) -> dict:
        points, distance_km, elevation_gain_m, hairpins, wkt_linestring = self.parse_gpx_content(gpx_xml)
        
        slug = title.lower().replace(" ", "-").replace("'", "")
        route_record = {
            "id": f"r-{len(self._routes_db) + 1}",
            "slug": slug,
            "title": title,
            "district": district,
            "difficulty": difficulty,
            "distanceKm": distance_km,
            "elevationGainM": elevation_gain_m,
            "hairpinBends": hairpins,
            "trackPointsCount": len(points),
            "wktLineString": wkt_linestring,
            "verified": user.role in ["super_admin", "route_manager"],
            "createdBy": user.name,
            "createdAt": "2026-08-10T14:30:00Z"
        }
        self._routes_db[slug] = route_record
        return route_record

    def get_all_routes(self) -> List[dict]:
        return list(self._routes_db.values())

route_ingestion_service = RouteIngestionService()
