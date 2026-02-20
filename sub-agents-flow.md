# How to Use Sub-Agents Correctly (This Is the Key)

You do **not** ask Cursor to design. You do this instead:

---

## Step 1 — You Write a Design Brief (1–2 pages)

Example (for any system):

**We are designing the Credit Card Rewards Engine.**

### Goals

- Deterministic reward calculation
- Versioned reward rules
- Ability to recompute historical rewards
- Explainability per transaction

### Non-goals

- No AI deciding rewards
- No probabilistic logic

### Constraints

- Must support Indian credit cards
- Monthly and annual caps
- Category-based acceleration

### High-level flow

```
Transaction → Category → Card Rules → Reward Points → INR Value
```

### Open questions

- How to model caps cleanly?

This is **system design**. This is **human work**.

---

## Step 2 — Ask the Product Owner Agent to Refine It

**Prompt:**

> You are a fintech product owner.
>
> Review the following system design brief. Identify:
>
> - Missing requirements
> - Ambiguities
> - Scope creep risks
> - Edge cases from a user perspective

This improves clarity, not architecture.

---

## Step 3 — Ask the Developer Agent for Technical Structure

**Prompt:**

> You are a senior backend engineer.
>
> Given the following design brief:
>
> - Propose data models
> - Propose API boundaries
> - Suggest module structure
>
> Do NOT change business logic. Do NOT invent rules.

Now AI helps with implementation shape, not decisions.

---

## Step 4 — Ask the Tester Agent to Break It

**Prompt:**

> You are a QA engineer.
>
> Given this system design:
>
> - Identify edge cases
> - Failure modes
> - Incorrect assumptions
> - Test scenarios
>
> Focus on fintech risks.

This is where AI shines.

---

## Step 5 — Ask the Finance / Rewards Agent to Validate Logic

**Prompt:**

> You are validating financial correctness.
>
> Given the reward flow:
>
> - Identify logical gaps
> - Missing constraints
> - Mathematical inconsistencies
>
> Do not guess missing values.
