import { notFound } from "next/navigation";
import Link from "next/link";
import { createServiceClient } from "@/app/lib/supabase/server";
import { HajjRequest, Proof } from "@/app/lib/types";
import CompleteButton from "./CompleteButton";

export const dynamic = "force-dynamic";

type RequestWithProof = HajjRequest & { proofs: Proof | null };

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open:            { label: "Open",            color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  accepted:        { label: "Accepted",        color: "bg-blue-50 text-blue-700 border-blue-200" },
  proof_submitted: { label: "Proof Submitted", color: "bg-amber-50 text-amber-700 border-amber-200" },
  completed:       { label: "Completed",       color: "bg-gray-100 text-gray-700 border-gray-300" },
  disputed:        { label: "Disputed",        color: "bg-red-50 text-red-700 border-red-200" },
};

export default async function RequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("requests")
    .select("*, proofs(*)")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const request = data as RequestWithProof;
  const proof = request.proofs;
  const status = STATUS_LABELS[request.status] ?? STATUS_LABELS.open;

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <Link href="/requests" className="text-sm text-gray-400 hover:text-gray-600 mb-2 block">
            ← Back to requests
          </Link>
          <h1 className="text-2xl font-bold">{request.beneficiary_name}</h1>
          <p className="text-gray-500 text-sm capitalize mt-1">{request.reason.replace(/_/g, " ")}</p>
        </div>
        <span className={`shrink-0 text-xs border rounded-full px-3 py-1 font-medium ${status.color}`}>
          {status.label}
        </span>
      </div>

      {request.special_requests && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">Special Requests / Duas</p>
          <p className="text-sm text-gray-800">{request.special_requests}</p>
        </div>
      )}

      <div className="mb-6 text-sm text-gray-500 space-y-1">
        <p>Requester: <span className="font-mono text-xs">{request.requester_wallet}</span></p>
        {request.performer_wallet && (
          <p>Performer: <span className="font-mono text-xs">{request.performer_wallet}</span></p>
        )}
        {request.payment_tx_sig && (
          <p>
            Payment:{" "}
            <a
              href={`https://solscan.io/tx/${request.payment_tx_sig}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-mono text-xs"
            >
              {request.payment_tx_sig.slice(0, 20)}…
            </a>
          </p>
        )}
      </div>

      {/* Perform CTA */}
      {request.status === "open" && (
        <Link
          href={`/perform/${request.id}`}
          className="block w-full text-center bg-emerald-700 text-white py-3 rounded-xl font-medium hover:bg-emerald-800 transition-colors mb-6"
        >
          Accept & Perform this Hajj
        </Link>
      )}

      {/* Proof section */}
      {proof && (
        <div className="border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Proof of Performance</h2>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Location</p>
              <p className="font-mono text-xs">{proof.latitude.toFixed(6)}, {proof.longitude.toFixed(6)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Inside Haram</p>
              <p className={proof.is_inside_haram ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
                {proof.is_inside_haram ? "Yes ✓" : "Unconfirmed"}
              </p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Timestamp</p>
              <p>{new Date(proof.gps_timestamp).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs mb-0.5">Audio SHA-256</p>
              <p className="font-mono text-xs truncate">{proof.audio_sha256.slice(0, 16)}…</p>
            </div>
          </div>

          <div>
            <p className="text-gray-500 text-xs mb-1">Voice Recording</p>
            <audio controls src={proof.arweave_url} className="w-full" />
            <a
              href={proof.arweave_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline mt-1 block"
            >
              Permanent Arweave link ↗
            </a>
          </div>
        </div>
      )}

      {/* Mark complete */}
      {request.status === "proof_submitted" && (
        <CompleteButton requestId={request.id} requesterWallet={request.requester_wallet} />
      )}

      {request.status === "completed" && request.rating && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm">
          <p className="font-medium text-gray-700 mb-1">Rating: {"★".repeat(request.rating)}{"☆".repeat(5 - request.rating)}</p>
          {request.review_note && <p className="text-gray-600">{request.review_note}</p>}
        </div>
      )}
    </main>
  );
}
