# FinMatter — Cumulative Product & Milestone Plan (Authoritative)

**Single source of truth** for product identity, current state, next milestones, and what is in/out of scope. Finance-verified.

---

## 1. Product identity (locked)

**FinMatter** is a **credit-card–first** personal finance platform for **India**.

**Core promise (unchanged):**

> “I know which card to use, why, and what I gained.”

**Operating principles (locked):**

- **Deterministic money math** — Pure TS engine; one source of truth for rewards.
- **No invented benefits, rates, caps, or eligibility** — Only declared rules and engine output.
- **AI explains and navigates** — Never computes or decides money.
- **Backend truth → APIs → UI → AI** — One-way flow; no logic in clients.

---

## 2. Where we are today (finalized state)

### Milestones completed (1–7)

| # | Milestone | Status | What it gives you |
|---|-----------|--------|-------------------|
| 1 | Transaction Foundation | ✅ | Canonical spend truth |
| 2 | Credit Card Catalog | ✅ | Card metadata truth |
| 3 | Reward Rules DSL | ✅ | Declarative reward rules |
| 4 | Deterministic Rewards Engine | ✅ | Correct reward computation |
| 5 | Spend Optimization | ✅ | Best card + missed reward |
| 6 | Card Recommendation | ✅ | Cards that beat baseline |
| 7 | Backend APIs | ✅ | Stable contract for clients |

### Resulting backend capabilities

You now have:

```
PDF statements
  → canonical transactions
    → deterministic rewards
      → optimization (best / missed)
        → recommendations (beat baseline)
```

All finance-safe, explainable, test-covered. **There is nothing structurally missing in backend logic.**

---

## 3. What’s missing (product gap)

The only real gap is **experience**, not logic:

| Area | Status | Why it matters |
|------|--------|----------------|
| Mobile UI | ❌ | Users cannot see or act on insights |
| AI assistant | ❌ | Users can’t ask “why” naturally |
| Trust UX | ❌ | Explanations aren’t surfaced visually yet |

➡️ **Therefore, the next milestones are purely consumption layers.**

---

## 4. Next milestones (locked order)

### Milestone 8 — Mobile MVP (NEXT)

**Purpose:** Expose existing APIs so users can see their data and insights.

**Key constraint:** Mobile is a **read-only consumer** of backend truth. No calculations.

**Mobile MVP — Feature set (final)**

| Feature | Backed by | Status |
|---------|-----------|--------|
| View transactions | canonical-transactions API | ⏳ |
| View rewards per card | GET /api/rewards | ⏳ |
| Optimization insights | POST /api/optimize/rewards | ⏳ |
| Card recommendations | POST /api/recommend/cards | ⏳ |
| Explanations (“why”) | Engine output fields | ⏳ |

**Screens vs APIs (alignment)**

| Screen | Question it answers | API |
|--------|---------------------|-----|
| Home / Overview | “How am I doing?” | /api/rewards, /api/optimize/rewards |
| Transactions | “Where did my money go?” | /api/canonical-transactions |
| Rewards per Card | “What did each card give me?” | /api/rewards |
| Optimization Insights | “What did I miss?” | /api/optimize/rewards |
| Recommendations | “What should I consider next?” | /api/recommend/cards |

**Explicit exclusions (important):**

- ❌ No new reward logic  
- ❌ No eligibility guessing  
- ❌ No AA / SMS ingestion  
- ❌ No predictions or projections  
- ❌ No AI in MVP  
- ❌ No onboarding automation beyond manual upload  

**Outcome of Milestone 8 (“done means”):**

A user can **trust** FinMatter and understand their credit-card decisions. Not polish, not growth — **trust**.

---

### Milestone 9 — AI Assistant (AFTER MVP)

**Purpose:** Natural-language access to **existing facts**, not new intelligence.

**AI role:** **Interpreter + explainer + navigator** (query planner + explainer).

**AI is NOT:**

- A rewards calculator  
- A recommender engine  
- A finance decision maker  

**AI Assistant — Capabilities (final)**

| User asks | AI does |
|-----------|---------|
| “Why is card X better?” | Calls optimize/recommend → explains |
| “How did I earn rewards?” | Calls rewards → summarizes |
| “Where did I miss rewards?” | Calls optimize → explains deltas |
| “What should I use?” | Rephrases recommendation output |

**Tooling (already aligned):**

- getTransactions  
- getRewards  
- optimizeRewards  
- recommendCards  
- (catalog/canonical as needed)  

Phase 5 is **not** a data problem or a math problem; it is a **routing + explanation** problem.

**Hard guardrails:**

- Tool calls only  
- If data missing → say so  
- No invented benefits or numbers  
- AI must NOT: compute rewards, invent benefits, override engine outputs, recommend cards without rule sets  

---

## 5. End-state vision (what FinMatter becomes)

When Milestones 8 & 9 are done, FinMatter is:

**For users:**

- A **credit-card decision cockpit**  
- Clear, explainable, trustworthy  
- No dark patterns, no hype math  

**For builders:**

- A **composable finance engine**  
- New features = new consumers, not new math  
- Easy to extend without breaking trust  

---

## 6. Post-MVP backlog (intentionally deferred)

These are explicitly **not** part of current goals:

| Feature | Why deferred |
|---------|----------------|
| My Cards persistence | UX improvement, not core logic |
| Eligibility engine | Needs reliable external sources |
| Billing cycles / due dates | Product polish, not MVP |
| Predictive milestones | Requires projections & assumptions |
| SMS / Account Aggregator | Ops + compliance heavy |

**Phase 6 — Pro / Power features (correctly deferred):**

- Per-transaction best card  
- Projections  
- Eligibility  
- Alerts  
- Corrections loop  

All of them **reuse** canonical transactions, rewards engine, and optimization layer. Future-proofed without committing early.

---

## 7. Practical implications

You have three layers of clarity:

| Layer | Meaning |
|-------|--------|
| **Strategic clarity** | What FinMatter is and is not |
| **Backend completeness** | Core intelligence is done |
| **Execution clarity** | Exact screens and APIs for 8 & 9 |

So:

- You can **start Mobile MVP** with no backend scope creep.  
- No one can add “just one more rule” without breaking the contract.  
- AI **can’t become dangerous** later — it’s defined as consumer only.  
- Scope creep is **easy to reject** with this document as receipt.  

---

## 8. Finance verification (authoritative)

**Validator:** Finance agent (reward logic strict; no guess, no hallucination).

### Validation findings

| Check | Status | Comment |
|-------|--------|--------|
| No new reward logic in plan | ✅ | Mobile and AI only consume APIs; all math in engine. |
| Optimization and recommendation unchanged | ✅ | No new comparison rules, eligibility, or scoring. |
| Explainability preserved | ✅ | “Why” from API/engine output only; no invented copy. |
| Single source of truth | ✅ | Engine → APIs → UI/AI; one-way. |
| AI does not decide money | ✅ | Assistant explains via tools; never overrides or invents. |
| Eligibility / benefits | ✅ | No new eligibility or benefit invention; recommendation v1 as built. |
| Screens vs APIs | ✅ | 1:1 mapping; no data mismatch, no new backend logic. |
| Explicit non-goals | ✅ | No AI in MVP, no projections, no eligibility guessing — preserves trust and velocity. |
| “Done means” | ✅ | Trust is the bar; correct. |
| Phase 6 deferred | ✅ | Per-tx best, projections, eligibility, alerts, corrections — all reuse existing engine/APIs when added. |

### Inconsistencies

**None.** The cumulative plan does not introduce any new financial or reward logic. Milestones 8 and 9 are consumption layers only.

### Required clarifications (Finance)

**None** for sign-off, provided in implementation:

- Mobile and AI **only** call existing APIs; no client-side reward/optimization/recommendation logic.  
- Any future “My Cards” or eligibility feature passes structured inputs to existing APIs and does **not** guess missing data.  
- AI tools and prompts are designed so the model **cannot** invent benefits, rates, or caps; every “why” traceable to API/engine output.  

### Finance verdict

**Approved.** This cumulative plan is **authoritative**. Backend is complete; next work is Mobile MVP (Milestone 8) then AI Assistant (Milestone 9) as read-only consumers. No new reward logic, no invented benefits, no override of calculations. Proceed with Milestone 8 scope freeze and implementation; then Milestone 9 under the same constraints.
