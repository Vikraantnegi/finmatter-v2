/**
 * Seed card_variants from JSON files in src/db/data.
 * Requires: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (in apps/backend/.env or env).
 * Run id migration first so table accepts text ids: supabase-card-catalog-text-id.sql
 *
 * Usage: pnpm run seed-catalog   (from apps/backend)
 */

import * as fs from "fs";
import * as path from "path";

// Load .env from cwd (apps/backend when run via pnpm run seed-catalog)
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const raw = fs.readFileSync(envPath, "utf-8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "").trim();
    }
  }
}
import {
  validateCardVariantPayload,
  cardVariantToRow,
} from "../src/modules/catalog/catalog.service";
import type { CardVariant } from "@finmatter/domain";

const DATA_DIR = path.resolve(__dirname, "../src/db/data");

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error(
      "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (e.g. in .env or shell)."
    );
    process.exit(1);
  }

  const files = fs.readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  if (files.length === 0) {
    console.error("No .json files in", DATA_DIR);
    process.exit(1);
  }

  const rows: ReturnType<typeof cardVariantToRow>[] = [];
  for (const file of files.sort()) {
    const filePath = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Invalid JSON:", file, (e as Error).message);
      process.exit(1);
    }
    const errors = validateCardVariantPayload(data as Record<string, unknown>);
    if (errors.length > 0) {
      console.error("Validation failed:", file, errors);
      process.exit(1);
    }
    const row = cardVariantToRow(data as CardVariant);
    rows.push(row);
  }

  const restUrl = `${url.replace(/\/$/, "")}/rest/v1/card_variants`;
  for (const row of rows) {
    const res = await fetch(restUrl, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("Insert failed for id=%s: %s %s", row.id, res.status, text);
      process.exit(1);
    }
    console.log("Inserted:", row.id);
  }
  console.log("Done. Seeded %d card variants.", rows.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
