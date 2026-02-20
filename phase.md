# Phase-by-Phase Roadmap (Concrete)

## PHASE 1 — Domain Modeling (Next 3–5 days)

🎯 **Goal:** Make FinMatter real, not conceptual.

**Deliverables**

- Transaction schema
- Credit Card schema
- Reward rule representation

**Why now?**

- Everything else depends on this
- Agents become useful only after this
- Prevents hallucinated logic later

### Phase 1.1 — Transaction Model (FIRST)

**Design:**

- Raw transaction
- Normalized transaction
- Categorized transaction

**You’ll answer:**

- What is a transaction exactly?
- What fields are immutable?
- What can be recomputed?

### Phase 1.2 — Credit Card Catalog Schema

**Design:**

- Card
- Variant
- Network
- Fees
- Milestones
- Reward structures

**This becomes:**

- `credit_cards` table
- Versioned rules

### Phase 1.3 — Reward Rules DSL (Most Important)

**Design:**

- How rules are represented
- How caps are modeled
- How milestones are tracked
- How recomputation works

This is core IP.

---

## PHASE 2 — Deterministic Engines (Next 5–7 days)

🎯 **Goal:** Make money math bulletproof.

**Deliverables**

- Rewards calculation engine
- Cap tracking engine
- Milestone tracker
- What-if simulation

No UI. No AI. Just correctness.

---

## PHASE 3 — Backend APIs (Next 3–4 days)

🎯 **Goal:** Expose engines cleanly.

**Deliverables**

- Ingest transactions
- Query rewards
- Fetch optimization insights
- Card recommendation endpoints

---

## PHASE 4 — Mobile MVP (Next 5–7 days)

🎯 **Goal:** Make it usable.

**Deliverables**

- View transactions
- View rewards
- See optimization insights
- Basic recommendations

---

## PHASE 5 — AI Assistant (Last)

🎯 **Goal:** Add intelligence safely.

**Deliverables**

- AI explanation layer
- Natural language interface
- Tool calling into deterministic engines

AI comes after correctness.

---

## How Your Agents Fit Going Forward

| Phase           | Agent Role                |
| --------------- | ------------------------- |
| Domain modeling | You + Product Owner agent |
| Schema design   | You + Developer agent     |
| Rewards engine  | You + Finance agent       |
| Testing         | Tester agent              |
| Implementation  | Developer agent           |
| Validation      | Finance + Tester          |
