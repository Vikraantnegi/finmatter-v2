# Reward Rules DSL v1 — Freeze

**This is a contract, not documentation fluff.**

- **Rule types are frozen.** `packages/domain/src/reward-rule.ts`: CategoryRateRule, CapRule, ExclusionRule, MilestoneRule, RewardRule, CardRuleSet. No change without a versioned decision.
- **Interpretation strategy is frozen.** `docs/reward-rules-dsl/interpretation-strategy.md`: catalog → rule set (milestones from catalog; rates/caps/exclusions from manual rule set); rule order; units; where rule sets live. No change without a versioned decision.
- **One reference card (HDFC Millennia) is signed off.** Rule set: `apps/backend/src/db/data/rule-sets/hdfc-millennia.json`. Example and mapping choices: `docs/reward-rules-dsl/example-hdfc-millennia.md`. Finance verification: `docs/reward-rules-dsl/example-hdfc-millennia-finance-verification.md`.
- **No AI, no inference, no auto-derivation.** New cards' rules are manual from MITC/bank_site + catalog; Finance/product sign-off. No parsing of declaredConstraints prose into rules.
- **Phase 2 engine is the next consumer.** Catalog + DSL are inputs. Engine consumes CardRuleSet + canonical transactions. We do not touch DSL or catalog during Phase 2.
- **Phase 2 may assume:** Execution order exclusions → rates → caps → milestones; once-per-period milestone semantics; deterministic execution only. This is the line in the sand.
