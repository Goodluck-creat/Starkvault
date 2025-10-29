// utils/starknet.ts
export async function mintDocumentNFT(account: string | undefined, metadataUri: string) {
  // Placeholder: replace with actual StarkNet.js logic
  console.log("Minting NFT for account:", account, "with URI:", metadataUri);
  return {
    success: true,
    tokenId: Math.floor(Math.random() * 10000).toString(),
    txHash: "0xabc123...",
  };
}
