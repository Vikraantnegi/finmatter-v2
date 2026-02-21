# Milestone 2 — Credit Card Catalog (PRD)

**Product Owner** — Scope, acceptance criteria, and action items for the Credit Card Catalog.

**Canonical content and data model:** [catalog-content-and-data-model.md](catalog-content-and-data-model.md) — What each card variant contains (identity, fees, milestones, benefits, declared caps, versioning), design principles, core `CardVariant` model, v1 target and success criteria.

**Developer plan:** [milestone-2-catalog-developer-plan.md](milestone-2-catalog-developer-plan.md) — Steps, files to create/update, storage choice, schema approach, versioning, testing. No implementation until plan is confirmed.

**Data sources and phases:** [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md) — Phase 1 manual + verifiable (MITC preferred); Phase 2 AI-assisted draft only; Phase 3 scraping advisory; source-aware fields; no over-engineering in v1.

---

## Problem statement

Reward rules (Milestone 3) and downstream engines need a **single source of truth** for what each card **claims**: metadata, fees, milestones, benefit eligibility, and caps. Without a catalog, rules have no anchor, validation is impossible, and versioning becomes chaos. **Catalog defines the universe; rules operate inside it.**

Today we have canonical transactions (Option A done) but no structured card data. We need a **Credit Card Catalog v1**: versioned, verifiable, no reward math yet—just what each card declares.

---

## Goals

- **Single source of truth** for Indian credit cards: one place that describes each card’s metadata, fees, milestones, and benefit declarations.
- **Versioned and verifiable:** Every card (or card variant) has a version; data is auditable and traceable.
- **Structured, not prose:** Fields needed for future reward rules (e.g. reward currency, fee structure, milestone existence, benefit eligibility, caps scope—monthly/quarterly/yearly) are modeled explicitly where possible in v1.
- **Catalog v1 scope:** Start with the cards the product owner personally owns; fully verifiable data; no reward calculations in this milestone.
- **No reward math in catalog:** Catalog stores **what the card claims**; it does not compute rewards, caps, or milestones. That belongs to the Reward Rules DSL and deterministic engines (Milestones 3–4).

---

## Non-goals

- Do not implement reward calculation, cap tracking, or milestone logic; that is Milestone 3+.
- Do not infer or guess card benefits; only store declared, verifiable data.
- Do not build recommendation or optimization logic; catalog is input to those later.
- Do not add every Indian card; v1 is a small, curated set (e.g. cards you own) to prove the schema and process.

---

## User stories and acceptance criteria

| ID | Story | Acceptance criteria |
|----|------|---------------------|
| C1 | As a system I have a single place that describes each credit card (metadata, fees, milestones, benefit declarations). | AC1: A catalog entity (e.g. card or card variant) exists with fields for bank, variant name, network, fees (e.g. joining, annual), milestone declarations (e.g. “spend X get Y”), benefit eligibility (e.g. lounge, fuel), and caps scope (monthly/quarterly/yearly) where applicable. AC2: Data is versioned (e.g. version or updated_at); no silent overwrites without trace. |
| C2 | As a developer I can add or update a card in the catalog with verifiable, declared data only. | AC1: Add/update flows do not allow free-text “benefits”; structured fields or explicit “declared” content only. AC2: Source of truth (e.g. MITC, bank page) can be recorded for audit. AC3: No reward logic or calculation in the catalog. |
| C3 | As a downstream consumer (future reward engine) I can read the catalog to know what a card claims. | AC1: Reward rules (later) can reference catalog entries (e.g. by card id or variant id). AC2: Catalog does not dictate how rules compute rewards; it only exposes what the card declares. |

---

## Scope for Catalog v1 (first deliverable)

- **Cards:** The cards the product owner personally owns (e.g. HDFC 1–2, ICICI 1, Amex 1, HSBC 1 — ~5 cards; depth over breadth).
- **Data:** Fully verifiable (from statement, MITC, or bank page); no guessed or inferred benefits. Entry is **Phase 1 only**: manual entry; MITC preferred; statements for validation only, never to infer rules. See [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md).
- **Versioning:** Every record has a version or timestamp; history is auditable.
- **No reward math:** No calculation of rewards, caps, or milestones in this milestone; only storage of declarations.

Once **Catalog v1 is frozen** (schema stable, 2–4 cards loaded, Finance sign-off), the next step is to design the **Reward Rules DSL** (Milestone 3).

---

## Action items

| # | Action | Owner |
|---|--------|--------|
| 1 | Define catalog schema from [catalog-content-and-data-model.md](catalog-content-and-data-model.md) (CardVariant: bank, family, variantName, network, rewardCurrency, fees, milestones, benefits, declared caps, versioning). | PO + Developer |
| 2 | Choose storage (e.g. Supabase table(s), or JSON/TS in repo for v1). | Developer |
| 3 | Implement add/update for catalog entries; versioning and audit. | Developer |
| 4 | Load ~5 cards (product owner’s cards: HDFC, ICICI, Amex, HSBC) with verifiable data; freeze Catalog v1. | PO + Developer |
| 5 | Document “Catalog v1 frozen” and handoff to Reward Rules DSL design. | PO |

---

## Out of scope for this PRD

- Reward Rules DSL design (Milestone 3).
- Deterministic engines (Milestone 4).
- Recommendation or optimization logic.
- Parsing or ingestion of card data from PDFs (manual or semi-manual entry for v1 is acceptable).
