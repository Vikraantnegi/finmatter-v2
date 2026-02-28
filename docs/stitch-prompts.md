# Stitch MCP — Prompts & design system

Use this doc when generating designs with Stitch MCP. **Paste the Global Design System Preamble at the top of every Stitch batch.**

**Screen list (what to design):** [mobile-mvp-screens.md](mobile-mvp-screens.md)  
**Canonical order (Stitch & implementation):** [screens-order.md](screens-order.md)

---

## Global Design System Preamble (use on every prompt)

**Copy everything below this line and paste once at the top of every Stitch batch.**

---

**Design System: FinMatter Light UI**

- **Backgrounds:** Clean White `#FFFFFF`, Light Gray `#F8F9FA`
- **Primary Brand Color:** Money Green (used sparingly for actions & positive outcomes)
- **Typography:** Dark Charcoal for all primary text (high contrast, finance-grade readability)
- **Cards:** White surfaces with soft drop shadows (no dark cards)
- **Buttons:**
  - Primary: Money Green
  - Secondary: Neutral outline
  - Ghost: Minimal, no emphasis
- **Inputs:** White background, subtle modern borders, clear focus state
- **Tone:** Calm, deterministic, explainable, non-gamified

**Constraints:**

- No celebratory visuals
- No projections
- No invented insights
- Every number must feel traceable

---

## How to use

1. **Start each Stitch batch** with the Global Design System Preamble (block above).
2. **Then** paste one of the screen prompts below (or combine related screens in one batch).
3. **Reference:** [mobile-mvp-screens.md](mobile-mvp-screens.md) for full screen list and API mapping.

---

## Screen prompts (copy-paste after preamble)

Each prompt is ready to use. Paste the **Global Design System Preamble** first, then the prompt.

---

### 1. Splash screen

Design a minimal mobile splash screen for a finance app called FinMatter.
Use a clean light background with a subtle Money Green accent.
Center the FinMatter logo mark.
Below it, a short tagline: “Know which card to use. Always.”
No animations implied. Premium, calm, confident.
This is a trust-first financial product, not a trading app.

---

### 2. Auth — Login

Design a login screen for FinMatter.
Simple email + OTP flow (no passwords).
Minimal form: email input, primary action button “Continue”.
Secondary text: “We never read your statements manually.”
Emphasize privacy and trust.
No social login. No clutter.

---

### 3. Auth — OTP verification

Design an OTP verification screen.
6-digit OTP input with clear focus state.
Helper text showing the masked email.
Primary CTA: “Verify”.
Subtle resend option with cooldown indicator.

---

### 4. Onboarding 1 — Value

Design an onboarding screen explaining FinMatter’s core value.
Headline: “Stop guessing which card to use.”
Subtext: “FinMatter shows you exactly which card gives you the most rewards — and why.”
Use a simple illustration or abstract card icons.
Calm, explanatory tone.

---

### 5. Onboarding 2 — How it works

Design an onboarding screen explaining how FinMatter works.
Steps visualized:

1. Upload card statements  
2. We calculate rewards correctly  
3. You see insights & recommendations  

No AI claims, no predictions.
Deterministic and transparent.

---

### 6. Onboarding 3 — Trust

Design an onboarding screen focused on trust.
Headline: “No guesses. No invented rewards.”
Bullet points:

- Calculations are rule-based  
- Numbers are verifiable  
- You stay in control  

Use neutral visuals, not marketing hype.

---

### 7. Home / Overview

Design the FinMatter home dashboard screen.
Answer: “How am I doing this period?”

Sections (top to bottom):

- Period selector (This month / Last month)  
- Total spend  
- Total rewards earned  
- Best card this period  
- Missed reward (if any, neutral tone)  

Use cards with soft elevation.
Green highlights only for positive outcomes.
No charts unless essential.

---

### 8. Navigation & global layout

Design a bottom navigation for FinMatter.
Tabs: **Home** | **Transactions** | **Insights** | **Cards** | **Profile**
Icons should be simple and neutral.
Active state uses Money Green.
No floating buttons.

---

### 9. Transactions list

Design a transactions list screen.
Show canonical transactions with:

- Merchant name  
- Amount  
- Card used  
- Spend category  

Filters: Period, Category, Card.
Each transaction row has a confidence indicator (parsed vs inferred).
Tapping opens a detail view.
No editing in MVP.

---

### 10. Transaction detail

Design a transaction detail screen.
Show: Merchant, Date, Amount, Card used, Category, Reward earned (if applicable).
If reward is zero, explain why (e.g. excluded category).
Explanations must feel factual, not apologetic.

---

### 11. Cards screen (My cards)

Design a cards screen showing the user’s selected cards.
Each card tile shows: Card name, Network/bank, Reward currency.
CTA: “Add card” (manual selection, not linking).
This screen is informational, not a wallet.

---

### 12. Add card

Design an “Add Card” screen.
Searchable list of supported cards from the catalog.
Each item shows: Card name, Bank, Key reward type (points/cashback).
No eligibility checks.
Selection simply adds card to baseline list.

---

### 13. Rewards (per card)

Design a rewards screen for a selected card and period.
Show:

- Total rewards earned  
- Category-wise breakdown  
- Caps hit (if any)  
- Milestones progress (if applicable)  

Everything must look traceable and deterministic.
Avoid celebratory visuals.

---

### 14. Insights / Optimization

Design an optimization insights screen.
Headline: “You could have earned more.”
Show: Best card for the period, Missed reward amount, Optional: best card by category.
Missed reward should be neutral, not alarming.
Explain “why” in one short line per insight.

---

### 15. Recommendations

Design a card recommendations screen.
Show cards that beat the user’s baseline.
Each recommendation includes: Card name, Incremental reward, Categories where it helps, Plain explanation (“Higher rewards on dining & shopping”).
Excluded cards (no rule set) should be optionally visible in a muted section.

---

### 16. Card comparison

Design a card comparison screen.
Compare two or more cards for the same period.
Show: Total rewards, Category-wise comparison, Winner highlight.
No charts if tables suffice.
Focus on clarity over density.

---

### 17. Upload statement

Design a statement upload screen.
Clear CTA: “Upload credit card statement (PDF)”.
Show supported banks list (if available).
Explain briefly what happens after upload.
Show processing status clearly.

---

### 18. Loaders & skeletons

Design skeleton loaders for FinMatter screens.
Use neutral gray placeholders.
Avoid spinners where skeletons make sense.
Loading should feel calm, not urgent.

---

### 19. Empty states

Design empty states for: No transactions, No cards added, No recommendations.
Each empty state should: Explain what’s missing, Suggest the next action.
Avoid guilt or pressure.

---

### 20. Error & success states

Design error and success states.
Errors should be factual and calm.
Success states should be subtle confirmations, not celebrations.
Use green sparingly for success.

---

### 21. Profile / Settings

Design a profile/settings screen.
Sections: Account info, Selected cards, Data & privacy, About FinMatter.
No gamification, no streaks, no badges.

---

### 22. AI Assistant (Phase 5 — future)

Design an AI assistant chat interface for FinMatter.
Assistant is an explainer, not an advisor.
Messages reference real numbers and cards.
No emojis. No hype.
Show source references subtly (e.g. “Based on this month’s rewards”).

---

*Keep this doc next to [mobile-mvp-screens.md](mobile-mvp-screens.md) and [cumulative-product-milestone-plan.md](cumulative-product-milestone-plan.md) for consistent Stitch output.*
