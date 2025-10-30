import { NextResponse } from "next/server";
import { RpcProvider, Contract, Account, Abi } from "starknet";
import abiFile from "../abi/starkvault_abi.json";

const provider = new RpcProvider({
  nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_6",
});

const contractAddress =
  "0x02e7daa36fe0e3ca2557c5e1db3e3273dbc68100e913f7cb62e71cbb5093637c";

let contract: Contract | null = null;

try {
  const abi: Abi = Array.isArray(abiFile) ? abiFile : Object.values(abiFile);
  contract = new Contract(abi, contractAddress, provider);
  console.log("✅ Contract initialized");
} catch (err) {
  console.error("❌ Failed to initialize contract:", err);
}

/**
 * POST /api/starknet
 */
export async function POST(req: Request) {
  try {
    const { walletAddress, fileURL, fileName } = await req.json();

    if (!walletAddress || !fileURL || !fileName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Simulate authenticity score for demo
    const authenticityScore = Math.floor(Math.random() * 10) + 1;

    // ✅ (Placeholder) Normally, you’d connect wallet & mint
    console.log("Minting simulated for:", { walletAddress, fileURL, authenticityScore });

    // Simulate success response
    const tokenId = Math.floor(Math.random() * 100000);
    const txLink = `https://sepolia.starkscan.co/tx/0x${Math.random()
      .toString(16)
      .slice(2, 10)}`;

    return NextResponse.json({
      success: true,
      tokenId,
      txLink,
    });
  } catch (error: any) {
    console.error("❌ Error in mint route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server error" },
      { status: 500 }
    );
  }
}
