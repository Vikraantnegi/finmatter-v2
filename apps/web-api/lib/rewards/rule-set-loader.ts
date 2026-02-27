/**
 * Rule-set loader: cardId → CardRuleSet from filesystem.
 * v1: rule sets live at apps/backend/src/db/data/rule-sets/<cardId>.json
 */

import fs from "fs";
import path from "path";
import type { CardRuleSet } from "@finmatter/rewards-engine";

const DEFAULT_RULE_SETS_DIR = path.join(
  process.cwd(),
  "..",
  "backend",
  "src",
  "db",
  "data",
  "rule-sets"
);

function getRuleSetsDir(): string {
  return process.env.RULE_SETS_PATH ?? DEFAULT_RULE_SETS_DIR;
}

/**
 * Load CardRuleSet for a card. Returns null if file not found or invalid.
 * Caller should return 404 when null.
 */
export function loadRuleSet(cardId: string): CardRuleSet | null {
  const dir = getRuleSetsDir();
  const filePath = path.join(dir, `${cardId}.json`);
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as CardRuleSet;
    if (!data?.cardId || !Array.isArray(data.rules)) return null;
    return data;
  } catch {
    return null;
  }
}
