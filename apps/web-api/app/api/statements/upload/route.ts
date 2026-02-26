import { createHash } from "crypto";
import { spawn } from "child_process";
import path from "path";
import { existsSync } from "fs";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

const BUCKET = "statement-files";

function sha256(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/** Extraction result shape (from backend script stdout). */
type ExtractionResult =
  | { success: true; fullText: string; pages?: string[]; pageCount: number; extractionMethod: string }
  | { success: false; error: string; message?: string };

function getBackendScriptPath(): string | null {
  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, "..", "backend"),
    path.resolve(cwd, "apps", "backend"),
  ];
  const scriptName = "extract-stdin.js";
  for (const dir of candidates) {
    const scriptPath = path.join(dir, "dist", "scripts", scriptName);
    if (existsSync(scriptPath)) return scriptPath;
  }
  return null;
}

function runExtractViaScript(buffer: Buffer, password?: string): Promise<ExtractionResult> {
  const scriptPath = getBackendScriptPath();
  if (!scriptPath) {
    return Promise.reject(
      new Error(
        "Backend extract script not found. Run: pnpm --filter @finmatter/backend build"
      )
    );
  }
  const backendDir = path.dirname(path.dirname(path.dirname(scriptPath)));
  return new Promise((resolve, reject) => {
    const args = [scriptPath, password ?? ""];
    const child = spawn(process.execPath, args, {
      cwd: backendDir,
      stdio: ["pipe", "pipe", "inherit"],
    });
    const chunks: Buffer[] = [];
    child.stdout.on("data", (chunk: Buffer) => chunks.push(chunk));
    child.on("error", reject);
    child.on("close", (code, signal) => {
      const out = Buffer.concat(chunks).toString("utf8").trim();
      // Script writes a single JSON line to stdout (logs redirected to stderr). Try full output first.
      let result: ExtractionResult | null = null;
      try {
        const parsed = JSON.parse(out) as ExtractionResult;
        if (typeof parsed.success === "boolean") result = parsed;
      } catch {
        // Fallback: find a line that parses as JSON (e.g. if logs leaked to stdout).
        const lines = out.split("\n").filter(Boolean);
        for (let i = lines.length - 1; i >= 0; i--) {
          try {
            const parsed = JSON.parse(lines[i]!) as ExtractionResult;
            if (typeof parsed.success === "boolean") {
              result = parsed;
              break;
            }
          } catch {
            /* not JSON */
          }
        }
      }
      if (result) resolve(result);
      else reject(new Error(`Extract script failed (code=${code}, signal=${signal}). Output: ${out.slice(0, 200)}`));
    });
    child.stdin.write(buffer);
    child.stdin.end();
  });
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      },
      { status: 503 }
    );
  }
  const db = supabase;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const password = (formData.get("password") as string) || undefined;

  if (!file || file.size === 0) {
    return NextResponse.json({ error: "Missing or empty file." }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "File must be a PDF." }, { status: 400 });
  }

  const userId = request.headers.get("x-user-id") || "test-user";
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const fileHash = sha256(buffer);

  const { data: existing } = await db
    .from("statement_files")
    .select("id, file_path, status, extracted_text, page_count, extraction_method")
    .eq("user_id", userId)
    .eq("file_hash", fileHash)
    .maybeSingle();

  let id: string;
  let filePath: string;

  if (existing) {
    if (existing.status === "EXTRACTED" && existing.extracted_text) {
      return NextResponse.json({
        duplicate: true,
        id: existing.id,
        success: true,
        fullText: existing.extracted_text,
        pageCount: existing.page_count ?? 0,
        extractionMethod: existing.extraction_method ?? "pdfjs",
      });
    }
    // Same hash but extraction failed (or never completed): allow retry on existing row.
    id = existing.id;
    filePath = existing.file_path;
    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: "application/pdf", upsert: true });
    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to store PDF: " + uploadError.message },
        { status: 500 }
      );
    }
    await db
      .from("statement_files")
      .update({
        status: "UPLOADED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
  } else {
    id = crypto.randomUUID();
    filePath = `${userId}/${id}.pdf`;
    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: "application/pdf", upsert: false });
    if (uploadError) {
      return NextResponse.json(
        { error: "Failed to store PDF: " + uploadError.message },
        { status: 500 }
      );
    }
    const { error: insertError } = await db.from("statement_files").insert({
      id,
      user_id: userId,
      file_path: filePath,
      file_hash: fileHash,
      status: "UPLOADED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (insertError) {
      await db.storage.from(BUCKET).remove([filePath]);
      return NextResponse.json(
        { error: "Failed to create record: " + insertError.message },
        { status: 500 }
      );
    }
  }

  console.log("[POST /api/statements/upload] extraction start", { id, bufferLength: buffer.length, passwordPresent: !!password });
  let result: ExtractionResult;
  try {
    result = await runExtractViaScript(buffer, password);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/statements/upload] extraction error", { id, message });
    return NextResponse.json(
      { error: "Extraction failed.", message },
      { status: 500 }
    );
  }

  if (result.success) {
    console.log("[POST /api/statements/upload] extraction success", { id, pageCount: result.pageCount });
    await db
      .from("statement_files")
      .update({
        status: "EXTRACTED",
        extracted_text: result.fullText,
        page_count: result.pageCount,
        extraction_method: result.extractionMethod,
        failure_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    const autoParse = new URL(request.url).searchParams.get("autoParse") === "true";
    if (autoParse) {
      const { parseAndPersistStatement } = await import("@/lib/statement-parse");
      const parseResult = await parseAndPersistStatement(db, id, userId, result.fullText);
      if (parseResult.success) {
        return NextResponse.json({
          id,
          success: true,
          fullText: result.fullText,
          pageCount: result.pageCount,
          extractionMethod: result.extractionMethod,
          parsed: true,
          bank: parseResult.bank,
          canonicalCount: parseResult.canonicalCount,
          metadata: parseResult.metadata,
          transactions: parseResult.transactions,
          rawTransactions: parseResult.rawTransactions,
        });
      }
      return NextResponse.json(
        {
          id,
          success: true,
          fullText: result.fullText,
          pageCount: result.pageCount,
          extractionMethod: result.extractionMethod,
          parsed: false,
          parseError: parseResult.error,
          parseMessage: parseResult.message,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      id,
      success: true,
      fullText: result.fullText,
      pages: result.pages,
      pageCount: result.pageCount,
      extractionMethod: result.extractionMethod,
    });
  }

  const failureReason = result.message ?? result.error ?? "Extraction failed";
  console.error("[POST /api/statements/upload] extraction failed", { id, error: result.error, message: result.message });
  await db
    .from("statement_files")
    .update({
      status: "FAILED",
      failure_reason: failureReason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json(
    {
      success: false,
      error: result.error,
      ...(result.message && { message: result.message }),
    },
    { status: 400 }
  );
}
