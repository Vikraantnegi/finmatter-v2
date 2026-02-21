import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { rowToCardVariant } from "@finmatter/backend";
import type { CatalogRow } from "@finmatter/backend";

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      },
      { status: 503 }
    );
  }

  const { data, error } = await supabase
    .from("card_variants")
    .select("*")
    .order("family", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch catalog.", message: error.message },
      { status: 500 }
    );
  }

  const variants = (data ?? []).map((row) =>
    rowToCardVariant(row as CatalogRow)
  );

  return NextResponse.json({ variants });
}
