import { ethers } from "ethers";
import { toast } from "react-hot-toast";

const WalletConnect = ({ account, setAccount }) => {
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        toast.error("Please install MetaMask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);
      toast.success("Wallet connected successfully!");
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("Failed to connect wallet");
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={connectWallet}
        className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200"
      >
        {account ? "Connected" : "Connect Wallet"}
      </button>
      {account && (
        <p className="mt-2 text-sm text-white">
          Connected: {account.slice(0, 6)}...{account.slice(-4)}
        </p>
      )}
    </div>
  );
};

export default WalletConnect;
