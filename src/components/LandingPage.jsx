import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const LandingPage = ({ onNavigate }) => {
  const { address, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
        {/* Logo/Icon */}
        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-2xl font-semibold">A</span>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Bin_Ladens Chat
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Connect your wallet to register and start chatting
        </p>

        <div className="space-y-6">
          <ConnectButton />

          {isConnected && (
            <div className="space-y-4 animate-fadeIn">
              <p className="text-xs text-gray-400 font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => onNavigate("register")}
                  className="w-full bg-blue-500 text-white py-2.5 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm font-normal shadow-sm"
                >
                  Register Profile
                </button>
                <button
                  onClick={() => onNavigate("users")}
                  className="w-full bg-white text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200 text-sm font-normal"
                >
                  View Users
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
