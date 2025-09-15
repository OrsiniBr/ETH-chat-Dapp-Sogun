"use client";
import Navbar from "./components/Navbar";
import { useState } from "react";
import IPFSUpload from "./components/IPFSUpload";
import { useWriteContract } from "wagmi";
import { CHAT_REGISTRY_ABI, CHAT_REGISTRY_ADDRESS } from "./config/contracts";

export default function Registration() {
  const [name, setName] = useState("");
  const [ipfsImageUrl, setIpfsImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const handleUploadComplete = (ipfsHash: string) => {
    const ipfsUrl = `ipfs://${ipfsHash}`;
    setIpfsImageUrl(ipfsUrl);
  };

  const handleRegister = async () => {
    if (!name || !ipfsImageUrl) return;

    try {
      await writeContractAsync({
        address: CHAT_REGISTRY_ADDRESS as `0x${string}`,
        abi: CHAT_REGISTRY_ABI,
        functionName: "register",
        args: [name, ipfsImageUrl],
      });
      // Registration successful!
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <Navbar />
      <h2 className="text-2xl font-bold text-white mb-6">Create Profile</h2>

      <div className="mb-6">
        <label className="block text-white mb-2">Display Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-cyan-400 focus:outline-none"
          placeholder="Enter your name"
        />
      </div>

      <div className="mb-6">
        <label className="block text-white mb-2">Profile Picture</label>
        <IPFSUpload
          onUploadComplete={handleUploadComplete}
          onUploadStart={() => setIsUploading(true)}
        />
      </div>

      <button
        onClick={handleRegister}
        disabled={!name || !ipfsImageUrl || isUploading}
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isUploading ? "Creating Profile..." : "Create Profile"}
      </button>
    </div>
  );
}
