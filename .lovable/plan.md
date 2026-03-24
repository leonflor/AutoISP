

# Fix: keyword detection penalizes having more keywords

## Root Cause

The scoring formula is `matchedCount / totalKeywords`. Before: 1/3 = 0.33 (passed). Now with 10 keywords: 1/10 = 0.10, which is below `min_confidence` of 0.14. Adding synonyms made detection worse.

## Solution: Change scoring logic

Replace the ratio-based scoring with a simpler approach: **if at least 1 keyword matches, the procedure is a candidate**. Use `matchedCount` as the ranking score (more matches = better match), not a ratio.

In `detectProcedure` (procedure-runner.ts, line ~666-671):

```typescript
// BEFORE (ratio penalizes large keyword lists)
const score = matchedCount / keywords.length;
if (score >= minConfidence && score > bestScore) { ... }

// AFTER (any single keyword match qualifies)
if (matchedCount > 0 && matchedCount > bestScore) {
  bestScore = matchedCount;
  bestMatch = proc;
}
```

This also means `min_confidence` in the trigger definition becomes unused for now, which is fine — it was always fragile with ratio-based math.

Additionally, improve substring matching to handle phrases like "quero do meu boleto" by normalizing common filler words. The current `searchText.includes(kw)` already handles this — "quero do meu boleto".includes("boleto") is true. So the main fix is the scoring threshold.

## Files changed

| File | Change |
|---|---|
| `supabase/functions/_shared/procedure-runner.ts` | Lines 666-674: replace ratio scoring with absolute match count |

No migration needed.

