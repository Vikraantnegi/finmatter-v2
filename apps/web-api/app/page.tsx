import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 py-16 px-6">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          FinMatter
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          Credit-card–first personal finance for India. Backend API + minimal dashboard for testing.
        </p>
        <Link
          href="/dashboard"
          className="rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 text-sm font-medium hover:opacity-90"
        >
          Open statement test dashboard
        </Link>
      </main>
    </div>
  );
}
