import React from "react";

interface Props {
  documentId: string | string[] | undefined;
}

const QRVerification: React.FC<Props> = ({ documentId }) => {
  return (
    <div className="p-4 border rounded bg-white">
      <p>QR Verification for Document ID: {documentId}</p>
      {/* Add QR code scanner / verification results */}
    </div>
  );
};

export default QRVerification;
