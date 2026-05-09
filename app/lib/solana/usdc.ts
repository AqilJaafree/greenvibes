"use client";

import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from "@solana/web3.js";
import {
  createTransferCheckedInstruction,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  USDC_MINT,
  USDC_DECIMALS,
  USDC_TRANSFER_AMOUNT,
  RECEIVER_WALLET,
} from "./constants";

export interface SendUSDCResult {
  signature: string;
}

export async function sendUSDC(
  sendTransaction: (
    tx: Transaction,
    connection: Connection
  ) => Promise<string>,
  senderPublicKey: PublicKey
): Promise<SendUSDCResult> {
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("mainnet-beta");
  const connection = new Connection(rpcUrl, "confirmed");

  const senderAta = await getAssociatedTokenAddress(
    USDC_MINT,
    senderPublicKey,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const receiverAta = await getAssociatedTokenAddress(
    USDC_MINT,
    RECEIVER_WALLET,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  const transaction = new Transaction();

  // Create receiver ATA if it doesn't exist yet (idempotent — safe to always add)
  transaction.add(
    createAssociatedTokenAccountIdempotentInstruction(
      senderPublicKey,
      receiverAta,
      RECEIVER_WALLET,
      USDC_MINT,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      USDC_MINT,
      receiverAta,
      senderPublicKey,
      USDC_TRANSFER_AMOUNT,
      USDC_DECIMALS,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = senderPublicKey;

  const signature = await sendTransaction(transaction, connection);

  await connection.confirmTransaction(
    { signature, blockhash, lastValidBlockHeight },
    "confirmed"
  );

  return { signature };
}
