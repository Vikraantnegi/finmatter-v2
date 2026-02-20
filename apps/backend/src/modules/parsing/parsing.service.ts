/**
 * Statement parsing service.
 *
 * Pipeline (conceptual):
 * 1. Extracted text (from Step 1 / PDF extraction)
 * 2. Core parsing — bank detection + metadata + transaction lines (per-bank parser)
 * 3. Optional enrichments — statementSummary, cashback lines, dues, etc. (deterministic; implemented inside each parser; can be toggled/measured later)
 * 4. RawTransaction mapping — parsed lines → RawTransaction[] for the pipeline
 *
 * Step 1 (caller): PDF → text extraction (bank-agnostic).
 * Step 2 (this module): text → parseStatement() [core + optional] → parsedLinesToRawTransactions().
 */

import type { RawTransaction } from "@finmatter/domain";
import type { ExtractionResult, ExtractionFailure, ParsedStatement, ParsedTransactionLine } from "./parsing.types";
import { Bank, ExtractionErrorCode } from "./parsing.types";
import { isIciciStatement, parseIciciStatement } from "./parsers/icici";
import { isHdfcStatement, parseHdfcStatement } from "./parsers/hdfc";
import { isAmexStatement, parseAmexStatement } from "./parsers/amex";
import { isHsbcStatement, parseHsbcStatement } from "./parsers/hsbc";

interface PdfJsLib {
  getDocument: (opts: {
    data: Uint8Array;
    password: string;
    useSystemFonts?: boolean;
  }) => {
    promise: Promise<PdfDocument>;
  };
}

interface PdfDocument {
  numPages: number;
  getPage: (
    n: number
  ) => Promise<{
    getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
  }>;
}

function toExtractionError(err: unknown): ExtractionErrorCode {
  const message = err instanceof Error ? err.message : String(err);
  const code =
    err && typeof err === "object" && "code" in err
      ? (err as { code?: number }).code
      : undefined;
  if (
    code === 1 ||
    /password|need.?password|wrong.?password|invalid.?password|decrypt|encrypted.*required/i.test(
      message
    )
  ) {
    return ExtractionErrorCode.WRONG_PASSWORD;
  }
  if (/corrupt|invalid|malformed|damaged/i.test(message)) {
    return ExtractionErrorCode.CORRUPT_PDF;
  }
  return ExtractionErrorCode.UNSUPPORTED_ENCRYPTION;
}

/**
 * Extract text from a PDF buffer. Password is used in memory only; never stored or logged.
 * Raw PDF must already be stored before calling this; this returns only the derived text result.
 *
 * @param buffer — PDF file contents
 * @param password — Optional; use for decryption only, then discard
 * @returns ExtractionResult — { success: true, ...ExtractedText } or { success: false, error }
 */
const LOG_PREFIX = "[extractTextFromPdf]";

export async function extractTextFromPdf(
  buffer: Buffer,
  password?: string
): Promise<ExtractionResult> {
  console.log(LOG_PREFIX, "start", { bufferLength: buffer.length, passwordPresent: !!password, passwordLength: password?.length ?? 0 });

  // pdfjs-dist v4 is ESM-only (.mjs); use dynamic import. Support both default and named exports (Next.js vs ts-node).
  const mod = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdfjsLib = (mod.default ?? mod) as PdfJsLib;
  if (!pdfjsLib?.getDocument) {
    console.error(LOG_PREFIX, "pdfjs getDocument missing; mod keys:", Object.keys(mod));
    throw new Error(
      "pdfjs-dist: getDocument not found. Ensure pdfjs-dist is installed and the legacy build is available."
    );
  }
  // Note: disableWorker is not set — pdfjs-dist exports a frozen object. When run via the
  // backend script (Node child process), the worker is resolved from node_modules and should load.
  console.log(LOG_PREFIX, "pdfjs loaded");

  const data = new Uint8Array(buffer);
  const loadingTask = pdfjsLib.getDocument({
    data,
    password: password ?? "",
    useSystemFonts: true,
  });

  let doc: PdfDocument;
  try {
    doc = await loadingTask.promise;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const code = err && typeof err === "object" && "code" in err ? (err as { code?: number }).code : undefined;
    const name = err instanceof Error ? err.name : undefined;
    console.error(LOG_PREFIX, "getDocument.promise failed", {
      message,
      name,
      code,
      classifiedAs: toExtractionError(err),
    });
    const failure: ExtractionFailure = {
      success: false,
      error: toExtractionError(err),
      message,
    };
    return failure;
  }

  const pageCount = doc.numPages;
  console.log(LOG_PREFIX, "doc loaded", { pageCount });
  const pages: string[] = [];
  let fullText = "";

  for (let i = 1; i <= pageCount; i++) {
    try {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item) => item.str ?? "").join(" ");
      pages.push(pageText);
      fullText += (fullText ? "\n\n" : "") + pageText;
    } catch (pageErr) {
      // Some pages can throw (e.g. "Invalid stream" / flate); skip and continue.
      console.warn(LOG_PREFIX, "page failed", { page: i, err: pageErr instanceof Error ? pageErr.message : String(pageErr) });
    }
  }

  console.log(LOG_PREFIX, "done", { fullTextLength: fullText.length });
  return {
    success: true,
    fullText,
    pages,
    pageCount,
    extractionMethod: "pdfjs",
  };
}

/**
 * Detect bank/format from extracted text (keyword/pattern based).
 */
export function detectBank(text: string): Bank {
  if (!text || text.length < 100) return Bank.UNKNOWN;
  if (isIciciStatement(text)) return Bank.ICICI;
  if (isHdfcStatement(text)) return Bank.HDFC;
  if (isAmexStatement(text)) return Bank.AMEX;
  if (isHsbcStatement(text)) return Bank.HSBC;
  return Bank.UNKNOWN;
}

/**
 * Parse extracted text into statement metadata + transaction lines.
 * Phase: core parsing + optional enrichments (both inside each bank parser).
 * If bank is provided, use it; otherwise detect.
 */
export function parseStatement(fullText: string, bank?: Bank): ParsedStatement {
  const resolved = bank ?? detectBank(fullText);
  switch (resolved) {
    case Bank.ICICI:
      return parseIciciStatement(fullText);
    case Bank.HDFC:
      return parseHdfcStatement(fullText);
    case Bank.AMEX:
      return parseAmexStatement(fullText);
    case Bank.HSBC:
      return parseHsbcStatement(fullText);
    default:
      return {
        bank: Bank.UNKNOWN,
        metadata: { issuer: "Unknown", billingPeriodStart: "", billingPeriodEnd: "" },
        transactions: [],
      };
  }
}

/**
 * Map parsed transaction lines to RawTransaction[] for the pipeline.
 */
export function parsedLinesToRawTransactions(
  parsed: ParsedTransactionLine[],
  opts: { statementId: string; userId: string; cardId: string }
): RawTransaction[] {
  const { statementId, userId, cardId } = opts;
  return parsed.map((line) => ({
    id: crypto.randomUUID(),
    source: "manual" as const,
    payload: JSON.stringify(line),
    userId,
    cardId,
    statementId,
    createdAt: new Date().toISOString(),
  }));
}
