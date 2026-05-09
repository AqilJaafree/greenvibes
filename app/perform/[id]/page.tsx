"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";
import { usePayment } from "@/app/hooks/usePayment";
import { HajjRequest } from "@/app/lib/types";

export default function PerformPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { wallet } = useWalletConnection();
  const publicKey = wallet?.account.address.toString();

  const [id, setId] = useState<string>("");
  const [request, setRequest] = useState<HajjRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/requests/${id}`)
        .then((r) => r.json())
        .then((data) => { setRequest(data); setLoading(false); })
        .catch(() => setLoading(false));
    });
  }, [params]);

  const { pay, status, txSignature, error } = usePayment(id);

  useEffect(() => {
    if (status === "done" && txSignature && id) {
      router.push(`/perform/${id}/proof?tx=${txSignature}`);
    }
  }, [status, txSignature, id, router]);

  if (loading) {
    return <main className="max-w-lg mx-auto px-4 py-10"><p className="text-gray-500">Loading...</p></main>;
  }

  if (!request) {
    return <main className="max-w-lg mx-auto px-4 py-10"><p className="text-red-500">Request not found.</p></main>;
  }

  if (request.status !== "open") {
    return (
      <main className="max-w-lg mx-auto px-4 py-10">
        <p className="text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm">
          This request is no longer open ({request.status}).
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Perform Badal Haji</h1>
      <p className="text-gray-500 text-sm mb-8">
        Accept this request by sending 1 USDC as a commitment. You will then submit
        GPS and voice proof from inside Masjid al-Haram.
      </p>

      {/* Request summary */}
      <div className="border border-gray-200 rounded-xl p-5 mb-6 space-y-2">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Beneficiary</p>
          <p className="font-semibold text-gray-900">{request.beneficiary_name}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Reason</p>
          <p className="text-sm text-gray-700 capitalize">{request.reason.replace(/_/g, " ")}</p>
        </div>
        {request.special_requests && (
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Special Requests</p>
            <p className="text-sm text-gray-700">{request.special_requests}</p>
          </div>
        )}
      </div>

      {!publicKey && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Connect your wallet to accept this request.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 text-sm space-y-1">
        <p className="font-medium text-gray-700">Payment: <span className="text-emerald-700">1 USDC</span></p>
        <p className="text-gray-500 text-xs">Direct transfer on Solana Mainnet. Non-refundable for MVP.</p>
      </div>

      <button
        onClick={pay}
        disabled={!publicKey || status === "sending" || status === "confirming"}
        className="w-full bg-emerald-700 text-white py-3 rounded-xl font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "sending" && "Waiting for wallet approval…"}
        {status === "confirming" && "Confirming on-chain…"}
        {(status === "idle" || status === "error") && "Accept & Pay 1 USDC"}
      </button>
    </main>
  );
}
