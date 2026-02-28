/**
 * Persist period summary to reward_period_summaries (optional; table must exist).
 * Best-effort: on failure we log and do not throw, so the API still returns computed result.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { PeriodContext } from "@finmatter/rewards-engine";
import type { PeriodRewardSummary } from "@finmatter/rewards-engine";

export type PersistParams = {
  userId: string;
  cardId: string;
  period: PeriodContext;
  periodSummary: PeriodRewardSummary;
};

/**
 * Upsert one row into reward_period_summaries. No-op if table missing or upsert fails (log only).
 */
export async function upsertRewardPeriodSummary(
  supabase: SupabaseClient,
  params: PersistParams
): Promise<void> {
  const row = {
    user_id: params.userId,
    card_id: params.cardId,
    period_type: params.period.type,
    period_start: params.period.start,
    period_end: params.period.end,
    total_reward: params.periodSummary.totalReward,
    by_category: params.periodSummary.byCategory ?? {},
    caps_hit: params.periodSummary.capsHit ?? [],
    milestones_triggered: params.periodSummary.milestonesTriggered ?? [],
    computed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("reward_period_summaries")
    .upsert(row, {
      onConflict: "user_id,card_id,period_type,period_start,period_end",
      ignoreDuplicates: false,
    });

  if (error) {
    console.warn("[rewards] persist period summary failed:", error.message);
  }
}
