/**
 * Run bank detection + parsing on sample extracted text files.
 * Usage: pnpm run parse-samples [path-to-results-dir]
 * Default: ../../samples/results (from apps/backend)
 *
 * Sample file → bank mapping (by filename; detection is also run):
 * - 2026-01-18.txt → Amex
 * - 4035*...NORM.txt, 4315*...NORM.txt → ICICI
 * - 5268*...txt, 5522*...txt, 6529*...txt → HDFC
 * - 20260120.txt → HSBC
 */

import * as fs from "fs";
import * as path from "path";
import { detectBank, parseStatement } from "../src/modules/parsing/parsing.service";
import { Bank } from "../src/modules/parsing/parsing.types";

const EXPECTED: Record<string, Bank> = {
  "2026-01-18.txt": Bank.AMEX,
  "4035XXXXXXXX9008_604239_Retail_Sapphiro_NORM.txt": Bank.ICICI,
  "4315XXXXXXXX7001_1076153_Retail_Amazon_NORM.txt": Bank.ICICI,
  "5268XXXXXXXXXX56_17-01-2026_823.txt": Bank.HDFC,
  "5522XXXXXXXXXX60_17-01-2026_629.txt": Bank.HDFC,
  "6529XXXXXXXXXX21_17-01-2026_816.txt": Bank.HDFC,
  "20260120.txt": Bank.HSBC,
};

function getSamplesDir(): string {
  const args = process.argv.slice(2).filter((a) => a !== "--");
  const dir = args[0];
  if (dir) {
    const resolved = path.resolve(process.cwd(), dir);
    if (fs.existsSync(resolved)) return resolved;
  }
  const fromBackend = path.resolve(process.cwd(), "..", "..", "samples", "results");
  if (fs.existsSync(fromBackend)) return fromBackend;
  return path.resolve(process.cwd(), "samples", "results");
}

function main(): void {
  const dir = getSamplesDir();
  if (!fs.existsSync(dir)) {
    console.error("Samples dir not found:", dir);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".txt"));
  console.log("Parsing", files.length, "files from", dir, "\n");

  let ok = 0;
  let fail = 0;
  for (const file of files.sort()) {
    const filePath = path.join(dir, file);
    const text = fs.readFileSync(filePath, "utf8");
    const detected = detectBank(text);
    const expected = EXPECTED[file];
    const parsed = parseStatement(text);

    const bankOk = expected ? detected === expected : true;
    const txCount = parsed.transactions.length;
    const meta = parsed.metadata;
    const period =
      meta.billingPeriodStart && meta.billingPeriodEnd
        ? `${meta.billingPeriodStart} → ${meta.billingPeriodEnd}`
        : "(none)";

    if (bankOk && (expected || txCount > 0)) ok++;
    else fail++;

    console.log(file);
    console.log("  detected:", detected, expected ? (bankOk ? "✓" : `expected ${expected}`) : "");
    console.log("  metadata:", period, meta.cardLast4List?.length ? `cards: ${meta.cardLast4List.join(", ")}` : "");
    if (meta.cardName) console.log("  cardName:", meta.cardName);
    if (meta.totalAmountDue != null || meta.minimumAmountDue != null)
      console.log("  totalDue/minDue:", meta.totalAmountDue, "/", meta.minimumAmountDue);
    if (meta.paymentDueDate) console.log("  dueDate:", meta.paymentDueDate);
    if (meta.creditLimit != null || meta.availableCreditLimit != null)
      console.log("  creditLimit/available:", meta.creditLimit, "/", meta.availableCreditLimit);
    if (meta.spendCategories?.length) console.log("  spendCategories:", meta.spendCategories.map((c) => `${c.category} ${c.percentage}%`).join(", "));
    if (meta.insights?.length) console.log("  insights:", meta.insights.join(", "));
    if (meta.rewardPoints != null) console.log("  rewardPoints:", meta.rewardPoints);
    console.log("  transactions:", txCount);
    if (txCount > 0) {
      const first = parsed.transactions[0]!;
      console.log("  first:", first.date, first.description.slice(0, 40), first.amount);
    }
    console.log("");
  }

  console.log("---");
  console.log(ok, "ok", fail, "unexpected/fail");
  process.exit(fail > 0 ? 1 : 0);
}

main();
