"""
Deterministic numerical ranking engine for place candidate evaluation.
Applies weighted multi-factor scoring combining spatial distance, category relevance,
popularity, user rating quality, and path deviation.
"""

from typing import List
from backend.app.ai.schemas import PlaceCandidate, StructuredTripIntent

class RankingEngine:
    """
    Evaluates and ranks PlaceCandidate instances based on mathematical formula:
    Score = w_dist * S_dist + w_cat * S_cat + w_pop * S_pop + w_qual * S_qual + w_dev * S_dev
    """

    @staticmethod
    def rank_candidates(
        candidates: List[PlaceCandidate],
        intent: StructuredTripIntent
    ) -> List[PlaceCandidate]:
        if not candidates:
            return []

        user_categories = {c.lower() for c in intent.categories}
        user_interests = {i.lower() for i in intent.interests}

        for candidate in candidates:
            # 1. Rating Quality Score (0-25 pts)
            s_qual = min(25.0, (candidate.rating / 5.0) * 25.0)

            # 2. Category & Interest Match Score (0-30 pts)
            cat_lower = candidate.category.lower()
            s_cat = 15.0  # Base score
            if any(c in cat_lower for c in user_categories):
                s_cat += 10.0
            if any(i in cat_lower for i in user_interests):
                s_cat += 5.0

            # 3. Provenance & Confidence Score (0-20 pts)
            s_prov = candidate.provenance.confidence * 20.0

            # 4. Spatial Position / Path Score (0-25 pts)
            s_spatial = min(25.0, max(0.0, candidate.ranking_score * 0.25))

            total_score = s_qual + s_cat + s_prov + s_spatial
            candidate.ranking_score = round(min(100.0, total_score), 2)

        candidates.sort(key=lambda c: c.ranking_score, reverse=True)
        return candidates
