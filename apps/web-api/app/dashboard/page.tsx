"use client";

import { useState } from "react";
import Link from "next/link";

type Result =
  | {
      success: true;
      id?: string;
      fullText: string;
      pageCount: number;
      extractionMethod: string;
      duplicate?: boolean;
      parsed?: boolean;
      bank?: string;
      canonicalCount?: number;
      parseError?: string;
      parseMessage?: string;
    }
  | { success: false; error: string; message?: string };

// Optional extractions (mirrors backend parsing.types when present)
type VerifiedNumber = { value: number; source: string; confidence: number };
type StatementSummary = {
  previousBalance?: number | VerifiedNumber;
  paymentsCredits?: number | VerifiedNumber;
  purchasesDebit?: number | VerifiedNumber;
  financeCharges?: number | VerifiedNumber;
};
type DuesSummary = { pastDuesOverLimit?: number; currentDues?: number; minimumDues?: number };
type SpendCategory = { category: string; percentage?: number; amount?: number };
type CashbackOrRewardLine = { description: string; amount: number | VerifiedNumber };

type ParseMetadata = {
  issuer: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  statementDate?: string;
  cardLast4?: string;
  cardLast4List?: string[];
  cardName?: string;
  totalAmountDue?: number;
  minimumAmountDue?: number;
  paymentDueDate?: string;
  creditLimit?: number;
  availableCreditLimit?: number;
  cashLimit?: number;
  availableCash?: number;
  spendCategories?: SpendCategory[];
  insights?: string[];
  rewardPoints?: number;
  statementSummary?: StatementSummary;
  duesSummary?: DuesSummary;
  interestRatesDisplay?: string | { goodsAndServices?: number; cash?: number };
  cashbackOrRewardLines?: CashbackOrRewardLine[];
  pointsExpiringIn30Days?: number;
  pointsExpiringIn60Days?: number;
  invoiceNo?: string;
};

type ParseTransaction = {
  date: string;
  amount: number;
  description: string;
  type?: string;
  serialNo?: string;
  rewardPoints?: number;
  countryOrRegionCode?: string;
  paymentRef?: string;
};

type ParseResult = {
  success: true;
  bank: string;
  metadata: ParseMetadata;
  transactions: ParseTransaction[];
  rawTransactions: unknown[];
};

function formatNum(n: number | undefined | null): string {
  if (n == null) return "—";
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—";
}
function numVal(n: number | VerifiedNumber | undefined | null): number | undefined {
  if (n == null) return undefined;
  return typeof n === "number" ? n : n.value;
}
function hasAny(obj: Record<string, unknown>): boolean {
  return Object.values(obj).some((v) => v != null && (typeof v !== "number" || Number.isFinite(v)));
}

const DashboardPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [autoParse, setAutoParse] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | { success: false; error: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setParseResult(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      if (password.trim()) formData.set("password", password.trim());
      const url = autoParse ? "/api/statements/upload?autoParse=true" : "/api/statements/upload";
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({ success: false, error: data.error || res.statusText });
        return;
      }
      if (data.success) {
        setResult({
          success: true,
          id: data.id,
          fullText: data.fullText ?? "",
          pageCount: data.pageCount ?? 0,
          extractionMethod: data.extractionMethod ?? "pdfjs",
          duplicate: data.duplicate,
          parsed: data.parsed,
          bank: data.bank,
          canonicalCount: data.canonicalCount,
          parseError: data.parseError,
          parseMessage: data.parseMessage,
        });
        if (data.parsed === true && data.bank != null) {
          setParseResult({
            success: true,
            bank: data.bank,
            metadata: data.metadata ?? {},
            transactions: data.transactions ?? [],
            rawTransactions: data.rawTransactions ?? [],
          });
        } else if (data.parsed === false && (data.parseError || data.parseMessage)) {
          setParseResult({
            success: false,
            error: data.parseMessage ?? data.parseError ?? "Parse failed",
          });
        }
      } else {
        setResult({
          success: false,
          error: data.error || "Extraction failed.",
          message: data.message,
        });
      }
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : "Request failed.",
      });
    } finally {
      setLoading(false);
    }
  }

  const handleParse = async () => {
    if (!result?.success || !result.id) return;
    setParseLoading(true);
    setParseResult(null);
    try {
      const res = await fetch(`/api/statements/${result.id}/parse`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setParseResult({ success: false, error: data.error || data.message || res.statusText });
        return;
      }
      setParseResult({
        success: true,
        bank: data.bank,
        metadata: data.metadata ?? {},
        transactions: data.transactions ?? [],
        rawTransactions: data.rawTransactions ?? [],
      });
    } catch (err) {
      setParseResult({ success: false, error: err instanceof Error ? err.message : "Parse failed." });
    } finally {
      setParseLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 font-sans">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          FinMatter — Statement test
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
          Upload a PDF statement (optional password for encrypted files). Raw PDF is stored; text is extracted and shown below.
        </p>
        <p className="text-sm mb-8">
          <Link
            href="/dashboard/validation"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
          >
            View canonical transactions (validation)
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              PDF file
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-900 dark:text-zinc-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-zinc-200 dark:file:bg-zinc-700 file:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Password (optional, for encrypted PDFs)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank if not encrypted"
              className="w-full rounded border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="autoParse"
              checked={autoParse}
              onChange={(e) => setAutoParse(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            <label htmlFor="autoParse" className="text-sm text-zinc-700 dark:text-zinc-300">
              Parse automatically after upload (extract → parse → canonical transactions in one step)
            </label>
          </div>
          <button
            type="submit"
            disabled={!file || loading}
            className="rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Uploading & extracting…" : "Upload & extract"}
          </button>
        </form>

        {result && (
          <section className="rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              Result
            </h2>
            {result.success ? (
              <>
                {result.duplicate && (
                  <p className="text-amber-600 dark:text-amber-400 text-sm mb-2">
                    Duplicate file (same hash); showing stored result.
                  </p>
                )}
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Pages: {result.pageCount} · Method: {result.extractionMethod}
                  {result.parsed === true && result.canonicalCount != null && (
                    <span className="text-green-600 dark:text-green-400 ml-1">
                      · Parsed automatically: {result.canonicalCount} canonical transactions
                      {result.bank && ` · Bank: ${result.bank}`}
                    </span>
                  )}
                  {result.parsed === false && (result.parseError || result.parseMessage) && (
                    <span className="text-amber-600 dark:text-amber-400 ml-1">
                      · Parse failed: {result.parseMessage ?? result.parseError}
                    </span>
                  )}
                  {result.id && !result.parsed && (
                    <>
                      {" · "}
                      <button
                        type="button"
                        onClick={handleParse}
                        disabled={parseLoading}
                        className="underline text-zinc-700 dark:text-zinc-300 disabled:opacity-50"
                      >
                        {parseLoading ? "Parsing…" : "Parse statement (Step 2)"}
                      </button>
                    </>
                  )}
                </p>
                {parseResult && (
                  <div className="mt-3 p-3 rounded bg-zinc-100 dark:bg-zinc-800 text-sm space-y-3">
                    {parseResult.success ? (
                      <>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          Bank: {parseResult.bank} · {parseResult.transactions.length} transactions
                        </p>
                        {parseResult.metadata.billingPeriodStart && (
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                            Billing: {parseResult.metadata.billingPeriodStart} → {parseResult.metadata.billingPeriodEnd}
                            {parseResult.metadata.cardLast4List?.length ? ` · Cards: ${parseResult.metadata.cardLast4List.join(", ")}` : ""}
                          </p>
                        )}
                        {parseResult.metadata.cardName && (
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs">Card: {parseResult.metadata.cardName}</p>
                        )}
                        {(parseResult.metadata.totalAmountDue != null || parseResult.metadata.minimumAmountDue != null) && (
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                            Total due: {formatNum(parseResult.metadata.totalAmountDue)} · Min due: {formatNum(parseResult.metadata.minimumAmountDue)}
                            {parseResult.metadata.paymentDueDate && ` · Due ${parseResult.metadata.paymentDueDate}`}
                          </p>
                        )}
                        {(parseResult.metadata.creditLimit != null || parseResult.metadata.availableCreditLimit != null) && (
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                            Credit limit: {formatNum(parseResult.metadata.creditLimit)} · Available: {formatNum(parseResult.metadata.availableCreditLimit)}
                          </p>
                        )}
                        {(parseResult.metadata.cashLimit != null || parseResult.metadata.availableCash != null) && (
                          <p className="text-zinc-600 dark:text-zinc-400 text-xs">
                            Cash limit: {formatNum(parseResult.metadata.cashLimit)} · Available cash: {formatNum(parseResult.metadata.availableCash)}
                          </p>
                        )}
                        {parseResult.metadata.statementSummary && hasAny(parseResult.metadata.statementSummary as Record<string, unknown>) && (
                          <div className="text-xs">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Statement summary</span>
                            <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                              Previous: {formatNum(numVal(parseResult.metadata.statementSummary.previousBalance))} · Payments: {formatNum(numVal(parseResult.metadata.statementSummary.paymentsCredits))} · Purchases: {formatNum(numVal(parseResult.metadata.statementSummary.purchasesDebit))} · Finance charges: {formatNum(numVal(parseResult.metadata.statementSummary.financeCharges))}
                            </p>
                          </div>
                        )}
                        {parseResult.metadata.duesSummary && hasAny(parseResult.metadata.duesSummary as Record<string, unknown>) && (
                          <div className="text-xs">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Dues</span>
                            <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                              Past/over limit: {formatNum(parseResult.metadata.duesSummary.pastDuesOverLimit)} · Current: {formatNum(parseResult.metadata.duesSummary.currentDues)} · Min: {formatNum(parseResult.metadata.duesSummary.minimumDues)}
                            </p>
                          </div>
                        )}
                        {parseResult.metadata.interestRatesDisplay != null && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Interest (display)</span>{" "}
                            {typeof parseResult.metadata.interestRatesDisplay === "string"
                              ? parseResult.metadata.interestRatesDisplay
                              : [
                                  parseResult.metadata.interestRatesDisplay.goodsAndServices != null && `${parseResult.metadata.interestRatesDisplay.goodsAndServices}% goods/svc`,
                                  parseResult.metadata.interestRatesDisplay.cash != null && `${parseResult.metadata.interestRatesDisplay.cash}% cash`,
                                ]
                                  .filter(Boolean)
                                  .join(", ")}
                          </p>
                        )}
                        {parseResult.metadata.cashbackOrRewardLines && parseResult.metadata.cashbackOrRewardLines.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Cashback / rewards</span>
                            <ul className="text-zinc-600 dark:text-zinc-400 mt-0.5 list-disc list-inside">
                              {parseResult.metadata.cashbackOrRewardLines.map((line, i) => (
                                <li key={i}>{line.description}: {formatNum(numVal(line.amount))}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {(parseResult.metadata.pointsExpiringIn30Days != null || parseResult.metadata.pointsExpiringIn60Days != null) && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            Points expiring: 30 days → {formatNum(parseResult.metadata.pointsExpiringIn30Days)} · 60 days → {formatNum(parseResult.metadata.pointsExpiringIn60Days)}
                          </p>
                        )}
                        {parseResult.metadata.invoiceNo && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Invoice: {parseResult.metadata.invoiceNo}</p>
                        )}
                        {parseResult.metadata.rewardPoints != null && (
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">Reward points: {parseResult.metadata.rewardPoints}</p>
                        )}
                        {parseResult.metadata.spendCategories && parseResult.metadata.spendCategories.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-zinc-700 dark:text-zinc-300">Spend categories</span>
                            <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                              {parseResult.metadata.spendCategories.map((c) => `${c.category}${c.percentage != null ? ` ${c.percentage}%` : ""}`).join(" · ")}
                            </p>
                          </div>
                        )}
                        {parseResult.transactions.length > 0 && (() => {
                          const showOpt = parseResult.transactions.some((tx) => tx.countryOrRegionCode ?? tx.paymentRef);
                          return (
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-zinc-300 dark:border-zinc-600">
                                  <th className="text-left py-1">Date</th>
                                  <th className="text-left py-1">Description</th>
                                  <th className="text-right py-1">Amount</th>
                                  {showOpt && <th className="text-left py-1">Ref / Region</th>}
                                </tr>
                              </thead>
                              <tbody>
                                {parseResult.transactions.slice(0, 15).map((tx, i) => (
                                  <tr key={i} className="border-b border-zinc-200 dark:border-zinc-700">
                                    <td className="py-1">{tx.date}</td>
                                    <td className="py-1 truncate max-w-48">{tx.description}</td>
                                    <td className="py-1 text-right">{tx.amount}</td>
                                    {showOpt && (
                                      <td className="py-1 text-zinc-500 dark:text-zinc-400">
                                        {[tx.countryOrRegionCode, tx.paymentRef].filter(Boolean).join(" · ")}
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          );
                        })()}
                        {parseResult.transactions.length > 15 && (
                          <p className="text-zinc-500 dark:text-zinc-400 text-xs">
                            + {parseResult.transactions.length - 15} more
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-red-600 dark:text-red-400">{parseResult.error}</p>
                    )}
                  </div>
                )}
                <pre className="mt-3 p-3 rounded bg-zinc-100 dark:bg-zinc-800 text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                  {result.fullText.slice(0, 2000)}
                  {result.fullText.length > 2000 ? "\n\n…" : ""}
                </pre>
              </>
            ) : (
              <div className="text-red-600 dark:text-red-400 text-sm space-y-1">
                <p>{result.error}</p>
                {result.message && (
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs font-mono">
                    {result.message}
                  </p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
