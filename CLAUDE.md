# Badal Haji — Claude Code Context

## What This Is

Decentralized proxy Hajj platform on Solana. Connects Requesters (who need Hajj performed on their behalf) with Performers (who go to Makkah). MVP uses no custom smart contract — direct 1 USDC transfer on Mainnet as commitment.

## Stack

- **Frontend**: Next.js 16 (App Router) + Tailwind v4 + TypeScript
- **Wallet**: `@solana/react-hooks` + `@solana/client` (Wallet Standard — auto-detects Phantom, Solflare, Backpack)
- **Payments**: SPL Token `transferChecked` — 1 USDC (6 decimals) on Mainnet
- **Database**: Supabase (PostgreSQL) — requests + proofs tables
- **Storage**: Arweave — permanent voice recording + GPS proof
- **Hosting**: Vercel

## Key Constants

- USDC Mint (Mainnet): `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- Receiver wallet: `PSKhtWpcVVRyzivKVQcdAqsNeVmJhsmcnbaAJDkP5EE`
- Transfer amount: `1_000_000` micro-USDC (= 1 USDC)

## Project Structure (target)

```
app/
  (routes)/
    requests/new/          # Requester: create a Hajj request
    requests/[id]/         # View request + proof + mark complete
    requests/              # Browse open requests (Performer)
    perform/[id]/          # Performer: accept + pay
    perform/[id]/proof/    # Performer (in Makkah): GPS + voice capture
  api/
    requests/              # GET list, POST create
    requests/[id]/         # GET single, PATCH update
    proofs/                # POST save proof
    verify-payment/        # POST on-chain USDC tx verification
    arweave-upload/        # POST upload voice file server-side
  components/
    providers.tsx          # SolanaProvider (already wired)
  lib/
    supabase/client.ts     # Browser Supabase client
    supabase/server.ts     # Server Supabase client (service role)
    solana/constants.ts    # USDC mint, receiver, amount
    solana/usdc.ts         # sendUSDC() helper
    geo/haram.ts           # isInsideHaram(lat, lng) — Makkah zone check
    arweave/upload.ts      # uploadToArweave() — server-side only
  hooks/
    usePayment.ts
    useProofSubmission.ts
```

## Critical Rules

- `SUPABASE_SERVICE_ROLE_KEY` and `ARWEAVE_WALLET_KEY` are **server-only** — never in `NEXT_PUBLIC_*`
- Arweave uploads go through `/api/arweave-upload` Route Handler — never client-side
- All Supabase writes go through Route Handlers using service role key — RLS blocks direct client writes
- Use `transferChecked` (not `transfer`) for USDC — validates mint + decimals
- Server must verify USDC tx on-chain via `verify-payment` — never trust client-reported tx
- iOS Safari needs `audio/mp4` fallback for `MediaRecorder` (webm not supported)
- GPS zone check is a soft warning, not a hard gate (accuracy limitations on mobile)

## Supabase Schema

See `supabase/schema.sql` (to be created). Tables: `requests`, `proofs`. RLS: public reads, service-role-only writes.

## Phase Plan

1. ✅ Scaffold (done)
2. Supabase schema + env vars
3. Wallet already wired — update to mainnet ✅
4. USDC payment flow (`lib/solana/usdc.ts` + `api/verify-payment`)
5. Request management (create/browse/view)
6. Proof submission (GPS + voice + Arweave)
7. Proof review + completion
8. UI polish + landing page
9. Vercel deploy
