# Credit Card Catalog — Content and Data Model

**Canonical spec** for what the catalog contains (facts only), design principles, core data model, and v1 target. Use this for schema design and implementation.

**Data sources and phases:** [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md) — Phase 1 (manual + verifiable), Phase 2 (AI-assisted draft), Phase 3 (scraping advisory); source-aware fields; what not to over-engineer.

---

## What the Catalog contains (facts only)

Each **Card Variant** captures:

### 1. Identity & metadata

- Bank (HDFC, ICICI, Amex, HSBC, etc.)
- Card family (Regalia, Diners Black, Platinum Travel, etc.)
- Variant name
- Network (Visa / Mastercard / Amex / RuPay)
- Reward currency (Reward Points, NeuCoins, Cashback, Miles)
- Card type (credit / charge)

### 2. Fees

- Joining fee (amount + currency)
- Annual fee
- Fee waiver condition (textual, not executable)
- GST applicability (display only)
- **Source-aware:** each fee (or fee block) can carry `source` (e.g. MITC, bank_site) and `sourceRef` (e.g. PDF path or URL) for audit. See [catalog-data-sources-and-phases.md](catalog-data-sources-and-phases.md).

### 3. Milestones (declarative)

- Spend threshold (e.g. ₹1,50,000)
- Period (monthly / quarterly / yearly)
- Declared reward/benefit (text or structured tag)
- No computation. No enforcement.

### 4. Benefits (descriptive)

- Lounge access (count, domestic/international, network-bound)
- Insurance / protection benefits
- Partner programs (Swiggy, Tata Neu, etc.)
- Cashback programs (declared, not inferred)

### 5. Declared caps (when card states them)

- Cap value and period (monthly / quarterly / yearly) as **declaration only**—no application or computation. Application belongs to Reward Rules DSL / engines.

### 6. Validity & versioning

- `effectiveFrom`
- `effectiveTo` (nullable)
- `source` (bank site, MITC, statement)
- `verifiedAt`

---

## Explicit non-goals (v1)

The catalog does **not**:

- Calculate rewards
- Encode category accelerations
- Apply caps
- Infer benefits from statements
- Guess missing rules
- Replace MITC documents

Those belong to Reward Rules DSL and Engines, not here.

---

## Design principles

1. **Facts over inference** — If it’s not explicitly declared by the issuer, it doesn’t go in the catalog.
2. **Versioned truth** — Cards change. Old rules don’t disappear — they expire.
3. **Human-verifiable** — Every field must be traceable to a source a human can verify.
4. **Engine-agnostic** — Catalog is passive data. Engines interpret it later.

---

## Core data model

```
CardVariant {
  id
  bank
  family
  variantName
  network
  rewardCurrency
  cardType?           // credit | charge
  fees {
    joining { amount, currency, source?, sourceRef? }
    annual { amount, currency, source?, sourceRef? }
    waiverText?
    gstDisplay?
  }
  // Record-level: source, verifiedAt (see Validity & versioning)
  milestones?: Milestone[]   // { threshold, period, declaredReward }
  benefits?: Benefit[]       // lounge, insurance, partners, cashback (declared)
  caps?: CapDeclaration[]   // { value, period } — declaration only
  effectiveFrom
  effectiveTo?
  source
  verifiedAt
}
```

---

## Who consumes this

- **Reward Rules DSL** → references cards by ID
- **Rewards Engine** → validates outcomes vs statements
- **Optimization Engine** → compares benefits across cards
- **Recommendation Engine** → explains “why this card”
- **UI** → displays card details transparently

---

## Initial v1 target

Start with your own cards only:

- HDFC (1–2 variants)
- ICICI (1)
- Amex (1)
- HSBC (1)

Total: ~5 cards, fully verified. **Depth > breadth.**

---

## Success criteria (v1)

- A card’s fees, milestones, and benefits can be shown without ambiguity.
- A reward engine can reference the catalog without guessing.
- A statement reward line can be validated against declared benefits.
- Card data changes can be versioned without breaking history.

---

## References

- **PRD:** [milestone-2-catalog-prd.md](milestone-2-catalog-prd.md)
- **Finance verification:** [milestone-2-catalog-finance-verification.md](milestone-2-catalog-finance-verification.md)
