"use client";
import React, { useState } from "react";

interface WalletConnectProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const [account, setAccount] = useState<string | null>(null);

  const connectWallet = () => {
    // Mock connect
    const mockAccount = "0x1234...abcd";
    setAccount(mockAccount);
    onConnect && onConnect();
  };

  const disconnectWallet = () => {
    setAccount(null);
    onDisconnect && onDisconnect();
  };

  return (
    <div className="mb-4">
      {account ? (
        <div className="flex items-center gap-4">
          <p>Connected: {account}</p>
          <button
            className="bg-red-600 text-white px-3 py-1 rounded"
            onClick={disconnectWallet}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
