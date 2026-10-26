# Bolt's Journal

## 2025-02-18 - Single-Pass Geospatial Radius Queries with Origin Precomputation
**Learning:** In client-side geospatial queries (`getPlacesWithinRadius`, `getPlacesInBand`), chained `.filter().map()` calls caused double execution of expensive trigonometric Haversine calculations (`Math.sin`, `Math.cos`, `Math.atan2`). Furthermore, calculating origin radians repeatedly per candidate place and using array `.includes()` for exclusions added unnecessary overhead. Replacing array lookup with `Set.has()`, pre-filtering by category, precomputing origin `latRad` and `cosLat` once per call, and doing a single-pass loop yielded a 59% reduction in execution time (~2.4x speedup) with zero change in output.
**Action:** When working with geospatial or distance queries across catalog arrays, always pre-filter, precompute constant origin trig values outside loops, avoid double calculation in filter/map chains, and use Set lookups for exclusions.
