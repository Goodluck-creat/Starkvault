import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";

export const runtime = "nodejs";

// ---------------- Pinata Credentials ----------------
const PINATA_API_KEY = "07d2759bebae451dca70";
const PINATA_API_SECRET = "f142f6c741fc51f233871723aedbce6e3c3b43a1c8eab0fb2c5fc13a2cdaa45b";

// ---------------- Helper: Ensure user folder exists ----------------
function ensureUserFolder(walletAddress: string) {
  const dir = path.join(process.cwd(), "uploads", walletAddress);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ---------------- Simulated AI verification ----------------
function simulateAIAuth(text: string) {
  const score = parseFloat((Math.random() * 10 + 1).toFixed(2)); // 1–11
  const level = score >= 5 ? "High" : "Low";
  const message =
    score >= 5
      ? "✅ Highly authentic — AI shows strong confidence."
      : "⚠️ Low authenticity — verification shows issues.";
  return { score, level, message };
}

// ---------------- POST Handler ----------------
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const fileData = formData.get("file") as any;
    const walletAddress = formData.get("walletAddress") as string | null;

    if (!walletAddress)
      return NextResponse.json({ error: "Wallet not connected." }, { status: 401 });

    if (!fileData || typeof fileData.arrayBuffer !== "function")
      return NextResponse.json({ error: "No valid file provided." }, { status: 400 });

    // ---------------- Save file locally ----------------
    const buffer = Buffer.from(await fileData.arrayBuffer());
    const fileName = fileData.name || `file_${Date.now()}`;
    const fileType = fileName.toLowerCase().endsWith(".pdf")
      ? "pdf"
      : fileData.type.startsWith("image/")
      ? "image"
      : "unknown";

    if (fileType === "unknown")
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });

    const userDir = ensureUserFolder(walletAddress);
    const filePath = path.join(userDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // ---------------- Simulate AI verification ----------------
    const extractedText = `Simulated text from ${fileType}: ${fileName}`;
    const aiResult = simulateAIAuth(extractedText);

    // ---------------- Upload file to Pinata via REST API ----------------
    const fileForm = new (require("form-data"))();
    const fileStream = fs.createReadStream(filePath);
    fileForm.append("file", fileStream, fileName);

    const pinataFileRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      body: fileForm as any,
    });

    if (!pinataFileRes.ok) {
      const errText = await pinataFileRes.text();
      throw new Error(`Pinata file upload failed: ${errText}`);
    }

    const pinataFileData = await pinataFileRes.json();
    const pinataFileURL = `https://gateway.pinata.cloud/ipfs/${pinataFileData.IpfsHash}`;

    // ---------------- Upload metadata ----------------
    const metadata = {
      name: fileName,
      description: "Verified document stored via StarkVault",
      fileType,
      authenticityScore: aiResult.score,
      authenticityLevel: aiResult.level,
      message: aiResult.message,
      ipfsHash: pinataFileData.IpfsHash,
      ipfsURL: pinataFileURL,
      walletAddress,
      timestamp: new Date().toISOString(),
    };

    const pinataMetaRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET,
      },
      body: JSON.stringify(metadata),
    });

    if (!pinataMetaRes.ok) {
      const errText = await pinataMetaRes.text();
      throw new Error(`Pinata metadata upload failed: ${errText}`);
    }

    const pinataMetaData = await pinataMetaRes.json();
    const metadataURL = `https://gateway.pinata.cloud/ipfs/${pinataMetaData.IpfsHash}`;

    // ---------------- Return response ----------------
    return NextResponse.json({
      success: true,
      fileName,
      authenticityScore: aiResult.score,
      authenticityLevel: aiResult.level,
      message: aiResult.message,
      pinataFileURL,
      metadataURL,
    });
  } catch (err: any) {
    console.error("AI verification / Pinata upload error:", err);
    return NextResponse.json(
      { error: err.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
