-- Run once to bootstrap the Badal Haji database

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── proofs (created first — requests.proof_id references it) ─────────────────
CREATE TABLE IF NOT EXISTS proofs (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          timestamptz NOT NULL DEFAULT now(),

  request_id          uuid NOT NULL,
  performer_wallet    text NOT NULL,

  -- GPS
  latitude            double precision NOT NULL,
  longitude           double precision NOT NULL,
  gps_accuracy_meters real,
  gps_timestamp       timestamptz NOT NULL,
  is_inside_haram     boolean NOT NULL,

  -- Voice
  audio_sha256        text NOT NULL,
  arweave_tx_id       text NOT NULL,
  arweave_url         text NOT NULL,

  -- On-chain anchor
  solana_block_time   bigint,
  payment_tx_sig      text
);

-- ── requests ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requests (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  requester_wallet    text NOT NULL,
  beneficiary_name    text NOT NULL,
  reason              text NOT NULL,
  special_requests    text,

  -- open → accepted → proof_submitted → completed | disputed
  status              text NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','accepted','proof_submitted','completed','disputed')),

  payment_tx_sig      text,
  performer_wallet    text,
  accepted_at         timestamptz,
  proof_id            uuid REFERENCES proofs(id),
  completed_at        timestamptz,
  rating              smallint CHECK (rating BETWEEN 1 AND 5),
  review_note         text
);

-- ── RLS — public reads, service-role-only writes ──────────────────────────────
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE proofs   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read requests" ON requests FOR SELECT USING (true);
CREATE POLICY "public read proofs"   ON proofs   FOR SELECT USING (true);
