# FinMatter — Screens order (canonical)

**Use this order for Stitch MCP and implementation.** Based on real user behavior: first-time → core loop → rewards → optimization → recommendations → cards & setup → statements → insights → profile → AI → system states.

**Design system:** Paste the [Stitch global design system preamble](stitch-prompts.md#global-design-system-preamble-use-on-every-prompt) at the top of every Stitch batch, then use the prompts below.

**Full screen list & APIs:** [mobile-mvp-screens.md](mobile-mvp-screens.md)

---

## PHASE A — First-time user

### 1. Splash / Welcome screen

**Prompt:** Design a mobile splash screen for FinMatter.

**Purpose:** First impression and trust.

**Layout:**
- Centered FinMatter logo
- Short value proposition: “Know which card to use. Know why.”
- Primary CTA: “Upload your first statement”
- Secondary link: “Learn how it works”

**Visual style:** Clean white background. Money Green used only for CTA. No charts, no numbers yet.  
**Tone:** Calm, confident, premium Indian fintech.

---

### 2. Upload first statement

**Prompt:** Design a screen that prompts the user to upload their first credit card statement (PDF).

**Layout:**
- Header: “Upload your statement”
- Instruction text explaining supported formats
- Large upload dropzone / button
- Supported banks note (small text)

**UX:** Single primary action. Reassuring copy: “Your data stays private”. No distractions, no secondary flows.

---

### 3. Upload processing / success

**Prompt:** Design a processing/success screen after a statement upload.

**States:**
- Processing: loader + “We’re extracting your transactions”
- Success: confirmation message + next CTA

**Layout:** Minimal illustration or icon. Text explaining what’s happening. CTA: “Go to dashboard”.  
**Tone:** Informative, not celebratory.

---

## PHASE B — Core daily loop

### 4. Home / Dashboard

**Prompt:** Design the FinMatter home dashboard.

**Purpose:** “How am I doing?”

**Layout:**
- Period selector (This month / Last month)
- Summary card: Total spend, Total rewards earned
- Insight card: Best card this period, Missed reward
- Navigation: Bottom tab bar (Home, Transactions, Cards, Insights, Profile)

**Visuals:** Numbers in focus. Money Green only for positive values. Neutral tone, no hype.

---

### 5. Transactions list

**Prompt:** Design a transactions list screen.

**Purpose:** “Where did my money go?”

**Layout:**
- Header with period filter
- List of transactions: Merchant, Amount, Category, Card used, Confidence indicator (parsed vs inferred)

**UX:** Scrollable list. Filter icon opens bottom sheet.

---

### 6. Transaction detail

**Prompt:** Design a transaction detail screen.

**Layout:** Amount (prominent), Merchant name, Date, Card used, Category (editable), Reward earned on this transaction (if any).

**Tone:** Factual, transparent.  
**CTA:** “Edit category” (secondary).

---

### 7. Edit transaction category

**Prompt:** Design a bottom sheet or modal to edit transaction category.

**Layout:** List of spend categories. Current selection highlighted. Save button.  
**UX:** Simple, fast. No side effects shown here.

---

## PHASE C — Rewards understanding

### 8. Rewards overview (per card)

**Prompt:** Design a rewards overview screen for a selected card and period.

**Layout:** Card selector. Total rewards earned. By-category breakdown (list or bar).  
**Visuals:** No charts that imply prediction. Clear numeric labels.

---

### 9. Rewards by category

**Prompt:** Design a rewards-by-category breakdown screen.

**Layout:** Category list. Reward earned per category.  
**Emphasis:** Comparability. Clarity over visuals.

---

### 10. Milestones

**Prompt:** Design a milestones screen for a credit card.

**Layout:** List of milestones. Status: triggered / not triggered. Plain explanation of each milestone.  
**Tone:** Informational. No progress bars implying prediction.

---

## PHASE D — Optimization & comparison

### 11. Optimization insights

**Prompt:** Design an optimization insights screen.

**Purpose:** “What did I miss?”

**Layout:** Best card this period. Missed reward amount. Short explanation.  
**Visuals:** One clear insight. No clutter.

---

### 12. Optimization by category

**Prompt:** Design a screen showing best card per category.

**Layout:** Category list. Best card for each. Short explanation (“Higher rewards on dining”).  
**UX:** Read-only insights.

---

### 13. Card comparison

**Prompt:** Design a card comparison screen.

**Layout:** Selected cards side by side. Total reward. Category highlights.  
**Tone:** Analytical. Neutral, no “winner” badges.

---

## PHASE E — Recommendations

### 14. Recommendations list

**Prompt:** Design a recommendations screen.

**Purpose:** “What card should I consider?”

**Layout:** List of recommended cards. Incremental reward. Top benefiting categories.  
**Copy:** Plain, factual explanations. No urgency language.

---

### 15. Recommendation detail

**Prompt:** Design a recommendation detail screen.

**Layout:** Card name. Incremental reward vs baseline. Categories where it helps. Explanation text.  
**CTA:** “View card details” (no apply flow).

---

## PHASE F — Cards & setup

### 16. My cards

**Prompt:** Design a “My Cards” management screen.

**Layout:** Selected cards list. Toggle inclusion for optimization.  
**UX:** Simple selection state. No backend complexity shown.

---

### 17. Add card

**Prompt:** Design an add card screen.

**Layout:** Search input. Card list from catalog.  
**Action:** Tap to add to “My Cards”.

---

### 18. Card catalog

**Prompt:** Design a card catalog browsing screen.

**Layout:** List of all cards. Bank, network, basic metadata.  
No ranking, no recommendation language.

---

### 19. Card detail

**Prompt:** Design a card detail screen.

**Layout:** Card metadata. Fees. Reward currency.  
**Purpose:** Informational only.

---

## PHASE G — Statements

### 20. Upload statement

**Prompt:** Design a reusable upload statement screen.

Same as onboarding upload but accessible from profile or home.

---

## PHASE H — Insights & trends

### 21. Insights / Trends

**Prompt:** Design an insights and trends screen.

**Layout:** Spend over time. Category distribution.  
**Rules:** Historical only. No future projections.

---

## PHASE I — Profile & settings

### 22. Profile / Account

**Prompt:** Design a profile screen.

**Layout:** User identifier. App version. Links to settings and help.

---

### 23. Settings

**Prompt:** Design a settings screen.

**Layout:** Default period selection. Preferences.  
Minimal, no advanced options.

---

## PHASE J — AI Assistant (M9)

### 24. AI Assistant

**Prompt:** Design an AI assistant chat screen.

**Layout:** Chat history. Input bar. Suggested prompts.  
**Tone:** Explanatory. Calm, factual.

---

### 25. Suggested prompts

**Prompt:** Design a suggested prompts screen for the AI assistant.

**Examples:** “Why is card X better than Y?” “How did I earn rewards this month?”

---

## PHASE K — System states

### 26. Loading / Skeletons

**Prompt:** Design loading and skeleton states for lists and cards.

**Style:** Neutral gray. No animations that imply progress beyond loading.

---

### 27. Empty state

**Prompt:** Design empty states for no transactions, no rewards, no recommendations.

**Copy:** Informative. Next-step oriented.

---

### 28. Error state

**Prompt:** Design error states for API failures or network issues.

**Tone:** Calm. Clear recovery action.

---

### 29. Success state

**Prompt:** Design success states for uploads, saves, edits.

**Style:** Subtle confirmation. No celebration.

---

## Summary: canonical order (1–29)

| # | Phase | Screen |
|---|-------|--------|
| 1 | A | Splash / Welcome |
| 2 | A | Upload first statement |
| 3 | A | Upload processing / success |
| 4 | B | Home / Dashboard |
| 5 | B | Transactions list |
| 6 | B | Transaction detail |
| 7 | B | Edit transaction category |
| 8 | C | Rewards overview (per card) |
| 9 | C | Rewards by category |
| 10 | C | Milestones |
| 11 | D | Optimization insights |
| 12 | D | Optimization by category |
| 13 | D | Card comparison |
| 14 | E | Recommendations list |
| 15 | E | Recommendation detail |
| 16 | F | My cards |
| 17 | F | Add card |
| 18 | F | Card catalog |
| 19 | F | Card detail |
| 20 | G | Upload statement (reusable) |
| 21 | H | Insights / Trends |
| 22 | I | Profile / Account |
| 23 | I | Settings |
| 24 | J | AI Assistant |
| 25 | J | Suggested prompts |
| 26 | K | Loading / Skeletons |
| 27 | K | Empty state |
| 28 | K | Error state |
| 29 | K | Success state |
