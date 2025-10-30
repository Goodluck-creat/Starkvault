import { Contract, RpcProvider, Account, number } from "starknet";
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
    const result = await contract.get_document(number.toFelt(tokenId));
    console.log("📄 Document Data:", result);
    return result;
  } catch (error) {
    console.error("❌ Error fetching document:", error);
  }
}

/**
 * Write function - Mint a new document
 * Converts values to the correct StarkNet types
 */
export async function mintDocument(
  owner: string,             // StarkNet address of the owner
  fileHash: string,          // File hash as hex string or BigInt
  authenticityScore: number, // JS number
  account: Account
) {
  try {
    // Connect contract to user's account for transactions
    const userContract = contract.connect(account);

    // Convert JS types to StarkNet felt/u128
    const fileHashFelt = BigInt(fileHash); // file hash as BigInt
    const authenticityU128 = {
      low: BigInt(authenticityScore), // split into low/high if > 2^64
      high: BigInt(0),
    };

    const tx = await userContract.mint_document(owner, fileHashFelt, authenticityU128);
    console.log("⏳ Transaction sent:", tx.transaction_hash);

    // Wait for transaction to be accepted on StarkNet
    await provider.waitForTransaction(tx.transaction_hash);
    console.log("✅ Document minted successfully!");

    return tx;
  } catch (error) {
    console.error("❌ Error minting document:", error);
  }
}

export default contract;
