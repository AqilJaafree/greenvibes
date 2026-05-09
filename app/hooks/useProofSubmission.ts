"use client";

import { useState, useCallback } from "react";

export interface GpsData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  isInsideHaram: boolean;
}

export interface AudioData {
  blob: Blob;
  sha256: string;
  mimeType: string;
}

export type SubmissionStatus = "idle" | "uploading" | "saving" | "done" | "error";

export function useProofSubmission(requestId: string, performerWallet: string, paymentTxSig: string | null) {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [proofId, setProofId] = useState<string | null>(null);

  const submit = useCallback(async (gps: GpsData, audio: AudioData) => {
    setStatus("uploading");
    setError(null);

    try {
      // Upload audio to Arweave via server route handler
      const form = new FormData();
      form.append("audio", new File([audio.blob], "proof.webm", { type: audio.mimeType }));
      form.append("requestId", requestId);
      form.append("performerWallet", performerWallet);
      form.append("audioSha256", audio.sha256);

      const uploadRes = await fetch("/api/arweave-upload", {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) {
        const j = await uploadRes.json();
        throw new Error(j.error ?? "Arweave upload failed");
      }
      const { txId, url } = await uploadRes.json();

      setStatus("saving");

      // Save proof record and advance request status
      const proofRes = await fetch("/api/proofs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: requestId,
          performer_wallet: performerWallet,
          latitude: gps.latitude,
          longitude: gps.longitude,
          gps_accuracy_meters: gps.accuracy,
          gps_timestamp: gps.timestamp,
          is_inside_haram: gps.isInsideHaram,
          audio_sha256: audio.sha256,
          arweave_tx_id: txId,
          arweave_url: url,
          payment_tx_sig: paymentTxSig,
        }),
      });
      if (!proofRes.ok) {
        const j = await proofRes.json();
        throw new Error(j.error ?? "Failed to save proof");
      }
      const { id } = await proofRes.json();
      setProofId(id);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setStatus("error");
    }
  }, [requestId, performerWallet, paymentTxSig]);

  return { submit, status, proofId, error };
}
