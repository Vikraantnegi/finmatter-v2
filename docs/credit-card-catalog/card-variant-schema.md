# Card variant — schema reference

Use this when filling [card-variant-template.json](card-variant-template.json) or when entering data in Supabase Table Editor.

**Refinements (verified):** [catalog-refinements-verification.md](catalog-refinements-verification.md) — benefits vs declaredConstraints intent, Benefit cashback note, declaredConstraints order, verifiedAt ISO-8601.

**Eligibility (verified):** [catalog-eligibility-finance-developer-verification.md](catalog-eligibility-finance-developer-verification.md) — eligibility as declaration-only, issuer-stated; Finance & Developer sign-off.

---

## Required fields (Finance: no record without these)

| Field (API)      | Supabase column | Allowed values / format |
|------------------|-----------------|--------------------------|
| `source`         | `source`        | `"mitc"` \| `"bank_site"` \| `"statement"` |
| `sourceRef`      | `source_ref`    | URL or PDF path (e.g. `"https://..."` or `"hdfc_regalia_mitc_2024.pdf#page=3"`) |
| `effectiveFrom`  | `effective_from`| Date string (e.g. `"2024-01-01"`) |
| `verifiedAt`    | `verified_at`  | **ISO-8601 with timezone** (e.g. `"2025-01-01T00:00:00Z"`). Standardize across catalog; avoid date-only. |
| `bank`           | `bank`         | `"HDFC"` \| `"ICICI"` \| `"AMEX"` \| `"HSBC"` \| `"AXIS"` \| `"SBI"` \| `"OTHER"` |
| `family`         | `family`       | Card family name (e.g. `"Regalia"`, `"Platinum Travel"`) |
| `variantName`    | `variant_name` | Card variant name |
| `network`        | `network`      | `"Visa"` \| `"Mastercard"` \| `"Amex"` \| `"RuPay"` |
| `rewardCurrency` | `reward_currency` | Machine-friendly: `"points"` \| `"cashback"` \| `"miles"` \| `"neucoins"` \| `"other"` (use REWARD_CURRENCY_DISPLAY_NAMES in domain for UI) |
| `fees`           | `fees`         | JSONB object (see below) |

---

## Optional but common

| Field (API)   | Supabase column | Notes |
|---------------|-----------------|--------|
| `id`          | `id`            | Omit for new row; Supabase will generate UUID. |
| `cardType`    | `card_type`     | `"credit"` \| `"charge"` |
| `effectiveTo` | `effective_to`  | Null or date when variant was superseded. |
| `milestones`  | `milestones`   | Array of `{ threshold, period, declaredReward, source?, sourceRef? }`. |
| `benefits`    | `benefits`      | Array of `{ type, description?, count?, ... }`. `type`: lounge, golf, membership, insurance, partner, cashback, other. |
| `declaredConstraints` | `declared_constraints` | Array of `{ description, source?, sourceRef? }` — verbatim caps, exclusions from source; Reward Rules DSL interprets. |
| `declaredEligibility` | `declared_eligibility` | Optional array of `{ description, source?, sourceRef? }` — issuer-stated eligibility (income, age, employment). Declaration only; bank decides approval. Parallel to declaredConstraints. |
| `declaredWelcomeBenefits` | `declared_welcome_benefits` | Optional array of `{ description, source?, sourceRef? }` — one-time benefits tied to issuance (e.g. welcome voucher, complimentary membership). Declaration only; not transaction-driven or executable. |
| `minTransactionAmount` | `min_transaction_amount` | Optional `{ amount, currency }` — min txn to qualify (e.g. Rs 100). |
| `tags` | `tags` | Optional string array for filtering/discovery/UI (e.g. `["co-branded", "travel", "fuel", "lifestyle"]`). |

---

## `fees` (JSONB)

Minimal:

```json
{
  "annual": { "amount": 2500, "currency": "INR", "source": "mitc", "sourceRef": "hdfc_regalia_mitc_2024.pdf#page=3" },
  "joining": { "amount": 0, "currency": "INR" },
  "waiverText": "Waived on spend of ₹5L in previous year",
  "gstDisplay": "As applicable"
}
```

---

## `milestones` (JSONB)

Array of (optional source/sourceRef for provenance):

```json
{ "threshold": 150000, "period": "quarterly", "declaredReward": "5000 bonus points", "source": "mitc", "sourceRef": "doc.pdf#p3" }
```

`period`: `"monthly"` \| `"quarterly"` \| `"yearly"`.

---

## `benefits` (JSONB)

**Human-facing descriptions** for UI and explanation. Do not duplicate exact legal/cap language here — keep verbatim issuer wording in `declaredConstraints` only. Example: use "10% cashback on Swiggy orders (monthly cap applies)" in benefits; put the exact cap text only in declaredConstraints.

```json
{ "type": "lounge", "description": "4 per quarter", "count": 4, "domesticInternational": "domestic" }
```

`type`: `"lounge"` \| `"golf"` \| `"membership"` \| `"insurance"` \| `"partner"` \| `"cashback"` \| `"other"`. **Note:** `cashback` here is a declared customer-facing benefit type, not the card's reward rule; `rewardCurrency` on the card is separate. `networkBound` (optional): same as card network type — `"Visa"` \| `"Mastercard"` \| `"Amex"` \| `"RuPay"` (e.g. lounge tied to Visa).

---

## `declaredConstraints` (JSONB) — Supabase: `declared_constraints`

**Issuer-worded legal constraints** — verbatim from source (caps, exclusions, eligibility). Reward Rules DSL interprets; no executable structure here. Optional source/sourceRef per item.

**Recommended order (readability):** (1) Earning / caps, (2) Global exclusions, (3) Category-specific exclusions, (4) Eligibility rules.

```json
{ "description": "10% cashback on Swiggy spends upto ₹1,500 per month", "source": "bank_site", "sourceRef": "HDFC Swiggy Card page" }
{ "description": "From any cashback: Rent, Utilities, Fuel excluded", "source": "mitc", "sourceRef": "mitc.pdf#p4" }
```

---

## `declaredEligibility` (JSONB) — Supabase: `declared_eligibility`

**Issuer-stated eligibility** (e.g. min income, age, employment). Declaration only — we do not compute or guarantee eligibility; the bank decides. Parallel to DeclaredConstraint. Enables "cards you may qualify for" and in-app display with source attribution.

```json
{ "description": "Salaried: Nationality Indian, Age 21–60 years, Income (Monthly) ₹15,000 and above", "source": "bank_site", "sourceRef": "HDFC Swiggy Card page" }
{ "description": "Self-Employed: Age 21–65 years, Annual ITR > ₹6,00,000", "source": "bank_site", "sourceRef": "HDFC Swiggy Card page" }
```

---

## `declaredWelcomeBenefits` (JSONB) — Supabase: `declared_welcome_benefits`

**One-time, issuance-linked benefits** (e.g. welcome voucher, complimentary membership on card issuance). Not transaction-driven; not part of reward rules. Declaration only — time window, first transaction, activation stay as text. Enables card comparison ("₹X upfront value") and recommendations ("best first-year value").

```json
{ "description": "₹500 Amazon Pay voucher on first transaction within 30 days", "source": "bank_site", "sourceRef": "HDFC Swiggy Card page" }
{ "description": "Complimentary Swiggy One membership worth ₹3,499 on card issuance", "source": "bank_site", "sourceRef": "HDFC Swiggy Card page" }
```

Do not overload `benefits` with welcome benefits — keep them separate so UI and recommendation engine can distinguish ongoing vs one-time.

---

## `tags` (JSONB) — Supabase: `tags`

Optional string array for **filtering / discovery / UI** only. Examples: `["co-branded", "travel", "fuel", "lifestyle"]`. Purely for UX; no reward logic.

---

## `minTransactionAmount` (JSONB) — Supabase: `min_transaction_amount`

Declared minimum transaction to qualify for rewards (e.g. Rs 100). Optional.

```json
{ "amount": 100, "currency": "INR" }
```

---

## Supabase: column names

For Table Editor or SQL, use **snake_case**:

`id`, `bank`, `family`, `variant_name`, `network`, `reward_currency`, `card_type`, `fees`, `milestones`, `benefits`, `declared_constraints`, `declared_eligibility`, `declared_welcome_benefits`, `min_transaction_amount`, `tags`, `effective_from`, `effective_to`, `source`, `source_ref`, `verified_at`

(`created_at` and `updated_at` are set by the database.)
