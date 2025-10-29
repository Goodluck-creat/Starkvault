"use client";
import React from "react";

interface DocumentCardProps {
  fileName: string;
  ipfsUrl: string;
  authenticityScore?: number;
  tokenId?: string;
  onVerify?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  fileName,
  ipfsUrl,
  authenticityScore,
  tokenId,
  onVerify,
}) => {
  return (
    <div className="border p-4 rounded bg-white shadow-sm flex flex-col gap-2">
      <p className="font-semibold">{fileName}</p>
      <a href={ipfsUrl} target="_blank" className="text-blue-600 underline">
        View on IPFS
      </a>
      {authenticityScore !== undefined && (
        <p>Authenticity Score: {authenticityScore}</p>
      )}
      {tokenId && <p>NFT Token ID: {tokenId}</p>}
      {onVerify && (
        <button
          onClick={onVerify}
          className="bg-green-600 text-white px-3 py-1 rounded mt-2"
        >
          Verify
        </button>
      )}
    </div>
  );
};

export default DocumentCard;
