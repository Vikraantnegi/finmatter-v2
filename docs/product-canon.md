# FinMatter — Product Canon

## Product Vision

FinMatter is a credit-card–first personal finance platform for India. Its primary goal is to help users maximize rewards, optimize card usage, and build the right credit card stack using their real spending data.

FinMatter does not aim to be a generic finance app. It is opinionated, focused, and correctness-driven.

## Core Focus (Non-Negotiable)

- Credit cards only (India)
- Rewards, milestones, and benefits optimization
- Spend-based recommendations
- Explainability and trust

## What FinMatter Does

### Transaction Ingestion

- Ingests user transactions via:
  - Email statements
  - SMS parsing
  - (Later) Account Aggregator
- Normalizes, deduplicates, and categorizes transactions

### Credit Card Stack Management

- Tracks all cards a user owns
- Maintains card metadata:
  - Bank, variant, network
  - Fees, milestones, rewards
- Tracks billing cycles, due dates, and caps

### Rewards Calculation Engine (Core IP)

- Deterministic reward computation
- Category-based acceleration
- Monthly / annual caps
- Milestone tracking
- Recomputable history
- Explainable per-transaction rewards

### Spend Optimization

- Identifies suboptimal spends
- Recommends which card to use per category
- Predicts milestone completion
- Highlights missed rewards

### Credit Card Recommendations

- Based on real spend patterns
- Upgrade vs new card analysis
- ROI-based recommendations
- Clear “why this card” explanations

### Personal Financial AI Assistant

- Answers questions using user’s real data
- Explains rewards, spends, and optimizations
- Never invents financial facts
- Never overrides deterministic logic

## What FinMatter Does NOT Do (Explicit Non-Goals)

- Investments (stocks, MF, crypto)
- Loans or BNPL
- Credit score coaching (initially)
- Generic budgeting for non-card spends
- Financial advice beyond credit cards

## AI Philosophy (Critical)

- AI assists, never decides money
- All reward math is deterministic

**AI may:**

- Explain
- Categorize (with fallback)
- Summarize
- Validate

**AI must never:**

- Invent card benefits
- Guess reward rules
- Override calculations

## Trust & Correctness

- Accuracy > convenience
- Explainability > cleverness
- Versioned rules & schemas
- Historical recomputation supported
- Every recommendation must be explainable

## Target User

- Urban Indian credit card user
- Owns 2–6 cards
- Optimizes rewards consciously
- Wants clarity, not gamification noise

## Success Metric

> “I know which card to use, why, and what I gained.”
