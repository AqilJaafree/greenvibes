"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";

const REASONS = [
  { value: "elderly_parent", label: "Elderly Parent" },
  { value: "deceased", label: "Deceased (on behalf of)" },
  { value: "illness", label: "Illness / Disability" },
  { value: "myself", label: "Myself (unable to travel)" },
  { value: "other", label: "Other" },
];

export default function NewRequestPage() {
  const router = useRouter();
  const { wallet } = useWalletConnection();
  const publicKey = wallet?.account.address.toString();

  const [form, setForm] = useState({
    beneficiary_name: "",
    reason: "elderly_parent",
    special_requests: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!publicKey) {
      setError("Please connect your wallet first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, requester_wallet: publicKey }),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to create request";
        try { msg = JSON.parse(text).error ?? msg; } catch { /* empty body */ }
        throw new Error(msg);
      }
      const json = await res.json();
      router.push(`/requests/${json.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">New Badal Haji Request</h1>
      <p className="text-gray-500 text-sm mb-8">
        Submit a request for a performer to carry out Hajj on behalf of your loved one.
      </p>

      {!publicKey && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          Connect your wallet to submit a request.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Beneficiary Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.beneficiary_name}
            onChange={(e) => setForm({ ...form, beneficiary_name: e.target.value })}
            placeholder="Full name of the person Hajj is for"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reason <span className="text-red-500">*</span>
          </label>
          <select
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests / Duas
          </label>
          <textarea
            rows={3}
            value={form.special_requests}
            onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
            placeholder="Any specific duas or instructions for the performer..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || !publicKey}
          className="w-full bg-emerald-700 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Request"}
        </button>
      </form>
    </main>
  );
}
