/**
 * Unit tests for rewards optimization: same tx set, comparison only.
 * Mocks rule-set loader, transaction fetch, and engine so no real rule sets required.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PeriodRewardSummary } from "@finmatter/rewards-engine";
import { loadRuleSet } from "../rewards/rule-set-loader";
import { fetchAllUserTransactionsInPeriod } from "../rewards/fetch-transactions";
import { computeRewardsCore } from "@finmatter/rewards-engine";
import { computeOptimization } from "./compute-optimization";

const mockPeriod = {
  type: "monthly" as const,
  start: "2025-01-01",
  end: "2025-01-31",
};

vi.mock("../rewards/rule-set-loader", () => ({ loadRuleSet: vi.fn() }));
vi.mock("../rewards/fetch-transactions", () => ({ fetchAllUserTransactionsInPeriod: vi.fn() }));
vi.mock("@finmatter/rewards-engine", () => ({ computeRewardsCore: vi.fn() }));

const mockSupabase = {} as unknown as Parameters<typeof computeOptimization>[0];

beforeEach(() => {
  vi.mocked(fetchAllUserTransactionsInPeriod).mockResolvedValue([]);
  vi.mocked(loadRuleSet).mockReturnValue(null);
  vi.mocked(computeRewardsCore).mockReturnValue({
    perTransactionRewards: [],
    periodSummary: {
      period: mockPeriod,
      totalReward: 0,
      byCategory: {},
      capsHit: [],
      milestonesTriggered: [],
    } as PeriodRewardSummary,
  });
});

describe("computeOptimization", () => {
  it("excludes cards with no rule set (404)", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => (id === "card-a" ? { cardId: id, rules: [] } : null));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => ({
      perTransactionRewards: [],
      periodSummary: {
        period: mockPeriod,
        totalReward: 100,
        byCategory: {},
        capsHit: [],
        milestonesTriggered: [],
      } as PeriodRewardSummary,
    }));

    const result = await computeOptimization(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      cardIds: ["card-a", "no-rule-card", "card-b"],
    });

    expect(result.comparedCards).toHaveLength(1);
    expect(result.comparedCards[0].cardId).toBe("card-a");
    expect(result.bestCardId).toBe("card-a");
    expect(result.baselineCardId).toBe("card-a");
    expect(result.missedReward).toBe(0);
  });

  it("picks bestCardId as card with max totalReward and missedReward = max - baseline", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => ({ cardId: id, rules: [] }));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => {
      const reward = ruleSet.cardId === "high" ? 600 : ruleSet.cardId === "low" ? 100 : 300;
      return {
        perTransactionRewards: [],
        periodSummary: {
          period: mockPeriod,
          totalReward: reward,
          byCategory: { shopping: reward },
          capsHit: [],
          milestonesTriggered: [],
        } as PeriodRewardSummary,
      };
    });

    const result = await computeOptimization(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      cardIds: ["low", "mid", "high"],
      baselineCardId: "low",
    });

    expect(result.bestCardId).toBe("high");
    expect(result.baselineCardId).toBe("low");
    expect(result.missedReward).toBe(500);
    expect(result.comparedCards.map((c) => c.cardId)).toEqual(["low", "mid", "high"]);
    expect(result.comparedCards.find((c) => c.cardId === "high")?.totalReward).toBe(600);
  });

  it("uses first compared card as baseline when baselineCardId omitted", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => ({ cardId: id, rules: [] }));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => ({
      perTransactionRewards: [],
      periodSummary: {
        period: mockPeriod,
        totalReward: ruleSet.cardId === "first" ? 50 : 200,
        byCategory: {},
        capsHit: [],
        milestonesTriggered: [],
      } as PeriodRewardSummary,
    }));

    const result = await computeOptimization(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      cardIds: ["first", "second"],
    });

    expect(result.baselineCardId).toBe("first");
    expect(result.bestCardId).toBe("second");
    expect(result.missedReward).toBe(150);
  });

  it("returns empty result when no cards have rule sets", async () => {
    vi.mocked(loadRuleSet).mockReturnValue(null);

    const result = await computeOptimization(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      cardIds: ["a", "b"],
    });

    expect(result.comparedCards).toHaveLength(0);
    expect(result.bestCardId).toBeNull();
    expect(result.baselineCardId).toBeNull();
    expect(result.missedReward).toBe(0);
    expect(result.byCategory).toEqual([]);
  });

  it("builds byCategory with best card per category and delta vs baseline", async () => {
    vi.mocked(loadRuleSet).mockImplementation((id) => ({ cardId: id, rules: [] }));
    vi.mocked(computeRewardsCore).mockImplementation((ruleSet) => ({
      perTransactionRewards: [],
      periodSummary: {
        period: mockPeriod,
        totalReward: ruleSet.cardId === "A" ? 100 : 60,
        byCategory: {
          shopping: ruleSet.cardId === "A" ? 80 : 20,
          dining: ruleSet.cardId === "A" ? 20 : 40,
        } as Partial<Record<string, number>>,
        capsHit: [],
        milestonesTriggered: [],
      } as PeriodRewardSummary,
    }));

    const result = await computeOptimization(mockSupabase, {
      userId: "u1",
      period: mockPeriod,
      cardIds: ["A", "B"],
      baselineCardId: "A",
    });

    expect(result.byCategory).toBeDefined();
    const shopping = result.byCategory!.find((c) => c.category === "shopping");
    expect(shopping?.bestCardId).toBe("A");
    expect(shopping?.delta).toBe(0);
    const dining = result.byCategory!.find((c) => c.category === "dining");
    expect(dining?.bestCardId).toBe("B");
    expect(dining?.delta).toBe(20);
  });
});
