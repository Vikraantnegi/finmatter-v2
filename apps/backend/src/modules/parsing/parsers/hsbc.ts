/**
 * HSBC credit card statement parser.
 * Format: "21 DEC 2025 To 20 JAN 2026"; card "51xx xxxx xxxx 1560";
 * transaction lines "DDMMM   description   amount [CR]" (e.g. 02JAN, 20DEC).
 */

import type { ParsedStatement, StatementMetadata, ParsedTransactionLine } from "../parsing.types";
import { Bank } from "../parsing.types";

const HSBC_MARKERS = ["HSBC", "hsbc.co.in", "HSBC Credit Card", "HSBC TRAVELONE", "HSBC Travel One"];

const BILLING_PERIOD_RE = /(\d{1,2}\s+[A-Z]{3}\s+\d{4})\s+To\s+(\d{1,2}\s+[A-Z]{3}\s+\d{4})/i;
const CARD_RE = /51xx\s+xxxx\s+xxxx\s+(\d{4})/g;
// Match mid-line: "02JAN   BBPS PMT ...   45,141.77   CR" (no ^$ so works in long lines)
const TX_LINE_RE = /(\d{2}[A-Z]{3})\s+(.+?)\s+([\d,]+\.?\d*)(?:\s+CR)?/g;

const MONTH_ABBR: Record<string, number> = {
  JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
  JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
};

function formatDate(year: number, month0: number, day: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDdMmmYyyy(str: string, yearHint: number): string {
  const m = str.trim().match(/(\d{1,2})\s+([A-Z]{3})\s+(\d{4})/);
  if (m) {
    const [, day, mon, y] = m;
    const month = MONTH_ABBR[mon!];
    if (month !== undefined) {
      return formatDate(parseInt(y!, 10), month, parseInt(day!, 10));
    }
  }
  return "";
}

function ddMmmToIso(ddMmm: string, yearHint: number, endMonth?: number): string {
  const day = parseInt(ddMmm.slice(0, 2), 10);
  const mon = ddMmm.slice(2, 5).toUpperCase();
  const month = MONTH_ABBR[mon];
  if (month === undefined || !day) return "";
  const year = endMonth !== undefined && month > endMonth ? yearHint - 1 : yearHint;
  return formatDate(year, month, day);
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

export function parseHsbcStatement(fullText: string): ParsedStatement {
  const metadata = extractMetadata(fullText);
  const yearHint = metadata.billingPeriodEnd ? parseInt(metadata.billingPeriodEnd.slice(0, 4), 10) : new Date().getFullYear();
  const endMonth = metadata.billingPeriodEnd ? new Date(metadata.billingPeriodEnd + "T00:00:00").getMonth() : undefined;
  const transactions = extractTransactions(fullText, yearHint, endMonth);
  return {
    bank: Bank.HSBC,
    metadata,
    transactions,
  };
}

const CARD_NAME_HSBC_RE = /(\d+\s+of\s+\d+\s+)?(HSBC\s+[A-Z]+\s+CREDIT\s+CARD)/i;
const HSBC_DUE_RE = /(\d{1,2}\s+[A-Z]{3}\s+\d{4})\s+([\d,]+\.?\d*)\s+\d{1,2}\s+[A-Z]{3}\s+\d{4}\s+To\s+[\d\sA-Z]+\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/i;
const AVAILABLE_CREDIT_HSBC_RE = /Available\s+Credit\s+Limit\s+([\d,]+\.?\d*)/i;
const INTEREST_RATE_HSBC_RE = /Interest\s+Rate\s+applicable\s*:\s*([\d.]+)\s*%\s*p\.m\./i;

function extractMetadata(fullText: string): StatementMetadata {
  let billingPeriodStart = "";
  let billingPeriodEnd = "";
  const m = fullText.match(BILLING_PERIOD_RE);
  if (m) {
    const y2 = m[2]?.match(/(\d{4})/)?.[1];
    const year = y2 ? parseInt(y2, 10) : new Date().getFullYear();
    billingPeriodStart = parseDdMmmYyyy(m[1]!, year);
    billingPeriodEnd = parseDdMmmYyyy(m[2]!, year);
  }

  const cardLast4List: string[] = [];
  let match: RegExpExecArray | null;
  CARD_RE.lastIndex = 0;
  while ((match = CARD_RE.exec(fullText)) !== null) {
    const last4 = match[1]!;
    if (!cardLast4List.includes(last4)) cardLast4List.push(last4);
  }

  let cardName: string | undefined;
  const cardNameM = fullText.match(CARD_NAME_HSBC_RE);
  if (cardNameM) cardName = cardNameM[2]!.replace(/\s+/g, " ").trim();

  let paymentDueDate: string | undefined;
  let minimumAmountDue: number | undefined;
  let totalAmountDue: number | undefined;
  let creditLimit: number | undefined;
  const dueM = fullText.match(HSBC_DUE_RE);
  if (dueM) {
    const [, dueStr, minDue, total, limit1, limit2] = dueM;
    if (dueStr) {
      const dm = dueStr.trim().match(/(\d{1,2})\s+([A-Z]{3})\s+(\d{4})/);
      if (dm) {
        const mon = MONTH_ABBR[dm[2]!];
        if (mon !== undefined) paymentDueDate = formatDate(parseInt(dm[3]!, 10), mon, parseInt(dm[1]!, 10));
      }
    }
    minimumAmountDue = parseAmount(minDue!);
    totalAmountDue = parseAmount(total!);
    creditLimit = parseAmount(limit1!);
  }
  const availM = fullText.match(AVAILABLE_CREDIT_HSBC_RE);
  let availableCreditLimit: number | undefined;
  if (availM) availableCreditLimit = parseAmount(availM[1]!);

  // --- Optional enrichments (deterministic; can be toggled/measured later) ---
  let interestRatesDisplay: StatementMetadata["interestRatesDisplay"];
  const irM = fullText.match(INTEREST_RATE_HSBC_RE);
  if (irM) interestRatesDisplay = `${irM[1]}% p.m.`;

  return {
    issuer: "HSBC",
    productName: "HSBC TravelOne Credit Card",
    cardName,
    billingPeriodStart: billingPeriodStart || "",
    billingPeriodEnd: billingPeriodEnd || "",
    cardLast4: cardLast4List[0],
    cardLast4List: cardLast4List.length ? cardLast4List : undefined,
    totalAmountDue,
    minimumAmountDue,
    paymentDueDate,
    creditLimit,
    availableCreditLimit,
    interestRatesDisplay,
  };
}

function extractTransactions(fullText: string, yearHint: number, endMonth?: number): ParsedTransactionLine[] {
  const lines: ParsedTransactionLine[] = [];
  let match: RegExpExecArray | null;
  TX_LINE_RE.lastIndex = 0;
  while ((match = TX_LINE_RE.exec(fullText)) !== null) {
    const [, dateStr, description, amountStr] = match;
    const rawLine = match[0] ?? "";
    const isCredit = rawLine.includes(" CR");
    const amount = parseAmount(amountStr!);
    const date = ddMmmToIso(dateStr!, yearHint, endMonth);
    if (!date) continue;
    const desc = description!.trim();
    const countryOrRegionCode = /\s+(IN|IND|KAR|WA|MH|DL|TN|KA|KL|GJ|[A-Z]{2,3})$/i.exec(desc)?.[1];
    lines.push({
      date,
      amount: isCredit ? -amount : amount,
      description: desc,
      type: isCredit ? "credit" : "debit",
      countryOrRegionCode,
    });
  }
  return lines;
}

export function isHsbcStatement(text: string): boolean {
  const t = text.slice(0, 8000);
  return HSBC_MARKERS.some((m) => t.includes(m));
}
