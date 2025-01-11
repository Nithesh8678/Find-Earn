import { ethers } from "ethers";
import { useState } from "react";
import ImageSlider from "./ImageSlider";

const WalletConnect = ({ account, setAccount }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert(error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="wallet-connect">
      <ImageSlider />
      {!account ? (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-purple-600 hover:bg-purple-700 mt-10 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      ) : (
        <div>
          <p className="text-gray-200">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
