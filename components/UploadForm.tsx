"use client";
import React, { useState } from "react";
import { uploadToIPFS } from "../utils/ipfs";
import { verifyDocument } from "../utils/aiVerification";
import { mintDocumentNFT } from "../utils/starknet";
import DocumentCard from "./DocumentCard";

interface UploadedDocument {
  fileName: string;
  ipfsUrl: string;
  authenticityScore?: number;
  tokenId?: string;
}

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      // 1️⃣ Upload to IPFS
      const { cid, url } = await uploadToIPFS(file, (sent, total) => {
        setProgress(Math.min(100, Math.round((sent / total) * 100)));
      });

      // 2️⃣ AI verification
      const verificationResult = await verifyDocument(cid, file.name);

      // 3️⃣ Mint NFT (placeholder)
      const mintResp = await mintDocumentNFT(undefined, url);

      // 4️⃣ Add to uploaded documents
      setUploadedDocuments((prev) => [
        ...prev,
        {
          fileName: file.name,
          ipfsUrl: url,
          authenticityScore: verificationResult.authenticityScore,
          tokenId: mintResp.tokenId,
        },
      ]);

      // Reset
      setFile(null);
      setProgress(0);
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err as any).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (doc: UploadedDocument) => {
    alert(`Verifying ${doc.fileName}...\nScore: ${doc.authenticityScore}`);
    // Optionally, call a full verification API here
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded bg-white max-w-md">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mb-2"
        />
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Processing..." : "Upload & Verify"}
          </button>
          <span>{progress ? `${progress}%` : ""}</span>
        </div>
      </div>

      {/* Uploaded Documents List */}
      {uploadedDocuments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold">Uploaded Documents</h2>
          {uploadedDocuments.map((doc, index) => (
            <DocumentCard
              key={index}
              fileName={doc.fileName}
              ipfsUrl={doc.ipfsUrl}
              authenticityScore={doc.authenticityScore}
              tokenId={doc.tokenId}
              onVerify={() => handleVerify(doc)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
