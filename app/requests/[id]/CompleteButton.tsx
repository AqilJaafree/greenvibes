"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";

export default function CompleteButton({
  requestId,
  requesterWallet,
}: {
  requestId: string;
  requesterWallet: string;
}) {
  const router = useRouter();
  const { wallet } = useWalletConnection();
  const publicKey = wallet?.account.address.toString();

  const [rating, setRating] = useState(5);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRequester = publicKey === requesterWallet;

  if (!isRequester) return null;

  async function handleComplete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          rating,
          review_note: reviewNote || null,
          completed_at: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? "Failed to mark complete");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 p-5 border border-emerald-200 bg-emerald-50 rounded-xl space-y-4">
      <h3 className="font-semibold text-emerald-900">Mark as Completed</h3>

      <div>
        <p className="text-sm text-gray-600 mb-2">Rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`text-2xl transition-opacity ${n <= rating ? "opacity-100" : "opacity-30"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm text-gray-600 block mb-1">Review (optional)</label>
        <textarea
          rows={2}
          value={reviewNote}
          onChange={(e) => setReviewNote(e.target.value)}
          placeholder="Leave a note for the performer..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleComplete}
        disabled={loading}
        className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-800 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : "Confirm Completion"}
      </button>
    </div>
  );
}
