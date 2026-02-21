import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { rowToCardVariant } from "@finmatter/backend";
import type { CatalogRow } from "@finmatter/backend";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.",
      },
      { status: 503 }
    );
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing id." },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("card_variants")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return NextResponse.json({ error: "Card variant not found." }, { status: 404 });
    }
    return NextResponse.json(
      { error: "Failed to fetch card variant.", message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    variant: rowToCardVariant(data as CatalogRow),
  });
}
