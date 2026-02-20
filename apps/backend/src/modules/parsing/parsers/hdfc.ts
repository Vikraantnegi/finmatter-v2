/**
 * HDFC Bank credit card statement parser.
 * Format: Billing Period "18 Dec, 2025 - 17 Jan, 2026"; Statement Date "17 Jan, 2026";
 * transaction lines "DD/MM/YYYY| HH:MM   description   [+ ]C   amount".
 */

import type {
  CashbackOrRewardLine,
  DuesSummary,
  ParsedStatement,
  StatementMetadata,
  ParsedTransactionLine,
  SpendCategory,
  StatementSummary,
} from "../parsing.types";
import { Bank, toVerifiedNumber } from "../parsing.types";

const HDFC_MARKERS = ["HDFC Bank", "hdfcbank.com", "HDFC Bank Credit Card", "HDFC Bank Cards"];

const BILLING_PERIOD_RE = /(\d{1,2}\s+\w+,\s+\d{4})\s*-\s*(\d{1,2}\s+\w+,\s+\d{4})/;
const STATEMENT_DATE_RE = /Statement\s+Date\s+(\d{1,2}\s+\w+,\s+\d{4})/i;
const CARD_RE = /(\d{4})\d+X+(\d{4})/g;
// Match "18/12/2025| 00:00   description   C   33.50" (optional + before C for credit); no $ so trailing " l " allowed
const TX_LINE_RE = /(\d{2}\/\d{2}\/\d{4})\|\s*\d{2}:\d{2}\s+(.+?)\s+([+]?\s*)?C\s+([\d,]+\.?\d*)/gm;

const MONTH_NAMES: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function formatDate(year: number, month0: number, day: number): string {
  return `${year}-${String(month0 + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseDdMmmYyyy(str: string): string {
  const m = str.trim().match(/(\d{1,2})\s+(\w+),\s+(\d{4})/);
  if (!m) return "";
  const [, day, monthStr, yearStr] = m;
  const month = MONTH_NAMES[monthStr!.slice(0, 3)];
  if (month === undefined) return "";
  return formatDate(parseInt(yearStr!, 10), month, parseInt(day!, 10));
}

function ddMmYyyyToIso(line: string): string {
  const [d, m, y] = line.split("/").map(Number);
  if (!d || !m || !y) return line;
  return formatDate(y, m - 1, d);
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/,/g, "")) || 0;
}

export function parseHdfcStatement(fullText: string): ParsedStatement {
  const metadata = extractMetadata(fullText);
  const transactions = extractTransactions(fullText);
  return {
    bank: Bank.HDFC,
    metadata,
    transactions,
  };
}

const CARD_NAME_HDFC_RE = /Benefits on your card\s+(.+?)\s+(?:Statement\s+)?HDFC\s+Bank\s+Credit\s+Card/i;
const TOTAL_MIN_DUE_HDFC_RE = /TOTAL\s+AMOUNT\s+DUE\s+[C\s]+([\d,]+\.?\d*)\s+MINIMUM\s+DUE\s+[C\s]+([\d,]+\.?\d*)\s+DUE\s+DATE\s+(\d{1,2})\s+(\w+),\s+(\d{4})/i;
const CREDIT_LIMIT_HDFC_RE = /TOTAL\s+CREDIT\s+LIMIT[\s\S]*?[C\s]+([\d,]+\.?\d*)\s+[C\s]+([\d,]+\.?\d*)/i;
// All PI categories: take section after "Purchase Indicator / Insights", then match WORD NN%
const PI_CATEGORY_RE = /\b([A-Z][A-Za-z]+)\s+(\d+)%/g;
const REWARD_POINTS_HDFC_RE = /Reward\s+Points\s+([\d,]+)/i;
const NEUCOINS_RE = /(?:Opening|Closing)\s+NeuCoins[\s\S]*?(\d+)\s+(\d+)/i;
const STATEMENT_SUMMARY_HDFC_RE =
  /PREVIOUS\s+STATEMENT\s+DUES[\s\S]*?PAYMENTS\/CREDITS\s+RECEIVED[\s\S]*?PURCHASES\/DEBIT[\s\S]*?FINANCE\s+CHARGES[\s\S]*?[C\s]+([\d,]+\.?\d*)\s+[C\s]+([\d,]+\.?\d*)\s+[C\s]+([\d,]+\.?\d*)\s+[C\s]+([\d,]+\.?\d*)/i;
const AVAILABLE_CASH_HDFC_RE = /AVAILABLE\s+CASH\s+LIMIT[\s\S]*?[C\s]+([\d,]+\.?\d*)/i;
const DUES_SUMMARY_HDFC_RE =
  /Past\s+Dues[\s\S]*?OVER\s+LIMIT[\s\S]*?[C\s]+([\d,]+\.?\d*)[\s\S]*?CURRENT\s+DUES[\s\S]*?[C\s]+([\d,]+\.?\d*)[\s\S]*?MINIMUM\s+DUES[\s\S]*?[C\s]+([\d,]+\.?\d*)/i;
const CASHBACK_LINE_RE = /(\d+)\s+([\d.]+%\s+[A-Za-z\s]+Cashback[^C]*)\s+C\s+([\d,]+\.?\d*)/gi;
const POINTS_EXPIRING_30_RE = /(\d+)\s+points?\s+expiring\s+in\s+30\s+days/i;
const POINTS_EXPIRING_60_RE = /(\d+)\s+points?\s+expiring\s+in\s+60\s+days/i;
const PAYMENT_REF_RE = /Ref#\s+([A-Z0-9]+)/i;

function extractMetadata(fullText: string): StatementMetadata {
  let billingPeriodStart = "";
  let billingPeriodEnd = "";
  const bp = fullText.match(BILLING_PERIOD_RE);
  if (bp) {
    billingPeriodStart = parseDdMmmYyyy(bp[1]!);
    billingPeriodEnd = parseDdMmmYyyy(bp[2]!);
  }
  const sd = fullText.match(STATEMENT_DATE_RE);
  const statementDate = sd ? parseDdMmmYyyy(sd[1]!) : undefined;

  const cardLast4List: string[] = [];
  let m: RegExpExecArray | null;
  CARD_RE.lastIndex = 0;
  while ((m = CARD_RE.exec(fullText)) !== null) {
    const last4 = m[2]!;
    if (!cardLast4List.includes(last4)) cardLast4List.push(last4);
  }

  let cardName: string | undefined;
  const cardNameM = fullText.match(CARD_NAME_HDFC_RE);
  if (cardNameM) {
    const raw = cardNameM[1]!.trim();
    cardName = raw.replace(/\s+Statement\s+.*$/i, "").replace(/\s+HSN\s+Code.*$/i, "").trim() + " HDFC Bank Credit Card";
  }

  let totalAmountDue: number | undefined;
  let minimumAmountDue: number | undefined;
  let paymentDueDate: string | undefined;
  const totalMinM = fullText.match(TOTAL_MIN_DUE_HDFC_RE);
  if (totalMinM) {
    totalAmountDue = parseAmount(totalMinM[1]!);
    minimumAmountDue = parseAmount(totalMinM[2]!);
    const day = parseInt(totalMinM[3]!, 10);
    const monthStr = totalMinM[4]!.slice(0, 3);
    const month = MONTH_NAMES[monthStr];
    if (month !== undefined) paymentDueDate = formatDate(parseInt(totalMinM[5]!, 10), month, day);
  }

  let creditLimit: number | undefined;
  let availableCreditLimit: number | undefined;
  const limitM = fullText.match(CREDIT_LIMIT_HDFC_RE);
  if (limitM) {
    creditLimit = parseAmount(limitM[1]!);
    availableCreditLimit = parseAmount(limitM[2]!);
  }

  const spendCategories: SpendCategory[] = [];
  const piSection = fullText.match(/Purchase\s+Indicator\s*\/\s*Insights([\s\S]*?)(?=IMPORTANT|$)/i)?.[1] ?? "";
  let pm: RegExpExecArray | null;
  PI_CATEGORY_RE.lastIndex = 0;
  while ((pm = PI_CATEGORY_RE.exec(piSection)) !== null) {
    spendCategories.push({ category: pm[1]!.trim(), percentage: parseInt(pm[2]!, 10) });
  }
  const insights = spendCategories.map((c) => `${c.category} ${c.percentage}%`);

  let statementSummary: StatementSummary | undefined;
  const sumM = fullText.match(STATEMENT_SUMMARY_HDFC_RE);
  if (sumM) {
    statementSummary = {
      previousBalance: toVerifiedNumber(parseAmount(sumM[1]!)),
      paymentsCredits: toVerifiedNumber(parseAmount(sumM[2]!)),
      purchasesDebit: toVerifiedNumber(parseAmount(sumM[3]!)),
      financeCharges: toVerifiedNumber(parseAmount(sumM[4]!)),
    };
  }
  let availableCash: number | undefined;
  const cashM = fullText.match(AVAILABLE_CASH_HDFC_RE);
  if (cashM) availableCash = parseAmount(cashM[1]!);
  let duesSummary: DuesSummary | undefined;
  const duesM = fullText.match(DUES_SUMMARY_HDFC_RE);
  if (duesM) {
    duesSummary = {
      pastDuesOverLimit: parseAmount(duesM[1]!),
      currentDues: parseAmount(duesM[2]!),
      minimumDues: parseAmount(duesM[3]!),
    };
  }
  const cashbackOrRewardLines: CashbackOrRewardLine[] = [];
  CASHBACK_LINE_RE.lastIndex = 0;
  while ((m = CASHBACK_LINE_RE.exec(fullText)) !== null) {
    cashbackOrRewardLines.push({
      description: m[2]!.trim(),
      amount: toVerifiedNumber(parseAmount(m[3]!)),
    });
  }
  let pointsExpiringIn30Days: number | undefined;
  const exp30 = fullText.match(POINTS_EXPIRING_30_RE);
  if (exp30) pointsExpiringIn30Days = parseInt(exp30[1]!, 10);
  let pointsExpiringIn60Days: number | undefined;
  const exp60 = fullText.match(POINTS_EXPIRING_60_RE);
  if (exp60) pointsExpiringIn60Days = parseInt(exp60[1]!, 10);

  let rewardPoints: number | undefined;
  const rpM = fullText.match(REWARD_POINTS_HDFC_RE);
  if (rpM) rewardPoints = parseAmount(rpM[1]!);
  const neuM = fullText.match(NEUCOINS_RE);
  if (neuM && rewardPoints === undefined) rewardPoints = parseInt(neuM[1]!, 10) || parseInt(neuM[2]!, 10);

  return {
    issuer: "HDFC Bank",
    productName: "HDFC Bank Credit Card",
    cardName,
    billingPeriodStart: billingPeriodStart || "",
    billingPeriodEnd: billingPeriodEnd || "",
    statementDate: statementDate || undefined,
    cardLast4: cardLast4List[0],
    cardLast4List: cardLast4List.length ? cardLast4List : undefined,
    totalAmountDue,
    minimumAmountDue,
    paymentDueDate,
    creditLimit,
    availableCreditLimit,
    availableCash,
    spendCategories: spendCategories.length ? spendCategories : undefined,
    insights: insights.length ? insights : undefined,
    rewardPoints,
    statementSummary,
    duesSummary,
    cashbackOrRewardLines: cashbackOrRewardLines.length ? cashbackOrRewardLines : undefined,
    pointsExpiringIn30Days,
    pointsExpiringIn60Days,
  };
}

function extractTransactions(fullText: string): ParsedTransactionLine[] {
  const lines: ParsedTransactionLine[] = [];
  let match: RegExpExecArray | null;
  TX_LINE_RE.lastIndex = 0;
  while ((match = TX_LINE_RE.exec(fullText)) !== null) {
    const [, dateStr, description, plusSign, amountStr] = match;
    const isCredit = (plusSign ?? "").includes("+");
    const amount = parseAmount(amountStr!);
    const desc = description!.trim();
    PAYMENT_REF_RE.lastIndex = 0;
    const paymentRef = PAYMENT_REF_RE.exec(desc)?.[1];
    lines.push({
      date: ddMmYyyyToIso(dateStr!),
      amount: isCredit ? -amount : amount,
      description: desc,
      type: isCredit ? "credit" : "debit",
      paymentRef,
    });
  }
  return lines;
}

export function isHdfcStatement(text: string): boolean {
  const t = text.slice(0, 8000);
  return HDFC_MARKERS.some((m) => t.includes(m));
}
