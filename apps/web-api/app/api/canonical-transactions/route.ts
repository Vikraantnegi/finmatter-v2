import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

export type CanonicalTransactionRow = {
  canonical_key: string;
  id: string;
  raw_id: string;
  user_id: string;
  card_id: string;
  statement_id: string;
  date: string;
  amount: number;
  currency: string;
  merchant: { raw: string; normalized: string; merchantCategory: string };
  type: string;
  description: string;
  status: string;
  confidence_score: number;
  parse_method: string;
  spend_category: string;
  created_at: string;
  updated_at: string;
};

export async function GET(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      },
      { status: 503 }
    );
  }
  const userId = request.headers.get("x-user-id") || "test-user";
  const { searchParams } = new URL(request.url);
  const lowConfidenceOnly = searchParams.get("lowConfidence") === "true";

  let query = supabase
    .from("canonical_transactions")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (lowConfidenceOnly) {
    query = query.lt("confidence_score", 1);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch canonical transactions.", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    transactions: (data ?? []) as CanonicalTransactionRow[],
  });
}
