import { NextResponse } from "next/server";
import { mintDocument } from "@/utils/starknet";

export async function POST(req: Request) {
  try {
    const { walletAddress, fileURL, fileName } = await req.json();
    const result = await mintDocument(walletAddress, fileURL, fileName);

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
