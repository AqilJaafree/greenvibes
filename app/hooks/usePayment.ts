"use client";

import { useState, useCallback, useMemo } from "react";
import { useSolanaClient, useWalletSession } from "@solana/react-hooks";
import { createSplTransferController } from "@solana/client";
import { USDC_MINT, RECEIVER_WALLET } from "@/app/lib/solana/constants";

export type PaymentStatus = "idle" | "sending" | "confirming" | "done" | "error";

export function usePayment(requestId: string) {
  const client = useSolanaClient();
  const session = useWalletSession();
  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionRef = { current: session };

  const controller = useMemo(() => {
    const helper = client.SplHelper({ mint: USDC_MINT.toBase58() });
    return createSplTransferController({
      helper,
      authorityProvider: () => sessionRef.current,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client]);

  const pay = useCallback(async () => {
    if (!session) {
      setError("Connect your wallet first.");
      return null;
    }
    setStatus("sending");
    setError(null);
    try {
      const sig = await controller.send({
        destinationOwner: RECEIVER_WALLET.toBase58(),
        amount: 1, // 1 USDC in decimal (SDK interprets as 1.000000 USDC)
      });

      setStatus("confirming");

      // Server-side verification
      const res = await fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txSignature: sig,
          performerWallet: session.account.address.toString(),
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Payment verification failed");
      }

      // Mark request as accepted
      await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "accepted",
          performer_wallet: session.account.address.toString(),
          payment_tx_sig: sig,
          accepted_at: new Date().toISOString(),
        }),
      });

      setTxSignature(sig);
      setStatus("done");
      return sig;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      setError(msg);
      setStatus("error");
      return null;
    }
  }, [controller, session, requestId]);

  return { pay, status, txSignature, error };
}
