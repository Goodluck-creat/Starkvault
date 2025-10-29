import { Contract, RpcProvider, Account, json } from "starknet";
import abi from "../abi/starkvault_abi.json";

// ✅ StarkNet RPC provider (Sepolia testnet)
const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6",
});

// ✅ Your deployed contract address
const contractAddress =
  "0x02e7daa36fe0e3ca2557c5e1db3e3273dbc68100e913f7cb62e71cbb5093637c";

// ✅ Connect to the contract (read-only mode)
const contract = new Contract(abi, contractAddress, provider);

/**
 * Read function - Get a document by token ID
 */
export async function getDocument(tokenId: number) {
  try {
    const result = await contract.get_document(tokenId);
    console.log("📄 Document Data:", result);
    return result;
  } catch (error) {
    console.error("❌ Error fetching document:", error);
  }
}

/**
 * Write function - Mint a new document (requires wallet connection)
 */
export async function mintDocument(
  owner: string,
  fileHash: string,
  authenticityScore: number,
  account: Account
) {
  try {
    // Connect contract to user's account for transactions
    contract.connect(account);

    const tx = await contract.mint_document(owner, fileHash, authenticityScore);
    console.log("⏳ Transaction sent:", tx.transaction_hash);

    await provider.waitForTransaction(tx.transaction_hash);
    console.log("✅ Document minted successfully!");

    return tx;
  } catch (error) {
    console.error("❌ Error minting document:", error);
  }
}

export default contract;
