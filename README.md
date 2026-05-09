# Badal Haji — بدل حج

A decentralized proxy Hajj platform built on Solana. Connects families who cannot travel to Makkah with verified pilgrims already there, enabling Hajj to be performed on their behalf with permanent on-chain proof.

---

## What We Built

### Core Flows

**For families (requesting Hajj)**
- Fill a request form with the beneficiary's name and contact details
- Pay a small 1 USDC deposit to lock the request
- Track status in real time — open → accepted → proof submitted → completed
- View the permanent GPS + voice proof once the pilgrim submits it
- Mark the request completed after reviewing the proof

**For pilgrims (performing Hajj)**
- Browse all open requests on a public board
- Accept a request and pay 1 USDC commitment deposit
- Inside Masjid al-Haram: capture GPS location (verified against the Haram boundary)
- Record a voice declaration (niyyah) saying the beneficiary's name
- Submit both — stored permanently on Arweave, hash anchored on-chain

### Payment & Verification
- Direct 1 USDC SPL token transfer on Solana Mainnet (`transferChecked`)
- Server-side transaction verification: checks mint, receiver ATA, amount, sender, and age (< 10 min)
- No custodial wallet — funds go directly between parties
- Supports Phantom, Solflare, Backpack, and any Wallet Standard wallet

### Proof System
- GPS captured via browser Geolocation API with ±accuracy reading
- Soft boundary check against Masjid al-Haram coordinates (21.4183–21.4268°N, 39.8226–39.8298°E)
- Voice recording via `MediaRecorder` — `audio/webm` on desktop, `audio/mp4` fallback for iOS Safari
- SHA-256 fingerprint computed client-side before upload
- Audio uploaded server-side to Arweave (JWK key never exposed to browser)
- Proof record stored in Supabase with Arweave transaction ID + URL

### UI
- Neo brutalism design: thick black borders, offset box shadows, flat yellow/emerald/cream palette
- Animated landing page using React Bits `BlurText` (scroll-triggered word blur-in) and `RotatingText` (auto-cycling labels)
- Sticky navbar with wallet connect, short address display, mobile hamburger menu
- Arabic + English branding: بدل حج / Badal Haji
- Fully responsive — mobile-first layout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Wallet | `@solana/react-hooks` + Wallet Standard (Phantom, Solflare, Backpack) |
| Payments | `@solana/spl-token` — `transferChecked` on Mainnet |
| Database | Supabase (PostgreSQL) |
| Storage | Arweave — permanent voice + GPS proof |
| Animation | `motion/react` (Framer Motion v11) |
| Hosting | Netlify (`@netlify/plugin-nextjs`) |

---

## Key Constants

- **USDC Mint (Mainnet):** `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **Receiver wallet:** `PSKhtWpcVVRyzivKVQcdAqsNeVmJhsmcnbaAJDkP5EE`
- **Transfer amount:** 1 USDC (1,000,000 micro-USDC)

---

## Project Structure

```
app/
  api/
    requests/          # GET list, POST create
    requests/[id]/     # GET single + proofs, PATCH status
    proofs/            # POST save proof record
    verify-payment/    # POST on-chain USDC tx verification
    arweave-upload/    # POST upload voice file (server-side only)
  components/
    Navbar.tsx         # Sticky nav, wallet connect, mobile menu
    providers.tsx      # Solana + wallet provider tree
    ui/
      BlurText.tsx     # React Bits — scroll-triggered blur animation
      RotatingText.tsx # React Bits — auto-cycling text
  hooks/
    usePayment.ts      # SPL transfer + server verify + request PATCH
    useProofSubmission.ts  # Arweave upload + proof record save
  lib/
    solana/
      constants.ts     # USDC mint, receiver wallet, transfer amount
      usdc.ts          # sendUSDC() — legacy web3.js v1 transferChecked
    supabase/
      client.ts        # Browser Supabase client
      server.ts        # Service-role server client (Route Handlers only)
    arweave/
      upload.ts        # uploadToArweave() — server-side JWK signing
    geo/
      haram.ts         # isInsideHaram(lat, lng) — Makkah boundary check
    types.ts           # HajjRequest, Proof, RequestStatus
  (routes)/
    /                  # Landing page
    /requests          # Browse open requests
    /requests/new      # Create a new request
    /requests/[id]     # Request detail + proof viewer
    /perform/[id]      # Accept request + pay
    /perform/[id]/proof  # GPS + voice capture + submit
supabase/
  schema.sql           # requests + proofs tables, RLS policies
```

---

## Database Schema

**`requests`** — stores each Hajj request
- `id`, `beneficiary_name`, `requester_name`, `contact`, `note`
- `requester_wallet` — Solana public key of the family
- `performer_wallet` — set when a pilgrim accepts
- `status` — `open` → `accepted` → `proof_submitted` → `completed`
- `tx_signature` — commitment payment tx
- `created_at`

**`proofs`** — stores submitted proof per request
- `request_id` (FK)
- `performer_wallet`
- `arweave_tx_id`, `arweave_url` — permanent voice recording
- `audio_sha256` — tamper-evident fingerprint
- `gps_latitude`, `gps_longitude`, `gps_accuracy`
- `is_inside_haram` — boundary check result
- `niyyah_text` — optional written declaration

---

## Security

- `ARWEAVE_WALLET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only — never in `NEXT_PUBLIC_*`
- All Supabase writes go through Route Handlers using the service role key
- USDC transactions are verified server-side (mint, receiver, amount, sender, age)
- Arweave uploads happen server-side — the JWK private key never touches the browser
- `.env.local`, `.claude/`, `.superstack/`, `.agents/` are all gitignored

---

## Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Solana RPC (use Helius or QuickNode for production)
NEXT_PUBLIC_SOLANA_RPC_URL=

# Arweave — paste the full JWK JSON as a single-line string
ARWEAVE_WALLET_KEY=
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
