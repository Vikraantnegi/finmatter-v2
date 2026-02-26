# Example: HDFC Millennia rule set

One-card example for Milestone 3 (Reward Rules DSL). Proves the representation and (card, category, period) → rule is unambiguous.

**Catalog id:** `hdfc-millennia`  
**Rule set file:** `apps/backend/src/db/data/rule-sets/hdfc-millennia.json`

---

## Rule set summary

| Rule type       | Category  | Detail                          | Source (catalog)        |
|-----------------|-----------|----------------------------------|--------------------------|
| exclusion       | fuel      | No reward                        | declaredConstraints[2]  |
| exclusion       | rent      | No reward                        | declaredConstraints[2]  |
| exclusion       | wallet_load | No reward                     | declaredConstraints[2]  |
| category_rate   | shopping  | 5 per ₹100                       | declaredConstraints[0]  |
| category_rate   | other     | 1 per ₹100                       | declaredConstraints[1]  |
| cap             | shopping  | 1000 units/month                 | declaredConstraints[0]  |
| cap             | other     | 1000 units/month                 | declaredConstraints[1]  |
| milestone       | —         | ₹1,00,000/quarter → voucher/lounge | milestones[0]         |

Reward unit = **cashback** (from catalog `rewardCurrency`). Threshold in **INR**.

**Mapping choices (for Finance sign-off):**
- **Shopping** = “select online merchants” (Amazon, Flipkart, Myntra, Swiggy, etc.) for this card.
- **Cap period:** Catalog says “per statement cycle”; rule set uses **calendar month** as proxy for v1. Engine may use statement boundaries when available.
- **Government transactions:** Catalog (constraint [2]) excludes “government transactions”; SpendCategory has no government category. Excluded per MITC but not modeled in rule set; do not use OTHER as proxy.

---

## Example (card, category, period) → rule

1. **hdfc-millennia, shopping, monthly**  
   Rate 5 cashback per ₹100 on shopping; cap 1000 cashback per month.  
   (Exclusions do not apply; category_rate + cap apply.)

2. **hdfc-millennia, fuel, monthly**  
   Exclusion: no reward for fuel. No rate, no cap for this category.

3. **hdfc-millennia, (any), quarterly**  
   Milestone: if total spend in quarter ≥ ₹1,00,000 → one-time reward (voucher or lounge per declaredReward).

---

## Sign-off

Before DSL v1 freeze: Finance (or designated validator) signs off that this rule set matches the catalog and MITC for HDFC Millennia and that the examples above are correct.
