import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { computeRecommendations } from "@/lib/recommend/compute-recommendations";

const PERIOD_TYPES = ["monthly", "quarterly", "yearly"] as const;

/**
 * POST /api/recommend/cards
 * Body: { userId?, period: { type, start, end }, baselineCardIds: string[], candidateCardIds? }
 * Same transaction set for all cards. Baseline = max reward among baselineCardIds.
 * Returns only candidates that beat baseline; excludes cards without rule set.
 */
export async function POST(request: Request) {
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const parsed = body as Record<string, unknown>;
  const period = parsed?.period as Record<string, unknown> | undefined;
  const periodType = period?.type as string | undefined;
  const periodStart = typeof period?.start === "string" ? period.start.trim() : "";
  const periodEnd = typeof period?.end === "string" ? period.end.trim() : "";
  const baselineCardIds = Array.isArray(parsed?.baselineCardIds)
    ? (parsed.baselineCardIds as string[]).filter((id): id is string => typeof id === "string")
    : null;
  const candidateCardIds = Array.isArray(parsed?.candidateCardIds)
    ? (parsed.candidateCardIds as string[]).filter((id): id is string => typeof id === "string" && id.length > 0)
    : undefined;
  const bodyUserId = typeof parsed?.userId === "string" ? parsed.userId.trim() : undefined;
  const effectiveUserId = bodyUserId || userId;

  if (!periodType || !PERIOD_TYPES.includes(periodType as (typeof PERIOD_TYPES)[number])) {
    return NextResponse.json(
      { error: "Missing or invalid period.type. Use monthly, quarterly, or yearly." },
      { status: 400 }
    );
  }
  if (!periodStart || !periodEnd) {
    return NextResponse.json(
      { error: "Missing period.start or period.end (ISO date strings)." },
      { status: 400 }
    );
  }
  if (baselineCardIds === null) {
    return NextResponse.json(
      { error: "baselineCardIds must be an array (may be empty)." },
      { status: 400 }
    );
  }

  const result = await computeRecommendations(supabase, {
    userId: effectiveUserId,
    period: {
      type: periodType as "monthly" | "quarterly" | "yearly",
      start: periodStart,
      end: periodEnd,
    },
    baselineCardIds,
    candidateCardIds,
  });

  return NextResponse.json(result);
}
