import { NextResponse } from "next/server";
import {
  parseStatement,
  parsedLinesToRawTransactions,
  runPipeline,
  canonicalKey,
  detectBank,
  type CategorizedTransaction,
} from "@finmatter/backend";
import { supabase } from "@/lib/supabase/server";

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

  try {
    const parsed = parseStatement(extractedText);
    const cardId = parsed.metadata.cardLast4
      ? `statement-${parsed.metadata.cardLast4}`
      : "unknown-card";
    const rawTransactions = parsedLinesToRawTransactions(parsed.transactions, {
      statementId: id,
      userId,
      cardId,
    });

    const canonical = runPipeline(rawTransactions);

    const canonicalRows = canonical.map((tx: CategorizedTransaction) => ({
      canonical_key: canonicalKey(tx),
      id: tx.id,
      raw_id: tx.rawId,
      user_id: tx.userId,
      card_id: tx.cardId,
      statement_id: tx.statementId,
      date: tx.date,
      amount: tx.amount,
      currency: tx.currency,
      merchant: tx.merchant,
      type: tx.type,
      description: tx.description ?? "",
      status: tx.status,
      confidence_score: tx.confidenceScore,
      parse_method: tx.parseMethod,
      spend_category: tx.spendCategory,
      created_at: tx.createdAt,
      updated_at: tx.updatedAt,
    }));

    if (canonicalRows.length > 0) {
      const { error: upsertError } = await supabase
        .from("canonical_transactions")
        .upsert(canonicalRows, { onConflict: "canonical_key" });
      if (upsertError) {
        return NextResponse.json(
          {
            error: "Failed to persist canonical transactions.",
            message: upsertError.message,
          },
          { status: 500 }
        );
      }
    }

    await supabase
      .from("statement_files")
      .update({
        status: "PARSED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    return NextResponse.json({
      success: true,
      bank: parsed.bank,
      metadata: parsed.metadata,
      transactions: parsed.transactions,
      rawTransactions,
      canonicalCount: canonical.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await supabase
      .from("statement_files")
      .update({
        status: "FAILED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", userId);

    return NextResponse.json(
      { success: false, error: "Parse failed.", message },
      { status: 400 }
    );
  }
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
    .select("id, status, extracted_text")
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
  });
}
