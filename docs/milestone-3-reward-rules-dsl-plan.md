# Milestone 3 — Reward Rules DSL: Step-by-step plan

**Purpose:** Turn catalog declarations (benefits, milestones, `declaredConstraints`) into **machine-executable reward logic** without changing the catalog. Design representation first; engine later.

**Principles:** Deterministic, declarative, card-scoped. No PDF/statement parsing, no AI, no DB inside the DSL.

**Order:** Plan **statement ingestion** first (Product Owner agent on `docs/statement-ingestion-brief-for-po.md`); use PO output to scope and implement ingestion. Then proceed with Milestone 3 (Reward Rules DSL) steps below.

---

## Prerequisites (done)

- [x] Catalog v1: ~10 cards, `CardVariant` schema, GET `/api/catalog` and `/api/catalog/[id]`
- [x] Transaction Foundation v1: canonical transactions, `SpendCategory` + confidence
- [x] Catalog is declaration-only: `milestones`, `declaredConstraints`, `benefits` — no reward math

---

## Step 0 — Optional: Freeze Catalog v1

**Goal:** Process checkpoint so DSL design is not derailed by catalog churn. Rules adapt to catalog, not the other way around.

| Action | Detail |
|--------|--------|
| Create a short doc | e.g. `docs/credit-card-catalog/catalog-v1-freeze.md` |
| State | Schema is frozen; current ~10 cards are “v1 truth”; future changes are versioned (`effectiveFrom` / `effectiveTo`, new rows); handoff to Reward Rules DSL (Milestone 3). |
| No code changes | Just a clear handoff. |

**Output:** One markdown file; team agrees “catalog v1 frozen.”

---

## Step 1 — Scope the DSL (what it is and isn’t)

**Goal:** Agree inputs, outputs, and boundaries so the DSL stays focused.

| Item | Content |
|------|--------|
| **Inputs** | Card ID (references catalog), `SpendCategory`, reward currency (from catalog), period (`monthly` / `quarterly` / `yearly`). |
| **Outputs** | “For card X, category Y, period P → apply **rule R**” where R is a single, well-typed rule (e.g. rate, cap, exclusion, milestone). |
| **DSL does** | Define the **representation** of rules (grammar + types). Optionally define how we **derive** rules from catalog (e.g. milestones → structured rules; constraints → reference only). |
| **DSL does not** | Read PDFs, parse statements, call AI, or access DB. It does not **execute** rules (that’s the engine). |

**Deliverable:** Short “DSL scope” section in this doc or in `docs/reward-rules-dsl-scope.md`: 1 page max.

---

## Step 2 — Define rule types (grammar + types)

**Goal:** Enumerate the kinds of rules the engine will need and give each a type.

**Suggested rule kinds (refine as needed):**

| Rule kind | Purpose | Example (human) |
|-----------|---------|------------------|
| **Category rate** | Earn N units per ₹100 in category | 5% cashback on shopping (rate 5 per 100) |
| **Cap** | Max units per period for a category or globally | Cap 1000 points per month |
| **Exclusion** | No rewards for category / transaction type | No rewards on fuel, rent, wallet load |
| **Milestone** | If spend in period ≥ threshold → one-time reward | Spend ₹1.9L/year → 15k points |

**Design choices to fix:**

- **Card-scoping:** Each card has a **rule set**: list of rules. Order or priority if two rules could apply (e.g. category rate + cap).
- **Traceability:** Each rule can reference `declaredConstraint` index and/or `milestone` index so we can say “this rule comes from that line in the catalog.”
- **Period alignment:** Caps and milestones use `Period` (monthly/quarterly/yearly); category rates may be “per transaction” or “per period” — decide and document.

**Deliverable:** Type definitions (in words or TypeScript) for at least: `CategoryRateRule`, `CapRule`, `ExclusionRule`, `MilestoneRule`, and a `CardRuleSet` (cardId + array of rules). No engine yet.

---

## Step 3 — Map catalog → rules (interpretation strategy)

**Goal:** Decide how we go from `CardVariant` (milestones, declaredConstraints) to a `CardRuleSet`.

**Options:**

| Option | Description | Pros / cons |
|--------|-------------|-------------|
| **A. Manual rule set per card** | Separate data (file or table): “card X has rules R1, R2…” with optional refs to constraint/milestone indices. | Clear, auditable; no guessing. More manual work per card. |
| **B. Auto-interpret constraint text** | Parser that turns `declaredConstraints[].description` into rules. | Fewer manual rules. Fragile, language-dependent, hard to verify. |
| **C. Hybrid** | Milestones → structured `MilestoneRule` automatically from catalog. Category rates/caps/exclusions from a **manual** rule set that references constraint text. | Balances automation (milestones are structured) with safety (rates/caps from human-curated rules). |

**Recommendation:** Start with **C**. Milestones already have `threshold`, `period`, `declaredReward` — map them 1:1 to `MilestoneRule`. For category rates, caps, exclusions: maintain a rule set per card (e.g. JSON or DB table) with optional `sourceConstraintIndex` / `sourceMilestoneIndex` for traceability.

**Deliverable:** Short “Interpretation strategy” section: how we produce a `CardRuleSet` for a given card (and where that set lives: repo file vs Supabase table). No implementation yet.

---

## Step 4 — Types in code

**Goal:** Implement the rule types in the repo so the engine (later) and any tooling can depend on them.

| Action | Detail |
|--------|--------|
| Add types | In `packages/domain` (or new `packages/rewards` if you prefer to keep domain catalog-only). Types: `CategoryRateRule`, `CapRule`, `ExclusionRule`, `MilestoneRule`, union `RewardRule`, `CardRuleSet`. |
| Reuse existing enums | `SpendCategory`, `Period`, `RewardCurrency` from domain. |
| Traceability | Optional fields on each rule: `sourceConstraintIndex?: number`, `sourceMilestoneIndex?: number`, `sourceRef?: string`. |
| No engine logic | Only types (and maybe constants). No execution. |

**Deliverable:** New file(s) under `packages/domain/src/` (e.g. `reward-rule.ts`) or `packages/rewards/src/` with types exported. Build passes.

---

## Step 5 — One example card, end-to-end

**Goal:** Prove the representation works for one real card.

| Action | Detail |
|--------|--------|
| Pick one card | e.g. HDFC Millennia or ICICI Amazon Pay — one with clear category rates and caps. |
| Write its rule set | In the new format (e.g. JSON or TS object): list all rules, with refs to catalog `id` and to `declaredConstraints` / `milestones` where applicable. |
| Validate | For that card, for each relevant (category, period), answer: “Which rule R applies?” and ensure it’s unambiguous (e.g. one rate + one cap per category per period). |
| Document | One page: “Example: Millennia rule set” with the rule set and 2–3 example (card, category, period) → rule outcomes. |

**Deliverable:** One card’s rule set in repo (file or seed data) + short doc. No engine yet.

---

## Step 6 — Document interpretation policy

**Goal:** So that adding new cards doesn’t break the “deterministic, explainable” contract.

| Topic | Policy |
|-------|--------|
| **Adding a new card’s rules** | Manual: from MITC / bank_site + catalog’s `declaredConstraints` / `milestones`. No AI-invented rules. |
| **Who signs off** | Finance / product for new or changed rule sets (same as catalog). |
| **DSL v1 freeze** | When the one example card is agreed and the types are stable, document “Reward Rules DSL v1 frozen” and hand off to **Phase 2 — Deterministic Rewards Engine**. |

**Deliverable:** Short “Interpretation policy” section or doc; optional “DSL v1 freeze” note when moving to engine.

---

## Statement ingestion (plan first, then implement)

- **Plan first:** Run the Product Owner agent on the statement-ingestion brief to get refined requirements (problem statement, goals, non-goals, user stories, acceptance criteria). **Input:** `docs/statement-ingestion-brief-for-po.md`. **Command:** From `packages/ai`: `pnpm agent product_owner ../../docs/statement-ingestion-brief-for-po.md` (requires Ollama with `qwen2.5:7b`).
- **Then:** Use the PO output to drive implementation (upload API, run extract → parse → pipeline, persist to `canonical_transactions`, update `statement_files`).
- **No dependency on DSL.** Statement ingestion can be planned and built in parallel with or before Milestone 3 (Reward Rules DSL).
- **Reference:** `docs/statement-ingestion-brief-for-po.md`; existing backend extraction/parsing (HDFC, ICICI, Amex, HSBC), normalization, categorization, dedup, pipeline.

---

## After the plan — Phase 2: Deterministic Rewards Engine

- **Starts after:** Catalog v1 frozen (optional Step 0) + Reward Rules DSL agreed and stable (Steps 1–6).
- **Inputs:** Rule sets (from DSL) + canonical (categorized) transactions.
- **Outputs:** Per-transaction or per-period rewards, caps hit, milestone progress.
- **Constraints:** Pure TypeScript, no DB inside engine; DB only for storing results and linking to catalog/transactions.

---

## Checklist (copy and tick)

- [x] **Step 0** — Optional: Freeze Catalog v1 doc
- [x] **Step 1** — Scope the DSL (inputs, outputs, boundaries) — in PRD + this plan
- [x] **Step 2** — Define rule types (grammar + types) — in `packages/domain/src/reward-rule.ts`
- [x] **Step 3** — Map catalog → rules (interpretation strategy) — `docs/reward-rules-dsl/interpretation-strategy.md`
- [x] **Step 4** — Types in code (`reward-rule.ts` or equivalent) — `packages/domain/src/reward-rule.ts`, exported from domain
- [x] **Step 5** — One example card, end-to-end — `apps/backend/src/db/data/rule-sets/hdfc-millennia.json` + `docs/reward-rules-dsl/example-hdfc-millennia.md`
- [ ] **Step 6** — Interpretation policy (+ optional DSL v1 freeze) — policy in interpretation-strategy.md; freeze when example signed off
- [ ] **Parallel** — Statement ingestion (no block on DSL)
- [ ] **Next** — Phase 2: Rewards engine (after DSL stable)

---

## What we've done (Milestone 3)

Summary of what is in place as of this plan.

| Done | What |
|------|------|
| **Catalog v1 freeze** | `docs/credit-card-catalog/catalog-v1-freeze.md` — schema and ~10 cards frozen; handoff to DSL and engine. |
| **DSL scope** | PRD (`docs/reward-rules-dsl/milestone-3-reward-rules-dsl-prd.md`) + this plan: inputs (card, category, period), outputs (rule R), boundaries (no execution, no AI, no PDF parsing). |
| **Rule types** | `packages/domain/src/reward-rule.ts`: CategoryRateRule, CapRule, ExclusionRule, MilestoneRule, RewardRule, CardRuleSet; RuleTraceability. Reuses SpendCategory, Period from domain. JSDoc reflects Finance units (rate per ₹100, cap per period, milestone in INR, exclusion semantics). Exported from `@finmatter/domain`. |
| **Interpretation strategy** | `docs/reward-rules-dsl/interpretation-strategy.md`: how catalog → rule set (milestones from catalog; rates/caps/exclusions from manual rule set); where rule sets live (`apps/backend/src/db/data/rule-sets/<cardId>.json`); rule order for engine; units and semantics (Finance clarifications); policy for new cards (manual, sign-off). |
| **One example card** | HDFC Millennia: `apps/backend/src/db/data/rule-sets/hdfc-millennia.json` (exclusions, category rates, caps, milestone) with traceability. `docs/reward-rules-dsl/example-hdfc-millennia.md`: rule summary, (card, category, period) → rule examples, mapping choices (shopping = select online; cap period = monthly proxy; government not modeled). |
| **Finance verification** | `docs/reward-rules-dsl/example-hdfc-millennia-finance-verification.md`: rule set checked against catalog; agree with documented mapping/limitations; sign-off condition satisfied. |
| **Interpretation policy** | In interpretation-strategy.md: new cards = manual from MITC/bank_site + catalog; Finance/product sign-off; no AI-invented rules. |

**Not done yet:** Formal “Reward Rules DSL v1 frozen” note (Step 6); Phase 2 Deterministic Rewards Engine.
