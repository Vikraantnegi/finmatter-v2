# Product-level Planning (Backend vs Frontend)

We define products / modules, and for each:

- **What Backend must do**
- **What Frontend must do**

We are **backend-first** in thinking.

---

## Product 1: User Onboarding & Data Ingestion

### Backend

- User auth (email / phone initially)
- Secure consent flow
- Email statement ingestion (Gmail parsing later, file upload first)
- SMS ingestion (Android permissions later)
- Raw transaction normalization
- Deduplication & idempotency
- Background ingestion jobs
- Data encryption at rest

### Frontend

- Sign up / login
- Permissions + consent screens
- Upload statement flow
- Ingestion status & progress
- Error states (failed parsing, unsupported banks)

---

## Product 2: Transaction Categorization Engine

### Backend

- Transaction schema (raw → normalized → categorized)
- Category taxonomy (food, fuel, travel, etc.)
- Rule-based categorization (MCC, merchant name)
- AI-assisted categorization (fallback)
- Re-training / feedback loop
- Versioned categorization logic

### Frontend

- Transaction list
- Category labels + icons
- Manual category correction
- Feedback capture (“this is wrong”)

---

## Product 3: Credit Card Stack Management

### Backend

- User’s current cards (issuer, variant, limits)
- Card metadata database
- Milestones & reward rules per card
- Statement cycle & due date tracking
- Eligibility & upgrade logic

### Frontend

- Card wallet UI
- Add / edit cards
- View benefits & milestones
- Alerts (milestone close, suboptimal spend)

---

## Product 4: Rewards Calculation Engine (Core IP)

### Backend

- Deterministic reward engine
- Category → reward mapping per card
- Cap tracking (monthly / quarterly / yearly)
- Milestone progress tracking
- Reward valuation (₹ equivalent)
- Historical reward recomputation
- What-if simulation (“if spent on X card”)

### Frontend

- Rewards dashboard
- Card-wise reward breakdown
- Missed rewards insights
- What-if comparison UI

---

## Product 5: Spend Optimization Engine

### Backend

- User spend pattern extraction
- Optimal card recommendation per category
- Dynamic routing rules (“use Card A for fuel”)
- Suboptimal spend detection
- Predictive milestone reach

### Frontend

- “Which card should I use?” UI
- Spend optimization tips
- Alerts & nudges
- Weekly / monthly insights

---

## Product 6: Credit Card Recommendation System

### Backend

- User persona generation (spender type)
- Card eligibility scoring
- Upgrade vs new card logic
- ROI-based recommendation
- Explainability layer (“why this card”)

### Frontend

- Card recommendations feed
- Comparison views
- Upgrade prompts
- Apply / save for later CTA

---

## Product 7: Personal Financial AI Assistant

### Backend

- Conversational memory (financial context)
- Tool calling (transactions, rewards, cards)
- Guardrails (no hallucinated finance)
- Explainability responses
- Multi-agent routing (planner vs explainer)

### Frontend

- Chat UI
- Suggested prompts
- Insight cards inside chat
- Follow-up actions

---

## Product 8: Notifications & Reminders

### Backend

- Due date scheduler
- Milestone alerts
- Spend anomaly detection
- Notification preferences
- Email / push abstraction

### Frontend

- Notification settings
- Reminder previews
- Alert history
