# Milestone 3 — Reward Rules DSL (PRD)

**Product Owner** — Scope, acceptance criteria, and handoff for the Reward Rules DSL. No financial logic invented; no architecture designed here. Focus: what “done” looks like and how we know it.

**Reference:** [milestone-3-reward-rules-dsl-plan.md](../milestone-3-reward-rules-dsl-plan.md) — step-by-step plan (scope, rule types, interpretation strategy, types in code, one example card, interpretation policy).

**Prerequisites (done):** Catalog v1 (~10 cards, declaration-only); Transaction Foundation v1 (canonical transactions, SpendCategory). Catalog is frozen as handoff; rules adapt to catalog, not the other way around.

---

## Problem statement

The catalog stores **what each card declares** (benefits, milestones, declaredConstraints). Downstream we need to **compute rewards** from user spend: “For this card and this category, what rule applies? What did I earn?” Today we have no machine-executable representation of those rules—only human-readable text in the catalog. Without a clear, deterministic representation, we cannot build a rewards engine that is correct, auditable, or explainable. **The Reward Rules DSL is the bridge: turn declarations into a typed, card-scoped rule set that an engine can execute. No execution in this milestone—only representation.**

---

## Goals

- **Representation, not execution.** Define the **shape** of reward rules (category rate, cap, exclusion, milestone) and how they are scoped to a card. No engine that runs transactions through rules in this milestone.
- **Deterministic and declarative.** Rules are explicit, card-scoped, and traceable to the catalog (e.g. sourceConstraintIndex, sourceMilestoneIndex). No AI, no PDF/statement parsing, no DB inside the DSL.
- **One unambiguous answer per (card, category, period).** For a given card and spend category and period, the rule set must allow answering: “Which rule R applies?” (e.g. one rate + one cap per category per period) without ambiguity.
- **Traceability.** Every rule can be linked back to catalog declarations (declaredConstraints or milestones) so we can explain “this rule comes from that line.”
- **Handoff to engine.** When the rule types and one example card’s rule set are agreed and stable, document “DSL v1 frozen” and hand off to Phase 2 (Deterministic Rewards Engine). The engine will consume rule sets + canonical transactions; that is out of scope here.

---

## Non-goals

- **Do not implement the rewards engine.** No code that takes transactions and outputs rewards, caps, or milestone progress. That is Phase 2.
- **Do not parse PDFs, statements, or AI.** The DSL does not read raw data; it only defines the structure of rules. Inputs to the (future) engine are rule sets + already-canonical, already-categorized transactions.
- **Do not invent financial logic.** Rule content (rates, caps, thresholds) comes from human-curated data derived from the catalog (and MITC/bank_site). No guessing or inferring rules from prose.
- **Do not change the catalog schema.** Catalog stays declaration-only. Rules reference catalog by card id and optional constraint/milestone indices; the catalog is not extended to store executable rules.
- **Do not support every Indian card in M3.** One example card’s full rule set is enough to prove the representation. Scaling to all catalog cards is post–DSL v1 freeze.

---

## User stories and acceptance criteria

| ID | Story | Acceptance criteria |
|----|--------|---------------------|
| R1 | As a **developer** I have a typed representation of reward rules (category rate, cap, exclusion, milestone) so the future engine can consume them. | AC1: Type definitions exist for at least: CategoryRateRule, CapRule, ExclusionRule, MilestoneRule; union RewardRule; CardRuleSet (cardId + rules). AC2: Types reuse existing domain enums (SpendCategory, Period, RewardCurrency). AC3: No execution logic—only types (and constants if needed). |
| R2 | As a **developer** I can attach a rule to its source in the catalog so we can explain “why this rule.” | AC1: Each rule type supports optional traceability fields (e.g. sourceConstraintIndex, sourceMilestoneIndex, sourceRef). AC2: When we write a rule set for a card, we can point to the catalog entry and, where applicable, to the specific declaredConstraint or milestone index. |
| R3 | As a **product/finance** stakeholder I can see one example card’s full rule set and validate that (card, category, period) → rule is unambiguous. | AC1: One card (e.g. HDFC Millennia or ICICI Amazon Pay) has a complete rule set in the agreed format (e.g. JSON or TS). AC2: A short doc or table shows 2–3 example (card, category, period) → “which rule R applies” with no ambiguity. AC3: The example is signed off before we freeze DSL v1. |
| R4 | As a **developer** I know how we go from catalog to rule set (interpretation strategy) so we can add more cards later. | AC1: Interpretation strategy is documented: e.g. milestones → MilestoneRule automatically from catalog; category rates/caps/exclusions from a manual rule set per card that references declaredConstraints. AC2: Policy is documented: new cards’ rules are added manually from MITC/bank_site + catalog; no AI-invented rules; finance/product sign-off for new or changed rule sets. |
| R5 | As a **team** we can freeze DSL v1 and hand off to the rewards engine. | AC1: When the one example card is agreed and types are stable, a short “Reward Rules DSL v1 frozen” note is written. AC2: Handoff states: engine will consume CardRuleSet + canonical transactions; engine is Phase 2, not M3. |

---

## Scope for Milestone 3 (first deliverable)

- **Rule types:** Category rate, cap, exclusion, milestone (as in the step-by-step plan). Order or priority within a card’s rule set is defined so that “which rule applies” is unambiguous (e.g. one rate + one cap per category per period).
- **Interpretation strategy:** Hybrid (recommended): milestones from catalog → MilestoneRule; category rates/caps/exclusions from manual rule set per card with traceability to declaredConstraints. No auto-parsing of constraint prose in v1.
- **Where rule sets live:** Decided in implementation (e.g. JSON file per card in repo, or DB table). Not specified here; only that we can produce a CardRuleSet for a given card id.
- **One example card:** Full rule set + 2–3 (card, category, period) → rule examples. No engine yet.
- **DSL v1 freeze:** When the example is agreed and types are stable, document freeze and hand off to Phase 2.

---

## Ambiguities and decisions to fix

- **Period for category rates:** Are rates “per transaction” or “per period”? Must be decided and documented so caps and rates align (e.g. “per ₹100 per statement” vs “per ₹100 per month”). *Flagged for implementation.*
- **Multiple rules per (category, period):** e.g. one rate + one cap. Order or priority (e.g. “apply rate then cap”) must be explicit so the engine has one interpretation. *Flagged for implementation.*
- **Exclusion scope:** Is an exclusion “no reward for this category” or “no reward for this category when combined with X”? v1: “no reward for this category” only. *Recommend documenting in interpretation policy.*

---

## Out of scope for this PRD

- Phase 2: Deterministic Rewards Engine (implementation of execution over rule sets + transactions).
- Any change to catalog schema or catalog content.
- Support for all catalog cards in M3 (one example card suffices).
- AI or automated derivation of rules from prose.

---

## Action items

| # | Action | Owner |
|---|--------|--------|
| 1 | Agree DSL scope (inputs, outputs, boundaries) per step-by-step plan Step 1. | PO + Developer |
| 2 | Define rule types in code (Step 4); export from domain or rewards package. | Developer |
| 3 | Document interpretation strategy and where rule sets live (Step 3). | Developer + PO |
| 4 | Implement one example card’s rule set; document 2–3 (card, category, period) → rule examples (Step 5). | Developer |
| 5 | Document interpretation policy (how new cards get rules; sign-off). | PO |
| 6 | When example is agreed and types stable: document “Reward Rules DSL v1 frozen” and hand off to Phase 2. | PO |
