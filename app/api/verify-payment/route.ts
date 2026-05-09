import { NextRequest, NextResponse } from "next/server";
import { Connection, clusterApiUrl } from "@solana/web3.js";
import {
  USDC_MINT,
  RECEIVER_WALLET,
  USDC_TRANSFER_AMOUNT,
} from "@/app/lib/solana/constants";

const MAX_TX_AGE_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { txSignature, performerWallet } = await req.json();

    if (!txSignature || !performerWallet) {
      return NextResponse.json(
        { error: "Missing txSignature or performerWallet" },
        { status: 400 }
      );
    }

    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");
    const connection = new Connection(rpcUrl, "confirmed");

    const tx = await connection.getParsedTransaction(txSignature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const blockTime = tx.blockTime ? tx.blockTime * 1000 : 0;
    if (Date.now() - blockTime > MAX_TX_AGE_MS) {
      return NextResponse.json({ error: "Transaction too old" }, { status: 400 });
    }

    const instructions = tx.transaction.message.instructions;
    let validTransfer = false;

    for (const ix of instructions) {
      if (!("parsed" in ix)) continue;
      const parsed = ix.parsed;
      if (parsed?.type !== "transferChecked") continue;

      const info = parsed.info;
      const mintMatches = info.mint === USDC_MINT.toBase58();
      const receiverMatches = info.destination === (await getReceiverAta());
      const amountMatches = BigInt(info.tokenAmount?.amount ?? "0") === USDC_TRANSFER_AMOUNT;
      const senderMatches = info.authority === performerWallet;

      if (mintMatches && receiverMatches && amountMatches && senderMatches) {
        validTransfer = true;
        break;
      }
    }

    if (!validTransfer) {
      return NextResponse.json(
        { error: "Invalid or insufficient USDC transfer" },
        { status: 400 }
      );
    }

    return NextResponse.json({ ok: true, blockTime: tx.blockTime });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

let _receiverAta: string | null = null;
async function getReceiverAta(): Promise<string> {
  if (_receiverAta) return _receiverAta;
  const { getAssociatedTokenAddress } = await import("@solana/spl-token");
  const ata = await getAssociatedTokenAddress(USDC_MINT, RECEIVER_WALLET);
  _receiverAta = ata.toBase58();
  return _receiverAta;
}
