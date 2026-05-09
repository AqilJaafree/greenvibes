"use client";

import Link from "next/link";
import { useState } from "react";
import { useWalletConnection } from "@solana/react-hooks";

export default function Navbar() {
  const { wallet, connectors, connect, disconnect, status } = useWalletConnection();
  const address = wallet?.account.address.toString();
  const [menuOpen, setMenuOpen] = useState(false);

  const solanaConnectors = connectors.filter(
    (c) => !c.name.toLowerCase().includes("brave")
  );

  const short = address
    ? `${address.slice(0, 4)}…${address.slice(-4)}`
    : null;

  return (
    <nav className="border-b-3 border-black bg-[#FFFEF0] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-black text-xl tracking-tight text-black hover:text-emerald-700 transition-colors"
        >
          بدل حج
          <span className="text-sm font-bold ml-2 text-emerald-700">Badal Haji</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/requests"
            className="text-sm font-bold border-2 border-black px-3 py-1.5 hover:bg-black hover:text-[#FFFEF0] transition-colors"
          >
            Find a Request
          </Link>
          <Link
            href="/requests/new"
            className="text-sm font-bold border-2 border-black px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 transition-colors"
          >
            + Ask for Hajj
          </Link>

          {status === "connected" && short ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono border-2 border-black px-2 py-1.5 bg-yellow-300">
                {short}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-xs font-bold border-2 border-black px-3 py-1.5 hover:bg-red-400 transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : (
            solanaConnectors.slice(0, 1).map((c) => (
              <button
                key={c.id}
                onClick={() => connect(c.id)}
                disabled={status === "connecting"}
                className="text-sm font-bold border-2 border-black px-3 py-1.5 bg-yellow-300 hover:bg-yellow-200 disabled:opacity-50 transition-colors shadow-[3px_3px_0px_black]"
              >
                {status === "connecting" ? "Connecting…" : "Connect Wallet"}
              </button>
            ))
          )}
        </div>

        {/* Mobile burger */}
        <button
          className="sm:hidden font-black text-xl border-2 border-black w-9 h-9 flex items-center justify-center"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t-2 border-black bg-[#FFFEF0] px-4 py-4 space-y-3">
          <Link href="/requests" className="block font-bold border-2 border-black px-3 py-2 text-sm">
            Find a Request
          </Link>
          <Link href="/requests/new" className="block font-bold border-2 border-black px-3 py-2 text-sm bg-emerald-500">
            + Ask for Hajj
          </Link>
          {status === "connected" && short ? (
            <>
              <span className="block text-xs font-mono border-2 border-black px-2 py-2 bg-yellow-300">{short}</span>
              <button onClick={() => disconnect()} className="block w-full text-left font-bold border-2 border-black px-3 py-2 text-sm hover:bg-red-400">
                Disconnect
              </button>
            </>
          ) : (
            solanaConnectors.slice(0, 1).map((c) => (
              <button key={c.id} onClick={() => connect(c.id)} className="block w-full text-left font-bold border-2 border-black px-3 py-2 text-sm bg-yellow-300">
                Connect Wallet
              </button>
            ))
          )}
        </div>
      )}
    </nav>
  );
}
