import { NextRequest, NextResponse } from "next/server";
import { uploadToArweave } from "@/app/lib/arweave/upload";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ARWEAVE_WALLET_KEY) {
      return NextResponse.json({ error: "Arweave not configured" }, { status: 503 });
    }

    const formData = await req.formData();
    const file = formData.get("audio") as File | null;
    const requestId = formData.get("requestId") as string | null;
    const performerWallet = formData.get("performerWallet") as string | null;
    const audioSha256 = formData.get("audioSha256") as string | null;

    if (!file || !requestId || !performerWallet || !audioSha256) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "audio/webm";

    const { txId, url } = await uploadToArweave(buffer, mimeType, {
      "Request-ID": requestId,
      "Performer-Wallet": performerWallet,
      "Audio-SHA256": audioSha256,
    });

    return NextResponse.json({ txId, url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
