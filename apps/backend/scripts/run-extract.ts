/**
 * Run text extraction on a local PDF file (Phase A — validate extraction).
 * Usage: pnpm run extract -- <path-to-pdf> [password]
 * Example: pnpm run extract -- ../../samples/statements/hdfc.pdf
 *          pnpm run extract -- ../../samples/statements/encrypted.pdf mypassword
 */

import * as fs from "fs";
import * as path from "path";
import { extractTextFromPdf } from "../src/modules/parsing/parsing.service";

async function main(): Promise<void> {
  // pnpm injects "--" as first arg; ignore it so path/password are correct
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const pdfPath = args[0];
  const password = args[1]; // optional; never logged

  if (!pdfPath) {
    console.error("Usage: pnpm run extract -- <path-to-pdf> [password]");
    process.exit(1);
  }

  let resolved = path.resolve(process.cwd(), pdfPath);
  if (!fs.existsSync(resolved)) {
    // When run from apps/backend, samples/ is at repo root (cwd/../..)
    const repoRootSamples = path.resolve(
      process.cwd(),
      "..",
      "..",
      "samples",
      "statements",
      path.basename(pdfPath)
    );
    if (fs.existsSync(repoRootSamples)) {
      resolved = repoRootSamples;
    } else {
      console.error("File not found:", resolved);
      process.exit(1);
    }
  }

  const buffer = fs.readFileSync(resolved);
  const result = await extractTextFromPdf(buffer, password);

  if (result.success) {
    // Save to samples/results/<pdfBasename>.txt (repo root relative when run from apps/backend)
    const repoRoot = path.resolve(process.cwd(), "..", "..");
    const resultsDir = path.join(repoRoot, "samples", "results");
    const outBasename = path.basename(resolved, path.extname(resolved)) + ".txt";
    const outPath = path.join(resultsDir, outBasename);
    fs.mkdirSync(resultsDir, { recursive: true });
    fs.writeFileSync(outPath, result.fullText, "utf8");

    console.log("Extraction succeeded");
    console.log("  extractionMethod:", result.extractionMethod);
    console.log("  pageCount:", result.pageCount);
    console.log("  fullText length:", result.fullText.length);
    if (result.pages?.length) {
      console.log("  pages:", result.pages.length);
    }
    console.log("  saved:", outPath);
    console.log("\n--- First 500 chars of fullText ---\n");
    console.log(result.fullText.slice(0, 500));
    if (result.fullText.length > 500) {
      console.log("\n...");
    }
  } else {
    console.error("Extraction failed:", result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
