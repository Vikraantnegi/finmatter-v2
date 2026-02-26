import { NextResponse } from "next/server";
import { detectBank, parseStatement } from "@finmatter/backend";
import { supabase } from "@/lib/supabase/server";
import { parseAndPersistStatement } from "@/lib/statement-parse";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      },
      { status: 503 }
    );
  }
  const { id } = await params;
  const userId = _request.headers.get("x-user-id") || "test-user";

  const { data: row, error: fetchError } = await supabase
    .from("statement_files")
    .select("id, user_id, status, extracted_text")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json(
      { error: "Failed to fetch statement: " + fetchError.message },
      { status: 500 }
    );
  }
  if (!row) {
    return NextResponse.json({ error: "Statement not found." }, { status: 404 });
  }
  if (row.status !== "EXTRACTED") {
    return NextResponse.json(
      { error: "Statement must be EXTRACTED before parsing. Current status: " + row.status },
      { status: 400 }
    );
  }
  const extractedText = row.extracted_text as string | null;
  if (!extractedText || extractedText.length < 50) {
    return NextResponse.json(
      { error: "No extracted text available for this statement." },
      { status: 400 }
    );
  }

  const result = await parseAndPersistStatement(supabase, id, userId, extractedText);

  if (result.success) {
    return NextResponse.json({
      success: true,
      bank: result.bank,
      metadata: result.metadata,
      transactions: result.transactions,
      rawTransactions: result.rawTransactions,
      canonicalCount: result.canonicalCount,
    });
  }

  return NextResponse.json(
    { success: false, error: result.error, message: result.message },
    { status: 400 }
  );
}

/** GET: return detected bank and parse result without persisting. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured." },
      { status: 503 }
    );
  }
  const { id } = await params;
  const userId = _request.headers.get("x-user-id") || "test-user";

  const { data: row, error } = await supabase
    .from("statement_files")
    .select("id, status, extracted_text, failure_reason")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json({ error: "Statement not found." }, { status: 404 });
  }
  const extractedText = row.extracted_text as string | null;
  if (!extractedText) {
    return NextResponse.json(
      { error: "No extracted text. Extract first." },
      { status: 400 }
    );
  }

  const bank = detectBank(extractedText);
  const parsed = parseStatement(extractedText);
  return NextResponse.json({
    bank,
    metadata: parsed.metadata,
    transactions: parsed.transactions,
    status: row.status,
    failure_reason: row.failure_reason ?? undefined,
  });
}
