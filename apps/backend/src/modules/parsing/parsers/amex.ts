/**
 * American Express (Amex) credit card statement parser.
 * Format: Statement Period "From December 19 to January 18, 2026";
 * transaction lines "Month DD   description   amount [CR]".
 */

import type { ParsedStatement, StatementMetadata, ParsedTransactionLine } from "../parsing.types";
import { Bank } from "../parsing.types";

const AMEX_MARKERS = [
  "American Express",
  "americanexpress.co.in",
  "American Express®",
  "American Express Card",
];

const MONTH_GROUP = "(January|February|March|April|May|June|July|August|September|October|November|December)";
const STATEMENT_PERIOD_RE = new RegExp(`Statement\\s+Period\\s+From\\s+${MONTH_GROUP}\\s+(\\d{1,2})\\s+to\\s+${MONTH_GROUP}\\s+(\\d{1,2}),\\s+(\\d{4})`, "i");
const TX_LINE_RE = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\s{2,}(.+?)\s{2,}([\d,]+\.\d{2})(?:\s+.*?CR)?/g;

const MONTH_NAMES: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function formatDate(year: number, month0: number, day: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseEnDate(month: string, day: number, year: number): string {
  const m = MONTH_NAMES[month];
  if (m === undefined) return "";
  return formatDate(year, m, day);
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

export function parseAmexStatement(fullText: string): ParsedStatement {
  const metadata = extractMetadata(fullText);
  const transactions = extractTransactions(fullText, metadata.billingPeriodEnd ? metadata.billingPeriodEnd.slice(0, 4) : "2026");
  return {
    bank: Bank.AMEX,
    metadata,
    transactions,
  };
}

const CARD_NAME_RE = /American\s+Express®?\s+([A-Za-z\s]+)\s+Credit\s+Card/i;
const CREDIT_LIMIT_RE = /At\s+\w+\s+\d{1,2},\s+\d{4}\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/i;
const CLOSING_MIN_RE = /([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+Minimum\s+Payment\s+Due/i;
const MIN_PAYMENT_DUE_RE = /Minimum\s+Payment:\s+Rs\s+([\d,]+\.?\d*)\s+Due\s+by\s+(\w+)\s+(\d{1,2}),\s+(\d{4})/i;
const INTEREST_RATES_AMEX_RE =
  /Current\s+Rates\s+of\s+Interest[\s\S]*?Monthly\s+Rate\s+Goods\s+And\s+Services\s+([\d.]+)%[\s\S]*?Monthly\s+Rate\s+Cash\s+Transactions\s+([\d.]+)%/i;

function extractMetadata(fullText: string): StatementMetadata {
  let billingPeriodStart = "";
  let billingPeriodEnd = "";
  const m = fullText.match(STATEMENT_PERIOD_RE);
  if (m) {
    const [, startMonth, startDay, endMonth, endDay, yearStr] = m;
    const year = parseInt(yearStr!, 10);
    const startYear = MONTH_NAMES[startMonth!] >= 9 && MONTH_NAMES[endMonth!] <= 1 ? year - 1 : year;
    billingPeriodStart = parseEnDate(startMonth!, parseInt(startDay!, 10), startYear);
    billingPeriodEnd = parseEnDate(endMonth!, parseInt(endDay!, 10), year);
  }

  let cardName: string | undefined;
  const cardNameM = fullText.match(CARD_NAME_RE);
  if (cardNameM) cardName = `American Express® ${cardNameM[1]!.trim()} Credit Card`;

  let creditLimit: number | undefined;
  let availableCreditLimit: number | undefined;
  const limitM = fullText.match(CREDIT_LIMIT_RE);
  if (limitM) {
    creditLimit = parseAmount(limitM[1]!);
    availableCreditLimit = parseAmount(limitM[2]!);
  }

  let totalAmountDue: number | undefined;
  let minimumAmountDue: number | undefined;
  const closingM = fullText.match(CLOSING_MIN_RE);
  if (closingM) {
    totalAmountDue = parseAmount(closingM[1]!);
    minimumAmountDue = parseAmount(closingM[2]!);
  }
  const minDueM = fullText.match(MIN_PAYMENT_DUE_RE);
  if (minDueM && minimumAmountDue === undefined) minimumAmountDue = parseAmount(minDueM[1]!);

  let paymentDueDate: string | undefined;
  if (minDueM) {
    const [, , dueMonth, dueDay, dueYear] = minDueM;
    const mon = MONTH_NAMES[dueMonth!.trim()];
    if (mon !== undefined) paymentDueDate = formatDate(parseInt(dueYear!, 10), mon, parseInt(dueDay!, 10));
  }

  // --- Optional enrichments (deterministic; can be toggled/measured later) ---
  let interestRatesDisplay: StatementMetadata["interestRatesDisplay"];
  const irM = fullText.match(INTEREST_RATES_AMEX_RE);
  if (irM) {
    const goods = parseFloat(irM[1]!);
    const cash = parseFloat(irM[2]!);
    if (!Number.isNaN(goods) || !Number.isNaN(cash)) {
      interestRatesDisplay = { goodsAndServices: Number.isNaN(goods) ? undefined : goods, cash: Number.isNaN(cash) ? undefined : cash };
    }
  }

  return {
    issuer: "American Express",
    productName: "American Express Credit Card",
    cardName,
    billingPeriodStart,
    billingPeriodEnd,
    creditLimit,
    availableCreditLimit,
    totalAmountDue,
    minimumAmountDue,
    paymentDueDate,
    interestRatesDisplay,
  };
}

function extractTransactions(fullText: string, yearHint: string): ParsedTransactionLine[] {
  const lines: ParsedTransactionLine[] = [];
  const year = parseInt(yearHint, 10) || new Date().getFullYear();
  let match: RegExpExecArray | null;
  TX_LINE_RE.lastIndex = 0;
  while ((match = TX_LINE_RE.exec(fullText)) !== null) {
    const monthStr = match[1]!;
    const day = parseInt(match[2]!, 10);
    const description = match[3]!.trim();
    const amountStr = match[4]!;
    const rawLine = match[0] ?? "";
    const isCredit = rawLine.includes(" CR");
    const amount = parseAmount(amountStr);
    const monthNum = MONTH_NAMES[monthStr];
    if (monthNum === undefined) continue;
    if (description.startsWith("to ") && description.length < 30) continue;
    if (/^to\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/.test(description)) continue;
    if (amountStr === "2026") continue;
    if (/^,\s*\d{4}\s*$/.test(description)) continue;
    const yearForTx = monthNum >= 9 ? year - 1 : year;
    const date = formatDate(yearForTx, monthNum, day);
    lines.push({
      date,
      amount: isCredit ? -amount : amount,
      description,
      type: isCredit ? "credit" : "debit",
    });
  }
  return lines;
}

export function isAmexStatement(text: string): boolean {
  const t = text.slice(0, 8000);
  return AMEX_MARKERS.some((m) => t.includes(m));
}
