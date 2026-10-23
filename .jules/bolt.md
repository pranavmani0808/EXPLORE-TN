## 2026-10-23 - Memoizing Unfiltered Aggregate Counts in React Render Loop
**Learning:** Computing aggregate counts for UI category tiles by calling `array.filter()` inside render pass recalculates across all items on every re-render (e.g., search keystrokes, filter toggles), causing unnecessary CPU main-thread work.
**Action:** Wrap aggregate category tile counts in `useMemo` dependent on the source dataset, making tile renders O(1) dictionary lookups during user interaction re-renders.
