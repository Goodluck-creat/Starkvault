import { Contract, RpcProvider, Account, uint256 } from "starknet";
import abi from "../abi/starkvault_abi.json";

const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6",
});

const contractAddress =
  "0x02e7daa36fe0e3ca2557c5e1db3e3273dbc68100e913f7cb62e71cbb5093637c";

const contract = new Contract(abi, contractAddress, provider);

export async function mintDocument(
  owner: string,
  fileHash: string,
  authenticityScore: number | bigint,
  account: Account
) {
  try {
    contract.connect(account);

    // Convert authenticityScore to uint256
    const scoreUint = uint256.bnToUint256(BigInt(authenticityScore));

    const tx = await contract.mint_document(owner, fileHash, scoreUint);
    console.log("⏳ Transaction sent:", tx.transaction_hash);

    await provider.waitForTransaction(tx.transaction_hash);
    console.log("✅ Document minted successfully!");

    return tx;
  } catch (error) {
    console.error("❌ Error minting document:", error);
  }
}
