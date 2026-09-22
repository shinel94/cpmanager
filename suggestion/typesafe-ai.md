# TypeSafe AI Analysis for cpmanager

## Codebase Overview

A Next.js 15 + React 19 + TypeScript chord progression manager with:
- Client-side state (React Context + reducer) for project drafts
- Server-side SQLite-backed recommendation service
- Technique analysis with rule matching
- Chord catalog with Roman numeral normalization

## Fragility/Complexity Areas

1. **Chord degree/quality normalization** (`app/lib/shared/catalog/chord-catalog.ts:85-152`): Complex validation with regex matching, accidental handling, and compatibility checks in `normalizeStep`

2. **Recommendation system** (`app/lib/server/services/recommendation-service.ts:113-139`): Complex nested filtering with 6+ conditions, hardcoded sort options

3. **Technique analyzer** (`app/lib/server/services/technique-analyzer.ts:37-48`): Multiple rule types with JSON-parsed conditions that are fragile to schema changes

4. **Project draft reducer** (`app/lib/client/draft-reducer.ts:257-259`): Hardcoded `steps.length !== 4` check in `APPLY_RECOMMENDATION_BLOCK`

5. **Project serialization** (`app/lib/client/project-serializer.ts:74-121`): Complex mapping between client/server formats with manual chord property copying

## Applicable TypeSafe Cookbooks

| Cookbook | Why It Applies | Code Areas Impacted |
|---|---|---|
| **[function_calling.md](https://docs.typesafe.ai/cookbooks/function_calling.md)** | Turn natural-language chord requests into typed function calls with confidence | Chord operations, recommendation requests, technique analysis |
| **[choice.md](https://docs.typesafe.ai/primitives/choice.md)** | Replace manual enum validation with typed Choice questions for tonics/qualities/extensions | `chord-catalog.ts` validation, type guards throughout |
| **[score.md](https://docs.typesafe.ai/primitives/score.md)** | Rate candidates on ordered dimensions instead of simple sorting | Recommendation system sorting (`popularity`/`connectivity`/`diversity`) |
| **[rerank_typesafe.md](https://docs.typesafe.ai/cookbooks/rerank_typesafe.md)** | Improve top-k recommendation accuracy beyond simple sort | `recommendation-service.ts` `sortCandidates` logic |
| **[classification_using_confidence.md](https://docs.typesafe.ai/cookbooks/classification_using_confidence.md)** | Use confidence thresholds to decide auto-accept vs. flag for review | Project draft validation, technique analysis results |
| **[pre_parsed_value_extraction_cookbook.md](https://docs.typesafe.ai/cookbooks/pre_parsed_value_extraction_cookbook.md)** | Streamline degree/quality normalization with regex candidates + TypeSafe selection | `chord-catalog.ts` `normalizeStep`, `normalizeDegree`, `normalizeBassDegree` |
| **[sde_cascade.md](https://docs.typesafe.ai/cookbooks/sde_cascade.md)** | 2-stage extraction cascade for technique rules | `technique-analyzer.ts` rule matching reliability |

## Recommended Refactoring Roadmap

### Phase 1: Function Calling (Highest Impact)
- Map natural-language chord interactions (e.g., "add a ii-V-I progression") into confidence-aware typed function calls
- Reduce fragility in the API layer and reducer
- Use `Choice` questions for tonic, quality, extension selection with probability distributions

### Phase 2: Pre-parsed Value Extraction
- Streamline the chord degree/quality normalization currently in `chord-catalog.ts`
- Use regex to find candidate values, then let TypeSafe select the requested span
- Reduces complexity of `normalizeDegree`, `normalizeBassDegree`, and `normalizeStep`

### Phase 3: Confidence-Gated Classification
- Apply `classification_using_confidence.md` pattern to technique analysis results
- Use confidence thresholds to auto-accept vs. flag uncertain technique suggestions for review
- Improves reliability of the technique-analyzer rule matching

### Phase 4: Reranking for Recommendations
- Apply `rerank_typesafe.md` to improve top-k recommendation accuracy
- Beyond simple popularity/connectivity/diversity sorting
- Use TypeSafe Score questions to rank candidates on multiple dimensions controlled in code

## TypeScript Notes

- Codebase types check cleanly (`npm run typecheck` passes)
- All TypeSafe primitives return typed answers (`ChoiceResponse<T>`, `ScoreResponse<T>`, `NoulResponse`)
- Keep code in control; use TypeSafe for semantic understanding where ordinary code needs it