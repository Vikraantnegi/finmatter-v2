"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type CanonicalTransactionRow = {
  canonical_key: string;
  id: string;
  date: string;
  amount: number;
  currency: string;
  merchant: { raw: string; normalized: string; merchantCategory: string };
  type: string;
  description: string;
  confidence_score: number;
  parse_method: string;
  spend_category: string;
};

function formatNum(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "—";
}

export default function ValidationPage() {
  const [transactions, setTransactions] = useState<CanonicalTransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lowConfidenceOnly, setLowConfidenceOnly] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const params = lowConfidenceOnly ? "?lowConfidence=true" : "";
    fetch(`/api/canonical-transactions${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setTransactions(data.transactions ?? []);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lowConfidenceOnly]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            ← Dashboard
          </Link>
        </div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
          Canonical transactions (validation)
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2">
          Internal view: confidence, parse method (rule vs no rule), merchant, spend category. No reward display.
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
          Confidence: 1.0 = deterministic rule hit · 0.5 = unmatched, unverified (v1: no AI used).
        </p>

        <div className="mb-4 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={lowConfidenceOnly}
              onChange={(e) => setLowConfidenceOnly(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-600"
            />
            Low confidence only (score &lt; 1)
          </label>
        </div>

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm mb-4">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Loading…</p>
        ) : (
          <div className="overflow-x-auto rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100/80 dark:bg-zinc-800/80">
                  <th className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">Date</th>
                  <th className="text-right py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">Amount</th>
                  <th className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">Merchant</th>
                  <th className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">Category</th>
                  <th className="text-center py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">Confidence</th>
                  <th className="text-left py-2 px-3 font-medium text-zinc-700 dark:text-zinc-300">Method</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 px-3 text-center text-zinc-500 dark:text-zinc-400">
                      No canonical transactions yet. Parse a statement from the dashboard to populate.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr
                      key={tx.canonical_key}
                      className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100">{tx.date || "—"}</td>
                      <td className="py-2 px-3 text-right font-mono text-zinc-900 dark:text-zinc-100">
                        {formatNum(tx.amount)} {tx.currency}
                      </td>
                      <td className="py-2 px-3 text-zinc-900 dark:text-zinc-100">
                        {tx.merchant?.normalized ?? tx.description ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">{tx.spend_category ?? "—"}</td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={
                            tx.confidence_score < 1
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-zinc-700 dark:text-zinc-300"
                          }
                        >
                          {typeof tx.confidence_score === "number"
                            ? tx.confidence_score.toFixed(2)
                            : "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-zinc-700 dark:text-zinc-300">
                        {tx.parse_method === "rule"
                          ? "RULE"
                          : tx.parse_method === "ai"
                            ? "AI"
                            : tx.parse_method === "unknown"
                              ? "No rule"
                              : tx.parse_method ?? "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
          {transactions.length} row{transactions.length !== 1 ? "s" : ""}
          {lowConfidenceOnly ? " (low confidence only)" : ""}
        </p>
      </div>
    </div>
  );
}
