"use client";  // Add this because Navbar uses WalletConnect (which has useState)
import React from "react";
import WalletConnect from "./WalletConnect";

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">StarkVault</h1>
      <WalletConnect />
    </nav>
  );
};

export default Navbar;
