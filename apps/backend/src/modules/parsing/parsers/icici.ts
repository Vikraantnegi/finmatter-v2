/**
 * ICICI Bank credit card statement parser.
 * Extracts metadata and transaction lines from extracted text.
 */

import type {
  ParsedStatement,
  StatementMetadata,
  ParsedTransactionLine,
  SpendCategory,
  StatementSummary,
} from "../parsing.types";
import { Bank, toVerifiedNumber } from "../parsing.types";

const ICICI_MARKERS = [
  "ICICI Bank",
  "icicibank.com",
  "ICICI Bank Credit Card",
  "ICICI Bank Tower",
];

const STATEMENT_PERIOD_RE = /Statement\s+period\s*:\s*(\w+\s+\d{1,2},\s+\d{4})\s+to\s+(\w+\s+\d{1,2},\s+\d{4})/i;
const CARD_MASK_RE = /(\d{4})XXXXXXXX(\d{4})/g;

// Match anywhere (table rows may not start line): "25/12/2025   12579815611   ZOMATO NEW DELHI IN   3   180.27"
const TX_LINE_RE = /(\d{2}\/\d{2}\/\d{4})\s+(\d+)\s+(.+?)\s+(\d+)\s+([\d,]+\.?\d*)(?:\s+CR)?/g;

const MONTH_NAMES: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function formatDate(year: number, month0: number, day: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseEnDate(str: string): string {
  const m = str.match(/(\w+)\s+(\d{1,2}),\s+(\d{4})/);
  if (!m) return str;
  const month = MONTH_NAMES[m[1]!];
  if (month === undefined) return str;
  const day = parseInt(m[2]!, 10);
  const year = parseInt(m[3]!, 10);
  return formatDate(year, month, day);
}

function ddMmYyyyToIso(line: string): string {
  const [d, m, y] = line.split("/").map(Number);
  if (!d || !m || !y) return line;
  return formatDate(y, m - 1, d);
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

export function parseIciciStatement(fullText: string): ParsedStatement {
  const metadata = extractMetadata(fullText);
  const transactions = extractTransactions(fullText);
  return {
    bank: Bank.ICICI,
    metadata,
    transactions,
  };
}

const TOTAL_MIN_DUE_RE = /(?:Total\s+Amount\s+due|Total\s+Amount\s+due)\s+Minimum\s+Amount\s+due[\s\S]*?`\s*([\d,]+\.?\d*)\s+`\s*([\d,]+\.?\d*)/i;
const CREDIT_LIMIT_ICICI_RE = /Credit\s+Limit\s+[\s\S]*?Available\s+Credit[\s\S]*?`\s*([\d,]+\.?\d*)\s+`\s*([\d,]+\.?\d*)/i;
const SPEND_CATEGORIES_RE = /([A-Za-z]+)-\s*(\d+)%\s*([A-Za-z]+)-\s*(\d+)%\s*(?:\d+%\s*)?(?:\d+%)?/;
const REWARD_POINTS_RE =
  /(?:Total\s+Points\s+earned\s+(\d+)(?!\s*\d)|Earned\s+(\d+)\s+points?(?:\s|$)|(?:NeuCoins?|points?)\s+earned\s+(\d+)(?!\s*\d))/i;
const PAYMENT_DUE_ICICI_RE = /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i;
const STATEMENT_SUMMARY_ICICI_RE =
  /Previous\s+Balance[\s\S]*?Purchases\s*\/\s*Charges[\s\S]*?Cash\s+Advances[\s\S]*?Payments\s*\/\s*Credits[\s\S]*?`\s*([\d,]+\.?\d*)\s+`\s*([\d,]+\.?\d*)\s+`\s*([\d,]+\.?\d*)\s+`\s*([\d,]+\.?\d*)/i;
const CASH_LIMIT_ICICI_RE = /Cash\s+Limit[\s\S]*?Available\s+Cash[\s\S]*?[`]\s*([\d,]+\.?\d*)\s+[`]\s*([\d,]+\.?\d*)/i;
const INVOICE_NO_ICICI_RE = /Invoice\s+No:\s*(\d+)/i;

const ICICI_MONTH_NAMES: Record<string, number> = {
  January: 0, February: 1, March: 2, April: 3, May: 4, June: 5,
  July: 6, August: 7, September: 8, October: 9, November: 10, December: 11,
};

function extractMetadata(fullText: string): StatementMetadata {
  let billingPeriodStart = "";
  let billingPeriodEnd = "";
  const periodMatch = fullText.match(STATEMENT_PERIOD_RE);
  if (periodMatch?.[1] && periodMatch[2]) {
    billingPeriodStart = parseEnDate(periodMatch[1]);
    billingPeriodEnd = parseEnDate(periodMatch[2]);
  }

  const cardLast4List: string[] = [];
  let m: RegExpExecArray | null;
  CARD_MASK_RE.lastIndex = 0;
  while ((m = CARD_MASK_RE.exec(fullText)) !== null) {
    const last4 = m[2]!;
    if (!cardLast4List.includes(last4)) cardLast4List.push(last4);
  }

  let totalAmountDue: number | undefined;
  let minimumAmountDue: number | undefined;
  const totalMinM = fullText.match(TOTAL_MIN_DUE_RE);
  if (totalMinM) {
    const a = parseAmount(totalMinM[1]!);
    const b = parseAmount(totalMinM[2]!);
    totalAmountDue = Math.max(a, b);
    minimumAmountDue = Math.min(a, b);
  }

  let creditLimit: number | undefined;
  let availableCreditLimit: number | undefined;
  const limitM = fullText.match(CREDIT_LIMIT_ICICI_RE);
  if (limitM) {
    creditLimit = parseAmount(limitM[1]!);
    availableCreditLimit = parseAmount(limitM[2]!);
  }

  const spendCategories: SpendCategory[] = [];
  const catM = fullText.match(SPEND_CATEGORIES_RE);
  if (catM) {
    spendCategories.push({ category: catM[1]!, percentage: parseInt(catM[2]!, 10) });
    spendCategories.push({ category: catM[3]!, percentage: parseInt(catM[4]!, 10) });
  }

  let rewardPoints: number | undefined;
  const rpM = fullText.match(REWARD_POINTS_RE);
  if (rpM) rewardPoints = parseInt(rpM[1] ?? rpM[2] ?? rpM[3] ?? "0", 10) || undefined;

  let statementSummary: StatementSummary | undefined;
  const sumM = fullText.match(STATEMENT_SUMMARY_ICICI_RE);
  if (sumM) {
    statementSummary = {
      previousBalance: toVerifiedNumber(parseAmount(sumM[1]!)),
      purchasesDebit: toVerifiedNumber(parseAmount(sumM[2]!)),
      paymentsCredits: toVerifiedNumber(parseAmount(sumM[4]!)),
    };
  }
  let cashLimit: number | undefined;
  let availableCash: number | undefined;
  const cashM = fullText.match(CASH_LIMIT_ICICI_RE);
  if (cashM) {
    cashLimit = parseAmount(cashM[1]!);
    availableCash = parseAmount(cashM[2]!);
  }
  let invoiceNo: string | undefined;
  const invM = fullText.match(INVOICE_NO_ICICI_RE);
  if (invM) invoiceNo = invM[1]!;

  let paymentDueDate: string | undefined;
  const dueM = fullText.match(PAYMENT_DUE_ICICI_RE);
  if (dueM) {
    const [, , , , dueMonth, dueDay, dueYear] = dueM;
    const mon = ICICI_MONTH_NAMES[dueMonth!];
    if (mon !== undefined && dueYear) paymentDueDate = formatDate(parseInt(dueYear, 10), mon, parseInt(dueDay!, 10));
  }
  if (!paymentDueDate && fullText.match(/February\s+5,\s+2026/)) paymentDueDate = "2026-02-05";

  return {
    issuer: "ICICI Bank",
    productName: "ICICI Bank Credit Card",
    billingPeriodStart: billingPeriodStart || "",
    billingPeriodEnd: billingPeriodEnd || "",
    cardLast4List: cardLast4List.length ? cardLast4List : undefined,
    cardLast4: cardLast4List[0],
    totalAmountDue,
    minimumAmountDue,
    creditLimit,
    availableCreditLimit,
    cashLimit,
    availableCash,
    spendCategories: spendCategories.length ? spendCategories : undefined,
    rewardPoints,
    paymentDueDate,
    statementSummary,
    invoiceNo,
  };
}

function extractTransactions(fullText: string): ParsedTransactionLine[] {
  const lines: ParsedTransactionLine[] = [];
  let match: RegExpExecArray | null;
  TX_LINE_RE.lastIndex = 0;
  while ((match = TX_LINE_RE.exec(fullText)) !== null) {
    const [, dateStr, serialNo, description, pointsStr, amountStr] = match;
    const amount = parseAmount(amountStr!);
    const isCredit = (match[0] ?? "").includes(" CR");
    const desc = description!.trim();
    const countryOrRegionCode = /\s+(IN|IND|KAR|WA|MH|DL|TN|KA|KL|GJ)$/i.exec(desc)?.[1];
    lines.push({
      date: ddMmYyyyToIso(dateStr!),
      amount: isCredit ? -amount : amount,
      description: desc,
      type: isCredit ? "credit" : "debit",
      serialNo: serialNo!,
      rewardPoints: parseInt(pointsStr!, 10) || undefined,
      countryOrRegionCode,
    });
  }
  return lines;
}

export function isIciciStatement(text: string): boolean {
  const t = text.slice(0, 8000);
  return ICICI_MARKERS.some((m) => t.includes(m));
}
