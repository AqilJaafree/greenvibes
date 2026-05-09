"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useWalletConnection } from "@solana/react-hooks";
import { isInsideHaram } from "@/app/lib/geo/haram";
import { useProofSubmission, GpsData, AudioData } from "@/app/hooks/useProofSubmission";

export default function ProofPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txSig = searchParams.get("tx");
  const { wallet } = useWalletConnection();
  const publicKey = wallet?.account.address.toString();

  const [id, setId] = useState("");
  useEffect(() => { params.then(({ id }) => setId(id)); }, [params]);

  // GPS state
  const [gps, setGps] = useState<GpsData | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [capturingGps, setCapturingGps] = useState(false);

  // Audio state
  const [audio, setAudio] = useState<AudioData | null>(null);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const { submit, status, proofId, error } = useProofSubmission(
    id,
    publicKey ?? "",
    txSig
  );

  useEffect(() => {
    if (status === "done" && id) {
      router.push(`/requests/${id}`);
    }
  }, [status, id, router]);

  function captureGps() {
    setCapturingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setGps({
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString(),
          isInsideHaram: isInsideHaram(latitude, longitude),
        });
        setCapturingGps(false);
      },
      (err) => {
        setGpsError(err.message);
        setCapturingGps(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function startRecording() {
    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/mp4";

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: mimeType });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Compute SHA-256
      const buf = await blob.arrayBuffer();
      const hashBuf = await crypto.subtle.digest("SHA-256", buf);
      const hex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      setAudio({ blob, sha256: hex, mimeType: blob.type });
    };

    mediaRecorderRef.current = mr;
    mr.start();
    setRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  const canSubmit = !!gps && !!audio && !!publicKey;

  return (
    <main className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">Submit Proof</h1>
      <p className="text-gray-500 text-sm mb-8">
        You must be inside Masjid al-Haram. Capture your GPS location and record
        your niyyah (intention) declaration.
      </p>

      {/* Step 1 — GPS */}
      <section className="border border-gray-200 rounded-xl p-5 mb-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">1</span>
          GPS Location
        </h2>

        {!gps ? (
          <button
            onClick={captureGps}
            disabled={capturingGps}
            className="w-full border border-emerald-300 text-emerald-700 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-50 disabled:opacity-50 transition-colors"
          >
            {capturingGps ? "Getting location…" : "Capture GPS"}
          </button>
        ) : (
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              <span className="font-mono">{gps.latitude.toFixed(6)}, {gps.longitude.toFixed(6)}</span>
              {" "}(±{Math.round(gps.accuracy)}m)
            </p>
            <p className={gps.isInsideHaram ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>
              {gps.isInsideHaram ? "✓ Inside Masjid al-Haram" : "⚠ Outside Haram boundary (GPS may be inaccurate)"}
            </p>
            <button onClick={captureGps} className="text-xs text-gray-400 underline mt-1">
              Recapture
            </button>
          </div>
        )}

        {gpsError && <p className="text-sm text-red-600 mt-2">{gpsError}</p>}
      </section>

      {/* Step 2 — Voice */}
      <section className="border border-gray-200 rounded-xl p-5 mb-5">
        <h2 className="font-semibold mb-1 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold">2</span>
          Voice Declaration (Niyyah)
        </h2>
        <p className="text-xs text-gray-400 mb-3">
          Say: &quot;I am performing Badal Haji for [Beneficiary Name] on behalf of [Requester]…&quot;
        </p>

        {!audio ? (
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${
              recording
                ? "bg-red-600 text-white hover:bg-red-700"
                : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            }`}
          >
            {recording ? "⏹ Stop Recording" : "🎤 Start Recording"}
          </button>
        ) : (
          <div className="space-y-2">
            <audio controls src={audioUrl ?? undefined} className="w-full" />
            <p className="text-xs text-gray-400 font-mono truncate">SHA-256: {audio.sha256.slice(0, 24)}…</p>
            <button
              onClick={() => { setAudio(null); setAudioUrl(null); }}
              className="text-xs text-gray-400 underline"
            >
              Re-record
            </button>
          </div>
        )}
      </section>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        onClick={() => gps && audio && submit(gps, audio)}
        disabled={!canSubmit || status === "uploading" || status === "saving"}
        className="w-full bg-emerald-700 text-white py-3 rounded-xl font-medium hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "uploading" && "Uploading to Arweave…"}
        {status === "saving" && "Saving proof…"}
        {(status === "idle" || status === "error") && "Submit Proof"}
      </button>
    </main>
  );
}
