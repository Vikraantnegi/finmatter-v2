/**
 * Extract text from PDF read via stdin. Used by web-api so pdfjs runs in a
 * plain Node process. Usage: node dist/scripts/extract-stdin.js [password] < file.pdf
 * Output: single JSON line (ExtractionResult) to stdout. Logs go to stderr.
 */

import { extractTextFromPdf } from "../src/modules/parsing/parsing.service";

function writeResult(
  result: { success: boolean; error?: string; message?: string; fullText?: string; pageCount?: number; extractionMethod?: string; pages?: string[] },
  cb?: (exitCode: number) => void
): void {
  const exitCode = result.success ? 0 : 1;
  process.stdout.write(JSON.stringify(result) + "\n", () => cb?.(exitCode));
}

function writeFailure(err: unknown): void {
  writeResult(
    {
      success: false,
      error: "UNSUPPORTED_ENCRYPTION",
      message: err instanceof Error ? err.message : String(err),
    },
    (code) => process.exit(code)
  );
}

// Always output JSON so the parent can parse it (even on uncaught errors).
process.on("uncaughtException", (err) => { writeFailure(err); });
process.on("unhandledRejection", (_reason, err) => { writeFailure(err ?? _reason); });

// Redirect logs to stderr so stdout has only the JSON result line.
const stderrWrite = (s: string) => process.stderr.write(s);
console.log = (...args: unknown[]) => stderrWrite(args.map(String).join(" ") + "\n");
console.warn = (...args: unknown[]) => stderrWrite(args.map(String).join(" ") + "\n");
console.error = (...args: unknown[]) => stderrWrite(args.map(String).join(" ") + "\n");

async function main(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  const password = process.argv[2] || undefined;

  const result = await extractTextFromPdf(buffer, password);
  writeResult(result, (code) => process.exit(code));
}

main().catch((err) => { writeFailure(err); });
