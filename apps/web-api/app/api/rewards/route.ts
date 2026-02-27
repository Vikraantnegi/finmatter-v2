import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { computeRewards } from "@/lib/rewards/compute-rewards";

const PERIOD_TYPES = ["monthly", "quarterly", "yearly"] as const;

/**
 * GET /api/rewards?cardId=&periodType=&periodStart=&periodEnd=
 * Headers: x-user-id (optional; default test-user)
 *
 * Returns engine output: { perTransactionRewards, periodSummary } or 400/404/503.
 */
export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 503 }
    );
  }

  const userId = request.headers.get("x-user-id") ?? "test-user";
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId");
  const periodType = searchParams.get("periodType");
  const periodStart = searchParams.get("periodStart");
  const periodEnd = searchParams.get("periodEnd");

  if (!cardId?.trim()) {
    return NextResponse.json(
      { error: "Missing or empty cardId." },
      { status: 400 }
    );
  }
  if (!periodType || !PERIOD_TYPES.includes(periodType as (typeof PERIOD_TYPES)[number])) {
    return NextResponse.json(
      { error: "Missing or invalid periodType. Use monthly, quarterly, or yearly." },
      { status: 400 }
    );
  }
  if (!periodStart?.trim() || !periodEnd?.trim()) {
    return NextResponse.json(
      { error: "Missing periodStart or periodEnd (ISO date strings)." },
      { status: 400 }
    );
  }

  const result = await computeRewards(supabase, {
    userId,
    cardId: cardId.trim(),
    period: {
      type: periodType as "monthly" | "quarterly" | "yearly",
      start: periodStart.trim(),
      end: periodEnd.trim(),
    },
  });

  if (!result.ok) {
    if (result.error === "RULE_SET_NOT_FOUND") {
      return NextResponse.json(
        { error: result.message ?? "No rule set for this card." },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: result.message ?? "Failed to compute rewards." },
      { status: 500 }
    );
  }

  return NextResponse.json(result.data);
}
