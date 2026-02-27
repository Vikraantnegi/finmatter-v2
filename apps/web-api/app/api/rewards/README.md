# GET /api/rewards

Rewards computation for a card and period. Wires the deterministic rewards engine to the backend: loads rule set, fetches canonical transactions, returns engine output unchanged.

## Request

- **Method:** GET
- **Headers:** `x-user-id` (optional; default `test-user`) — scopes transactions to this user
- **Query:**
  - `cardId` (required) — card slug, e.g. `hdfc-millennia`
  - `periodType` (required) — `monthly` | `quarterly` | `yearly`
  - `periodStart` (required) — ISO date (inclusive), e.g. `2025-01-01`
  - `periodEnd` (required) — ISO date (inclusive), e.g. `2025-01-31`

## Response

**200** — Body is the engine result:

```json
{
  "perTransactionRewards": [
    {
      "transactionId": "...",
      "cardId": "...",
      "category": "shopping",
      "appliedRule": { "ruleType": "category_rate", "sourceConstraintIndex": 0 },
      "baseAmount": 2000,
      "rewardAmount": 100,
      "cappedAmount": 100,
      "excluded": false,
      "explanation": "5% on shopping: 100 units from ₹2000",
      "transactionDate": "2025-01-15"
    }
  ],
  "periodSummary": {
    "period": { "type": "monthly", "start": "2025-01-01", "end": "2025-01-31" },
    "totalReward": 600,
    "byCategory": { "shopping": 500, "other": 100 },
    "capsHit": [...],
    "milestonesTriggered": [...]
  }
}
```

**400** — Missing or invalid query (e.g. missing `cardId`, invalid `periodType`).

**404** — No rule set for this `cardId` (e.g. file not found).

**500** — Transaction fetch or engine error.

**503** — Supabase not configured.

## Behaviour

- Rule set is loaded from `apps/backend/src/db/data/rule-sets/<cardId>.json` (or `RULE_SETS_PATH` env).
- Transactions are fetched from `canonical_transactions` for (user, card, period).
- Engine is called with rule set + transactions + period; no reward logic in the adapter.
- v1: no persistence of period summary; compute on demand.
