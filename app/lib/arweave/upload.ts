import Arweave from "arweave";

const arweave = Arweave.init({
  host: "arweave.net",
  port: 443,
  protocol: "https",
});

export async function uploadToArweave(
  audioBuffer: Buffer,
  mimeType: string,
  tags: Record<string, string>
): Promise<{ txId: string; url: string }> {
  const jwk = JSON.parse(process.env.ARWEAVE_WALLET_KEY!);

  const tx = await arweave.createTransaction({ data: audioBuffer }, jwk);
  tx.addTag("Content-Type", mimeType);
  tx.addTag("App-Name", "BadalHaji");
  for (const [k, v] of Object.entries(tags)) {
    tx.addTag(k, v);
  }

  await arweave.transactions.sign(tx, jwk);
  const response = await arweave.transactions.post(tx);

  if (response.status !== 200 && response.status !== 202) {
    throw new Error(`Arweave upload failed: ${response.status} ${response.statusText}`);
  }

  return { txId: tx.id, url: `https://arweave.net/${tx.id}` };
}
