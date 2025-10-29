import React from "react";

interface Props {
  documentId: string | string[] | undefined;
}

const NFTDetails: React.FC<Props> = ({ documentId }) => {
  return (
    <div className="p-4 border rounded bg-white">
      <p>NFT Details for Document ID: {documentId}</p>
      {/* Show IPFS hash, authenticity score, QR code */}
    </div>
  );
};

export default NFTDetails;
