# FinMatter — Mobile MVP screens (locked)

**Purpose:** Single source of truth for all app screens. Use with Stitch MCP (or any design tool) for wireframes. Each screen notes the backing API; gaps are called out in § APIs missing or to add.

**Reference:** [Cumulative Product & Milestone Plan](cumulative-product-milestone-plan.md).  
**Canonical order for Stitch & implementation:** [screens-order.md](screens-order.md) (Phases A–K, 1–29).

---

## 1. Auth & identity

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Login** | Sign in (email/OTP or Supabase Auth) | Auth provider / Supabase Auth | Optional |
| **Sign up / Register** | Create account | Auth provider / Supabase Auth | Optional |
| **Forgot password / Reset** | Recover access | Auth provider | Optional |

*MVP can ship with x-user-id only; add these when real auth is required.*

---

## 2. Onboarding

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Welcome / Splash** | First launch; value prop | — | ✅ |
| **Upload first statement** | Get first data | POST /api/statements/upload | ✅ |
| **Upload success / Processing** | Confirm upload, processing state | Same + GET /api/statements/[id]/parse (status) | ✅ |
| **Onboarding checklist** (optional) | Add cards, pick period, etc. | — | Later |

---

## 3. Home & navigation

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Home / Dashboard** | “How am I doing?” | GET /api/rewards, POST /api/optimize/rewards | ✅ |
| **Tab bar / Main nav** | Switch between main areas | — | ✅ |

---

## 4. Cards

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Add Card** | Add a card to “My cards” (for optimize/recommend) | GET /api/catalog (pick from list); local/store “my cards” | ✅ |
| **Card catalog (list)** | Browse all cards | GET /api/catalog | ✅ |
| **Card detail** | Single card metadata | GET /api/catalog/[id] | ✅ |
| **My cards / Selected cards** | Cards user uses for compare & recommend | Local / profile (no backend persistence in MVP) | ✅ |
| **Card Comparison** | Compare 2+ cards (best, missed, by category) | POST /api/optimize/rewards (same as Optimization) | ✅ |

---

## 5. Statements & upload

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Upload Statement** | Upload PDF (from anywhere in app) | POST /api/statements/upload | ✅ |
| **Statement status / list** (optional) | List or status of uploaded statements | — (no list API today; could use storage or add GET /api/statements) | Later |

*Upload Statement is the same flow as “Upload first statement” in onboarding; can be reused in Profile or Home.*

---

## 6. Transactions (spends)

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Transactions list** | “Where did my money go?” | GET /api/canonical-transactions | ✅ |
| **Transaction detail** | Single transaction (amount, category, merchant, date) | Same response (one item); no separate detail API | ✅ |
| **Filters BottomSheet** | Filter by period, card, category | GET /api/canonical-transactions *(see § APIs to add: optional query params)* | ✅ |

*Today GET /api/canonical-transactions has no period/cardId; filters may be client-side until API supports periodStart, periodEnd, cardId.*

---

## 7. Transaction corrections

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Edit Category** | Change spend_category for a transaction | **Missing:** PATCH /api/canonical-transactions/[id] (or /api/transactions/[id]/category) | ✅ screen; API TBD |

*Requires new API to update canonical_transactions.spend_category.*

---

## 8. Rewards

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Rewards overview** | One card + period: total, by category | GET /api/rewards | ✅ |
| **Rewards by category** | Breakdown (shopping, dining, etc.) | Same (periodSummary.byCategory) | ✅ |
| **Milestones** | Card milestone progress / triggered (e.g. “Spent ₹1L, got bonus”) | GET /api/rewards (periodSummary.milestonesTriggered) | ✅ |

---

## 9. Optimization & comparison

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Optimization insights** | “What did I miss?” Best card, missed reward, by category | POST /api/optimize/rewards | ✅ |
| **Optimization by category** | Best card per category + “why” | Same (response.byCategory) | ✅ |
| **Card Comparison** | Compare selected cards (same as Optimization) | POST /api/optimize/rewards | ✅ |

---

## 10. Recommendations

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Recommendations list** | Cards that beat my baseline | POST /api/recommend/cards | ✅ |
| **Recommendation detail** | One recommended card: why, categories, delta | Same (one item from response.recommendations) | ✅ |

---

## 11. Insights & trends

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Insights / Trends** | Spend over time, category breakdown, trends | **Option A:** Client-side aggregation from GET /api/canonical-transactions. **Option B (future):** GET /api/insights/trends or similar | ✅ screen; API TBD |

*Cumulative plan defers “predictions”; historical trends can be client-side from transactions or a small aggregation API later.*

---

## 12. Goals (post-MVP / deferred)

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Goals list** | User-defined goals (e.g. “Earn 5000 rewards this quarter”) | **Missing:** GET /api/goals (or equivalent) — not in current product plan | Later |
| **Goal detail** | Single goal + progress | **Missing:** GET /api/goals/[id] | Later |
| **Goal create / edit** | Create or edit a goal | **Missing:** POST /api/goals, PATCH /api/goals/[id] | Later |

*Goals imply progress tracking and possibly projections; cumulative plan defers projections. Treat as post-MVP scope and new API.*

---

## 13. Email / SMS integration (deferred)

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Email / SMS Integration** | Connect inbox or SMS for statement ingestion | **Deferred:** No API (SMS/Account Aggregator deferred per plan) | Later |

*Cumulative plan: “No AA / SMS ingestion” in MVP.*

---

## 14. AI Assistant (Milestone 9)

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **AI Assistant / Chat** | Ask “why”, “how much”, “what to use” | Tools: getTransactions, getRewards, optimizeRewards, recommendCards | M9 |
| **Suggested prompts** | “Why is card X better?”, “Where did I miss?” | — | M9 |

---

## 15. Profile & settings

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Profile / Account** | User id, email (if auth), app version | Auth / config | ✅ |
| **Settings** | Preferences, defaults (e.g. default period) | Local / config | Optional |
| **About / Help** | What is FinMatter, how it works | — | Later |

---

## 16. Supporting / system

| Screen | Purpose | Backed by | MVP |
|--------|--------|-----------|-----|
| **Loading / Skeleton** | While APIs resolve | — | ✅ |
| **Error state** | API failed, no network | — | ✅ |
| **Empty state** | No transactions / no rewards yet | — | ✅ |

---

## API gaps (missing or to add)

This section lists every API gap implied by the screens above. Use it for backend planning and to avoid building UI that has no API.

### Summary by priority

| Priority | Gap | Screen(s) | When |
|----------|-----|-----------|------|
| **MVP (optional)** | Transaction filters | Transactions list, Filters BottomSheet | Add query params or keep client-side |
| **MVP (if Edit Category in scope)** | Edit transaction category | Edit Category | New PATCH endpoint |
| **MVP (client-side ok)** | Insights/trends | Insights / Trends | Client aggregate from transactions, or add API later |
| **Optional** | List statements | Statement status / list | GET /api/statements if needed |
| **Post-MVP** | Goals | Goals list, detail, create | New goals domain + APIs |
| **Deferred** | Email/SMS ingestion | Email / SMS Integration | No API until SMS/AA in plan |

### Detail: APIs missing or to add

| Need | Screen(s) | Recommendation |
|------|-----------|----------------|
| **Optional filters on transactions** | Transactions list, Filters BottomSheet | Add optional query params to GET /api/canonical-transactions: e.g. `periodStart`, `periodEnd`, `cardId` (and optionally `spendCategory`). If not added, filtering is client-side only. |
| **Edit transaction category** | Edit Category | Add **PATCH /api/canonical-transactions/[id]** (or **PATCH /api/transactions/[id]/category**) with body e.g. `{ spend_category: string }`. Requires backend + DB update to `canonical_transactions`. |
| **Insights/trends** | Insights / Trends | **Option A (MVP):** No new API; aggregate in client from GET /api/canonical-transactions (e.g. by month, by category). **Option B:** Add GET /api/insights/trends (or /api/analytics) later for server-side aggregation. |
| **Goals** | Goals list, detail, create | **Post-MVP.** New domain + APIs: e.g. POST/GET/PATCH /api/goals, progress derived from rewards/transactions. Align with product plan (currently deferred). |
| **Email/SMS ingestion** | Email / SMS Integration | **Deferred** per cumulative plan. No API until product/ops commit to SMS/AA. |
| **List statements** (optional) | Statement status / list | Optional: **GET /api/statements** to list user’s uploads; not required for MVP if upload is the only entry. |

---

## Screen count summary

| Area | Screens (MVP) | Screens (later) |
|------|----------------|-----------------|
| Auth | 0–3 (optional) | — |
| Onboarding | 2–3 | 1 |
| Home & nav | 2 | — |
| Cards | 5 | — |
| Statements | 1 | 1 |
| Transactions | 3 | — |
| Edit category | 1 | — |
| Rewards + Milestones | 3 | — |
| Optimization + Comparison | 3 | — |
| Recommendations | 2 | — |
| Insights/Trends | 1 | — |
| Goals | — | 3 |
| Email/SMS | — | 1 |
| AI Assistant | — | 2 (M9) |
| Profile & settings | 1–2 | 1 |
| Supporting | 3 | — |

**Use this doc as the locked screen list for Stitch MCP (or any design tool).** When adding a screen, add a row here and note “Backed by” and any API gap.
