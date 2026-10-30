## 2026-03-31 - Memoize Place Search Normalization Indices
**Learning:** Re-running `re.sub()` regex cleanups, token word splitting, and string lowercased allocations for every place record inside search and resolver loops introduced severe query overhead (~2.12ms per search call).
**Action:** Pre-compute and cache normalized search index attributes in a service-level dictionary (`_search_index_cache`), cutting search latency by ~80% and destination resolution latency by ~69%.
