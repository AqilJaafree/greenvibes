"use client";

import { SolanaProvider } from "@solana/react-hooks";
import { PropsWithChildren, useState } from "react";
import { autoDiscover, createClient } from "@solana/client";

export function Providers({ children }: PropsWithChildren) {
  const [client] = useState(() =>
    createClient({
      endpoint:
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ??
        "https://api.mainnet-beta.solana.com",
      walletConnectors: autoDiscover(),
    })
  );

  return <SolanaProvider client={client}>{children}</SolanaProvider>;
}
