/**
 * Unit tests for card recommendation: same tx set, baseline = max(user's cards),
 * recommend only cards that beat baseline. Mocks catalog fetch, tx fetch, rule-set loader, engine.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PeriodRewardSummary } from "@finmatter/rewards-engine";
import { loadRuleSet } from "../rewards/rule-set-loader";
import { fetchAllUserTransactionsInPeriod } from "../rewards/fetch-transactions";
import { fetchCatalogVariantIds } from "./fetch-catalog-ids";
import { computeRewardsCore } from "@finmatter/rewards-engine";
import { computeRecommendations } from "./compute-recommendations";

const mockPeriod = {
  type: "monthly" as const,
  start: "2025-01-01",
  end: "2025-01-31",
};

vi.mock("../rewards/rule-set-loader", () => ({ loadRuleSet: vi.fn() }));
vi.mock("../rewards/fetch-transactions", () => ({ fetchAllUserTransactionsInPeriod: vi.fn() }));
vi.mock("./fetch-catalog-ids", () => ({ fetchCatalogVariantIds: vi.fn() }));
vi.mock("@finmatter/rewards-engine", () => ({ computeRewardsCore: vi.fn() }));

const mockSupabase = {} as unknown as Parameters<typeof computeRecommendations>[0];

function mockPeriodSummary(totalReward: number, byCategory?: Record<string, number>): PeriodRewardSummary {
  return {
    period: mockPeriod,
    totalReward,
    byCategory: byCategory ?? {},
    capsHit: [],
    milestonesTriggered: [],
  } as PeriodRewardSummary;
}

beforeEach(() => {
  vi.mocked(fetchAllUserTransactionsInPeriod).mockResolvedValue([]);
  vi.mocked(fetchCatalogVariantIds).mockResolvedValue(["base", "cand-a", "cand-b", "no-rule"]);
  vi.mocked(loadRuleSet).mockReturnValue(null);
  vi.mocked(computeRewardsCore).mockReturnValue({
    perTransactionRewards: [],
    periodSummary: mockPeriodSummary(0),
  });
});

describe("computeRecommendations", () => {
  it("uses catalog minus baseline when candidateCardIds omitted", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => (id !== "no-rule" ? { cardId: id, rules: [] } : null));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => ({
      perTransactionRewards: [],
      periodSummary: mockPeriodSummary(ruleSet.cardId === "base" ? 100 : ruleSet.cardId === "cand-a" ? 150 : 80),
    }));

    const result = await computeRecommendations(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      baselineCardIds: ["base"],
      // no candidateCardIds -> should call fetchCatalogVariantIds
    });

    expect(fetchCatalogVariantIds).toHaveBeenCalledWith(mockSupabase);
    expect(result.baselineReward).toBe(100);
    expect(result.baselineCardId).toBe("base");
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].cardId).toBe("cand-a");
    expect(result.recommendations[0].incrementalReward).toBe(50);
    expect(result.excluded.noRuleSet).toContain("no-rule");
  });

  it("baseline 0 when no baseline cards; only positive incremental recommended", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => ({ cardId: id, rules: [] }));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => ({
      perTransactionRewards: [],
      periodSummary: mockPeriodSummary(ruleSet.cardId === "cand-a" ? 120 : 0),
    }));

    const result = await computeRecommendations(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      baselineCardIds: [],
      candidateCardIds: ["cand-a", "cand-b"],
    });

    expect(result.baselineReward).toBe(0);
    expect(result.baselineCardId).toBeNull();
    expect(result.recommendations).toHaveLength(1);
    expect(result.recommendations[0].cardId).toBe("cand-a");
    expect(result.recommendations[0].incrementalReward).toBe(120);
  });

  it("excludes candidates without rule set into excluded.noRuleSet", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => (id === "cand-a" ? { cardId: id, rules: [] } : null));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => ({
      perTransactionRewards: [],
      periodSummary: mockPeriodSummary(200),
    }));

    const result = await computeRecommendations(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      baselineCardIds: ["base"],
      candidateCardIds: ["cand-a", "no-rule-card"],
    });

    expect(result.excluded.noRuleSet).toContain("no-rule-card");
    expect(result.recommendations.map((r) => r.cardId)).toEqual(["cand-a"]);
  });

  it("orders recommendations by incrementalReward descending", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => ({ cardId: id, rules: [] }));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => ({
      perTransactionRewards: [],
      periodSummary: mockPeriodSummary(
        ruleSet.cardId === "base" ? 100 : ruleSet.cardId === "low" ? 130 : ruleSet.cardId === "high" ? 200 : 150
      ),
    }));

    const result = await computeRecommendations(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      baselineCardIds: ["base"],
      candidateCardIds: ["low", "mid", "high"],
    });

    expect(result.recommendations.map((r) => r.cardId)).toEqual(["high", "mid", "low"]);
    expect(result.recommendations[0].incrementalReward).toBe(100);
    expect(result.recommendations[1].incrementalReward).toBe(50);
    expect(result.recommendations[2].incrementalReward).toBe(30);
  });

  it("builds bestCategories and explanation from byCategory vs baseline", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => ({ cardId: id, rules: [] }));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => {
      const byCategory =
        ruleSet.cardId === "base"
          ? { shopping: 50, dining: 30 }
          : { shopping: 80, dining: 20, fuel: 10 };
      const total = ruleSet.cardId === "base" ? 80 : 110;
      return {
        perTransactionRewards: [],
        periodSummary: mockPeriodSummary(total, byCategory),
      };
    });

    const result = await computeRecommendations(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      baselineCardIds: ["base"],
      candidateCardIds: ["cand-a"],
    });

    expect(result.recommendations[0].bestCategories).toContain("shopping");
    expect(result.recommendations[0].bestCategories).toContain("fuel");
    expect(result.recommendations[0].explanation.some((e) => e.includes("shopping"))).toBe(true);
    expect(result.recommendations[0].explanation.some((e) => e.includes("fuel"))).toBe(true);
  });
});
