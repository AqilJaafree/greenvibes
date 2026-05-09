export type RequestStatus =
  | "open"
  | "accepted"
  | "proof_submitted"
  | "completed"
  | "disputed";

export interface HajjRequest {
  id: string;
  created_at: string;
  updated_at: string;
  requester_wallet: string;
  beneficiary_name: string;
  reason: string;
  special_requests: string | null;
  status: RequestStatus;
  payment_tx_sig: string | null;
  performer_wallet: string | null;
  accepted_at: string | null;
  proof_id: string | null;
  completed_at: string | null;
  rating: number | null;
  review_note: string | null;
}

export interface Proof {
  id: string;
  created_at: string;
  request_id: string;
  performer_wallet: string;
  latitude: number;
  longitude: number;
  gps_accuracy_meters: number | null;
  gps_timestamp: string;
  is_inside_haram: boolean;
  audio_sha256: string;
  arweave_tx_id: string;
  arweave_url: string;
  solana_block_time: number | null;
  payment_tx_sig: string | null;
}
