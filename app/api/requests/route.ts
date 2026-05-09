import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = createServiceClient();
  const wallet = req.nextUrl.searchParams.get("wallet");

  let query = supabase
    .from("requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (wallet) {
    query = query.eq("requester_wallet", wallet);
  } else {
    query = query.eq("status", "open");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { beneficiary_name, reason, special_requests, requester_wallet } = body;

  if (!beneficiary_name || !reason || !requester_wallet) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("requests")
    .insert({ beneficiary_name, reason, special_requests, requester_wallet })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
