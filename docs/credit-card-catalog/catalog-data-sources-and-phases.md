# Credit Card Catalog — Data Sources and Phases

**Policy** for where catalog data comes from, how it is entered, and how that evolves. Ensures correctness and auditability; avoids AI or scraping as truth.

---

## Phase 1 (NOW): Manual + Verifiable — Gold Standard

**Primary sources (authoritative):**

| Source | Role | Notes |
|--------|------|--------|
| **MITC PDFs** (Most Important Terms & Conditions) | Strongest | Bank-issued, legally binding, versioned by date. **Preferred source.** |
| **Official bank product pages** | Authoritative | Fees, milestones, benefits. Sometimes incomplete but useful. |
| **Your own statements** | **Validation only** | Confirms outcomes (points, cashback). **Never used to infer rules.** |

**How it works:**

- You (or an ops person) read the MITC (or bank page).
- Enter data into the catalog schema.
- Attach `source_url` / `source_pdf` and mark `verifiedAt`.
- This is slow — and that’s intentional.

**v1 goal:** Correctness, not coverage. 5 cards × 100% confidence, not 100 cards × 60% confidence.

---

## Phase 2: AI-Assisted Entry (Not AI-Generated Truth)

Once schema and patterns are stable:

- **AI is a copilot, never a source.**
- Example workflow:
  1. Upload MITC PDF.
  2. AI extracts candidate fields (fees, milestone thresholds, benefit text blocks).
  3. Human reviews and approves.
  4. Only approved data enters the catalog.
- AI output is always a **draft**; never committed automatically.

---

## Phase 3: Scraping (Read-Only, Advisory)

Scraping helps **detect changes**, not define truth.

- Use it to: alert (“Annual fee changed on website”), flag (“New benefit section added”).
- Scraped data must be reviewed; **MITC still overrides everything.**

---

## Why This Order Matters (Non-Negotiable)

- Credit cards are **legal products**; rewards are **contractual**.
- Wrong data → wrong advice → regulatory risk.
- AI is bad at: exclusions, caps, legal nuance, knowing when a rule changed.
- So: **AI helps extract; humans decide.** Scraping informs; MITC wins.

---

## Source-Aware Fields (What Goes Into the Catalog)

Every field should know where it came from. Example:

```ts
fees: {
  annual: {
    amount: 2500,
    currency: "INR",
    source: "MITC",
    sourceRef: "hdfc_regalia_mitc_2024.pdf#page=3"
  }
}
```

This makes the system **auditable**, **explainable**, and **enterprise-grade**. Schema should support `source` and `sourceRef` (or equivalent) at least at record level; per-field is ideal where we can (e.g. fees, milestones).

---

## What NOT to Over-Engineer (Yet)

- **Don’t** build scraping infra now.
- **Don’t** build AI-only ingestion.
- **Don’t** aim for 100+ cards in v1.

**Start with 5 cards × 100% confidence.**

---

## References

- **PRD:** [milestone-2-catalog-prd.md](milestone-2-catalog-prd.md)
- **Content and data model:** [catalog-content-and-data-model.md](catalog-content-and-data-model.md)
- **Finance verification:** [milestone-2-catalog-finance-verification.md](milestone-2-catalog-finance-verification.md) — includes verification of this data-sources-and-phases policy and required schema (record-level + fee-level source/sourceRef).
