import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/app/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    request_id,
    performer_wallet,
    latitude,
    longitude,
    gps_accuracy_meters,
    gps_timestamp,
    is_inside_haram,
    audio_sha256,
    arweave_tx_id,
    arweave_url,
    solana_block_time,
    payment_tx_sig,
  } = body;

  if (
    !request_id || !performer_wallet || latitude == null || longitude == null ||
    !gps_timestamp || !audio_sha256 || !arweave_tx_id || !arweave_url
  ) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const { data: proof, error: proofError } = await supabase
    .from("proofs")
    .insert({
      request_id,
      performer_wallet,
      latitude,
      longitude,
      gps_accuracy_meters: gps_accuracy_meters ?? null,
      gps_timestamp,
      is_inside_haram: is_inside_haram ?? false,
      audio_sha256,
      arweave_tx_id,
      arweave_url,
      solana_block_time: solana_block_time ?? null,
      payment_tx_sig: payment_tx_sig ?? null,
    })
    .select("id")
    .single();

  if (proofError) {
    return NextResponse.json({ error: proofError.message }, { status: 500 });
  }

  // Link proof back to the request and advance status
  const { error: updateError } = await supabase
    .from("requests")
    .update({
      proof_id: proof.id,
      status: "proof_submitted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", request_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ id: proof.id }, { status: 201 });
}
