/**
 * Period context for reward computation.
 * Calendar-based in v1; no statement-boundary.
 */

import type { Period } from "@finmatter/domain";

export type PeriodContext = {
  type: Period;
  start: string;
  end: string;
};

/**
 * Derive a period key from a transaction date for the given period type.
 * Used for cap and milestone aggregation.
 * - monthly: "2025-01"
 * - quarterly: "2025-Q1"
 * - yearly: "2025"
 */
export function getPeriodKey(dateIso: string, periodType: Period): string {
  const d = new Date(dateIso);
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  if (periodType === "monthly") return `${y}-${String(m).padStart(2, "0")}`;
  if (periodType === "quarterly") {
    const q = Math.ceil(m / 3);
    return `${y}-Q${q}`;
  }
  return String(y);
}
