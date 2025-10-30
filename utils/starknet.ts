import { Contract, RpcProvider, Account, json, Abi } from "starknet";
import abiFile from "./abi/starkvault_abi.json";

const abi: Abi = { entries: Array.isArray(abiFile) ? abiFile : Object.values(abiFile) };

const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6",
});
update here:
const contractAddress =
  "0x02e7daa36fe0e3ca2557c5e1db3e3273dbc68100e913f7cb62e71cbb5093637c";

let contract: Contract | null = null;

try {
  contract = new Contract(abi.entries, contractAddress, provider);
  console.log("✅ Contract loaded successfully");
} catch (error) {
  console.error("❌ Failed to initialize contract:", error);
}

/**
 * ✅ Get document by token ID
 */
export async function getDocument(tokenId: number) {
  try {
    if (!contract) throw new Error("Contract not initialized");
    const result = await contract.get_document(tokenId);
    console.log("📄 Document Data:", result);
    return result;
  } catch (error) {
    console.error("❌ Error fetching document:", error);
    return null;
  }
}

/**
 * ✅ Mint new document (requires wallet)
 */
export async function mintDocument(
  owner: string,
  fileHash: string,
  authenticityScore: number,
  account: Account
) {
  try {
    if (!contract) throw new Error("Contract not initialized");

    contract.connect(account);

    const tx = await contract.mint_document(owner, fileHash, authenticityScore);
    console.log("⏳ Transaction sent:", tx.transaction_hash);

    await provider.waitForTransaction(tx.transaction_hash);
    console.log("✅ Document minted successfully!");

    return tx;
  } catch (error) {
    console.error("❌ Error minting document:", error);
    throw error;
  }
}

export default contract;
