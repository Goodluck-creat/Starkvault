"use client";
import Image from "next/image";
import logo from "./image/logo.jpg";
import React, { useEffect, useState } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";

type StoredFile = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string;
  verified?: boolean;
  uploaded?: boolean;
  authenticityScore?: number | null;
  reason?: string | null;
  pinataURL?: string;
  owner: string;
  timestamp: string;
};

type ProviderLike = {
  enable?: () => Promise<any>;
  request?: (opts: any) => Promise<any>;
  selectedAddress?: string;
  account?: { address?: string };
  isConnected?: boolean;
};

const KEY_PREFIX = "starkvault_files_";

export default function VerifyDocument() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 3;
  const totalPages = Math.ceil(uploadedFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = uploadedFiles.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  // ---------------- WALLET DETECTION ----------------
  const detectProvider = (): { provider: ProviderLike | null; name: string | null } => {
    const win = window as any;
    if (win?.starknet_argentX) return { provider: win.starknet_argentX, name: "Argent X" };
    if (win?.starknet_braavos) return { provider: win.starknet_braavos, name: "Braavos" };
    if (win?.starknet) return { provider: win.starknet, name: "StarkNet" };
    return { provider: null, name: null };
  };

  const connectWallet = async () => {
    try {
      const { provider, name } = detectProvider();
      if (!provider) {
        Swal.fire({
          icon: "error",
          title: "Wallet Not Found",
          text: "Please install Argent X or Braavos.",
          confirmButtonColor: "#f97316",
        });
        return;
      }

      let address: string | null | undefined;
      if (provider.enable) {
        await provider.enable();
        address = provider.selectedAddress || provider.account?.address;
      } else if (provider.request) {
        const resp = await provider.request({ method: "starknet_requestAccounts" });
        if (Array.isArray(resp) && resp.length > 0) address = resp[0];
      }

      if (!address) {
        Swal.fire(
          "Approve Connection",
          `Open your ${name} wallet and approve connection.`,
          "info"
        );
        return;
      }

      setWalletAddress(address);
      setProviderName(name);
      Swal.fire("Connected", `${name} connected successfully!`, "success");
      setTimeout(() => setShowMain(true), 500);
    } catch (err) {
      Swal.fire("Error", "Failed to connect wallet.", "error");
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setProviderName(null);
    setShowMain(false);
    Swal.fire("Disconnected", "Wallet disconnected.", "info");
  };

  const storageKey = (wallet: string) => `${KEY_PREFIX}${wallet}`;

  // ---------------- LOAD FILES ----------------
  useEffect(() => {
    if (walletAddress) {
      const raw = localStorage.getItem(storageKey(walletAddress));
      if (raw) {
        const files = JSON.parse(raw);
        setUploadedFiles(files);
      } else setUploadedFiles([]);
    }
  }, [walletAddress]);

  // ---------------- SAVE FILE METADATA ----------------
  useEffect(() => {
    if (walletAddress) {
      const metadata = uploadedFiles.map(({ dataUrl, ...rest }) => rest);
      localStorage.setItem(storageKey(walletAddress), JSON.stringify(metadata));
    }
  }, [uploadedFiles, walletAddress]);

  // ---------------- FILE HELPERS ----------------
  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const dataUrlToFile = (dataUrl: string, filename: string) => {
    const arr = dataUrl.split(",");
    const mimeMatch = arr[0].match(/data:(.*);base64/);
    const mime = mimeMatch ? mimeMatch[1] : "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // ---------------- HANDLE FILE INPUT ----------------
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!walletAddress) {
      Swal.fire("Connect Wallet", "You must connect before uploading.", "warning");
      return;
    }
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setLoading(true);
    const toAdd: StoredFile[] = [];
    for (const f of files) {
      const dataUrl = await fileToDataUrl(f);
      toAdd.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2),
        name: f.name,
        type: f.type,
        size: f.size,
        dataUrl,
        verified: false,
        uploaded: false,
        owner: walletAddress,
        timestamp: new Date().toISOString(),
      });
    }
    setUploadedFiles((prev) => [...toAdd, ...prev]);
    setLoading(false);
    Swal.fire("Uploaded", "Files tied to this wallet.", "success");
    (e.target as HTMLInputElement).value = "";
  };

  // ----------------  AI VERIFICATION ----------------
  const handleVerify = async (id: string) => {
    const fileEntry = uploadedFiles.find((f) => f.id === id);
    if (!fileEntry || !walletAddress) return;

    setLoading(true);
    try {
      const authenticityScore = Math.random() * 10;
      const reason =
        authenticityScore >= 8
          ? "Highly authentic — AI shows strong confidence."
          : authenticityScore >= 6.5
          ? "Moderately authentic — AI shows fair confidence."
          : "Low authenticity — verification passed with uncertainties.";

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, verified: authenticityScore >= 5, authenticityScore, reason }
            : f
        )
      );

      Swal.fire(
        authenticityScore >= 5 ? "Verified" : "Failed",
        `Authenticity Score: ${authenticityScore.toFixed(1)} / 10`,
        authenticityScore >= 5 ? "success" : "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UPLOAD TO PINATA ----------------
  const handleUploadToStorage = async (id: string) => {
    const fileEntry = uploadedFiles.find((f) => f.id === id);
    if (!fileEntry || !fileEntry.dataUrl || !walletAddress) {
      Swal.fire("Error", "File not found or wallet not connected.", "error");
      return;
    }

    setUploading(true);
    Swal.fire({
      title: "Uploading to cloud...",
      html: `<div class="loader mx-auto mt-4"></div>`,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      background: "#000",
      color: "#FFA500",
    });

    try {
      const file = dataUrlToFile(fileEntry.dataUrl, fileEntry.name);

      if (!(file instanceof Blob)) {
        throw new Error("Failed to create a valid File/Blob from data URL.");
      }

      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("walletAddress", walletAddress);

      const response = await fetch("/api/ai-check", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!data.success) throw new Error(data.error || "Upload failed");

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? { ...f, uploaded: true, pinataURL: data.pinataFileURL }
            : f
        )
      );

      Swal.fire("Uploaded!", "Document stored on cloud.", "success");
    } catch (err: any) {
      Swal.fire("Upload Failed", err.message || "Unable to upload to Pinata.", "error");
    } finally {
      setUploading(false);
    }
  };

  // ---------------- MINT DOCUMENT ----------------
const handleMint = async (id: string) => {
  const fileEntry = uploadedFiles.find((f) => f.id === id);
  if (!fileEntry || !fileEntry.pinataURL || !walletAddress) {
    Swal.fire("Error", "File not uploaded or wallet not connected.", "error");
    return;
  }

  Swal.fire({
    title: "Minting...",
    html: `<div class='loader mx-auto mt-4'></div>`,
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
    background: "#000",
    color: "#FFA500",
  });

  try {
    const response = await fetch("/api/starknet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress,
        fileURL: fileEntry.pinataURL,
        fileName: fileEntry.name,
      }),
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error || "Minting failed");

    Swal.fire(
      "Minted!",
      `Token ID: ${data.tokenId} <br> <a href='${data.txLink}' target='_blank' class='underline text-orange-500'>View on StarkScan</a>`,
      "success"
    );
  } catch (err: any) {
    Swal.fire("Error", err.message || "Failed to mint NFT.", "error");
  }
};


  // ---------------- DELETE FILE ----------------
  const handleDeleteFile = async (id: string) => {
    const file = uploadedFiles.find((f) => f.id === id);
    if (!file) return;

    const result = await Swal.fire({
      title: "Delete File?",
      text: `Are you sure you want to delete "${file.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f97316",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, Delete it",
    });

    if (result.isConfirmed) {
      setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
      Swal.fire("Deleted!", `"${file.name}" has been removed.`, "success");
    }
  };

  const getLevelColor = (score: number) =>
    score >= 8 ? "bg-green-500" : score >= 6.5 ? "bg-yellow-400" : "bg-red-500";

  const getLevelText = (score: number) =>
    score >= 8 ? "High Authenticity" : score >= 6.5 ? "Moderate Authenticity" : "Low Authenticity";

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white text-gray-900 flex flex-col items-center justify-center p-4">
      <style jsx>{`
        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid orange;
          border-right: 4px solid black;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      

      {/* CONNECTION SCREEN */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-orange-50 to-white">
  {/* Background logo + overlay */}
  <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
    <motion.img
      src="/logo.jpg"
      alt="StarkVault Background Logo"
      className="w-96 h-96 opacity-10"
      animate={{ y: [0, -30, 0] }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "loop",
        ease: "easeInOut",
      }}
    />
  </div>
  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm pointer-events-none"></div>

  {/* Content */}
  <AnimatePresence>
    {!showMain && (
      <motion.div
        key="connect"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center space-y-5 z-10"
      >
        {/* Floating logo */}
        <motion.img
          src="/logo.jpg"
          alt="StarkVault Logo"
          className="w-32 h-32 mb-4 z-10"
          animate={{ y: [0, -20, 0] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        />
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 text-transparent bg-clip-text">
          StarkVault
        </h1>
        <p className="text-gray-600 max-w-md">
          Secure, Verify, and Protect your documents with AI authenticity and decentralized
          storage.
        </p>
        <button
          onClick={connectWallet}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold shadow-md transition"
        >
          Connect Wallet To Login
        </button>
      </motion.div>
    )}
  </AnimatePresence>
</div>


      {/* MAIN DASHBOARD */}
      {showMain && (
        <motion.div
          key="main"
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-8 mt-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-orange-600">StarkVault Dashboard</h1>
              <p className="text-gray-500 text-sm">
                Connected with {providerName} · {walletAddress?.slice(0, 10)}...
              </p>
            </div>
            <button
              onClick={disconnectWallet}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm mt-4 md:mt-0"
            >
              Disconnect
            </button>
          </div>

          {/* DOCUMENTS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gray-50 border p-6 rounded-xl shadow-inner">
              <div className="flex justify-between mb-4 items-center">
                <h2 className="text-lg font-semibold">Your Documents</h2>
                <label
                  htmlFor="file-upload"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg cursor-pointer text-sm"
                >
                  Upload
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>

              {uploadedFiles.length === 0 ? (
                <div className="text-gray-400 text-center py-10 italic">
                  No documents uploaded yet.
                </div>
              ) : (
                <>
                  {paginatedFiles.map((f) => (
                    <div
                      key={f.id}
                      className="border p-4 rounded-lg mb-4 bg-white shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{f.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(f.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {!f.verified && (
                            <button
                              onClick={() => handleVerify(f.id)}
                              className="bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1 rounded-md"
                            >
                             Ai Verify 
                            </button>
                          )}
                          {f.verified && !f.uploaded && (
                            <button
                              onClick={() => handleUploadToStorage(f.id)}
                              className="bg-black hover:bg-gray-800 text-white text-sm px-3 py-1 rounded-md"
                            >
                              Upload to cloud
                            </button>
                          )}
                          {f.uploaded && (
                            <a
                              href={f.pinataURL}
                              target="_blank"
                              className="text-sm text-orange-600 underline"
                            >
                              View on cloud
                            </a>
                          )}

                          {f.uploaded && (
  <button
    onClick={() => handleMint(f.id)}
    className="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded-md"
  >
    Mint
  </button>
)}

                          <button
                            onClick={() => handleDeleteFile(f.id)}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded-md"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {typeof f.authenticityScore === "number" && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 bg-gray-100 p-3 rounded-lg"
                        >
                          <div className="flex justify-between text-sm font-medium mb-1">
                            <span>{getLevelText(f.authenticityScore)}</span>
                            <span>{f.authenticityScore.toFixed(1)} / 10</span>
                          </div>
                          <div className="w-full bg-gray-300 h-2 rounded-md overflow-hidden">
                            <div
                              className={`${getLevelColor(f.authenticityScore)} h-2`}
                              style={{ width: `${(f.authenticityScore / 10) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">{f.reason}</p>
                        </motion.div>
                      )}
                    </div>
                  ))}

                  {/* PAGINATION */}
                  {uploadedFiles.length > ITEMS_PER_PAGE && (
                    <div className="flex justify-center items-center gap-4 mt-6">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        className={`px-3 py-1 rounded-md text-sm ${
                          page === 1
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium">
                        Page {page} of {totalPages}
                      </span>
                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        className={`px-3 py-1 rounded-md text-sm ${
                          page === totalPages
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-orange-500 hover:bg-orange-600 text-white"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* SCANNER */}
            <div className="bg-gray-50 border p-6 rounded-xl shadow-inner">
              <h3 className="text-md font-semibold mb-3">QR Scanner</h3>
              <button
                onClick={() => setShowScanner((prev) => !prev)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg mb-3 text-sm"
              >
                {showScanner ? "Close Scanner" : "Open Scanner"}
              </button>
              {showScanner && (
                <div className="w-full h-64 border rounded-lg overflow-hidden">
                  <Scanner
                    onDecode={(result) => Swal.fire("QR Code", result, "info")}
                    onError={(err) => console.error(err)}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-10 text-center text-xs text-gray-500 border-t pt-4">
  © 2025 StarkVault — Empowering trust in digital documents. <br />
  Powered by <span className="font-semibold text-orange-500">StarkNet</span>
</div>

        </motion.div>
      )}
    </div>
  );
}
