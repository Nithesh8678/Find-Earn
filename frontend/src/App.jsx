import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import WalletConnect from "./components/WalletConnect";
import Home from "./components/Home";
import ReportLostItem from "./components/ReportLostItem";
import SubmitFoundItem from "./components/SubmitFoundItem";
import ProfilePage from "./components/ProfilePage";
import ContractTest from "./components/ContractTest";
import { ethers } from "ethers";
import LostAndFound from "./artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import RecentLostItems from "./components/RecentLostItems";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import Dashboard from "./components/Dashboard";
import ImageSlider from "./components/ImageSlider";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511"; // You'll get this after deployment

function App() {
  const [account, setAccount] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
  });

  // Check for existing connection on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();

        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Listen for account changes
          window.ethereum.on("accountsChanged", handleAccountsChanged);
          // Listen for chain changes
          window.ethereum.on("chainChanged", handleChainChanged);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
    } else {
      handleDisconnect();
    }
  };

  const handleChainChanged = () => {
    // Reload the page when chain changes
    window.location.reload();
  };

  const handleDisconnect = () => {
    setAccount("");
    // Remove listeners
    if (window.ethereum) {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    }
    toast.success("Wallet disconnected");
  };

  // Show loading state while checking connection
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    try {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        signer
      );

      const transaction = await contract.reportLostItem(
        formData.name,
        formData.description,
        formData.location,
        formData.contact
      );

      await transaction.wait();
      alert("Lost item reported successfully!");

      // Clear form
      setFormData({
        name: "",
        description: "",
        location: "",
        contact: "",
      });
    } catch (error) {
      console.error("Error:", error);
      alert("Error reporting lost item!");
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Router basename="/">
      <div className="min-h-screen">
        <Toaster />
        <Routes>
          <Route
            path="/"
            element={
              account ? (
                <Navigate to="/home" />
              ) : (
                <div className="min-h-screen flex flex-col items-center justify-center login-bg">
                  <div>
                    <ImageSlider />
                    <h1 className="text-4xl font-bold text-white mb-4 font-iceberg">
                      Find&Earn
                    </h1>
                  </div>
                  <div className="p-8 rounded-lg backdrop-blur-md mt-8">
                    <WalletConnect account={account} setAccount={setAccount} />
                  </div>
                </div>
              )
            }
          />
          <Route
            path="/home"
            element={
              account ? (
                <Home account={account} onDisconnect={handleDisconnect} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/report-lost"
            element={
              account ? (
                <ReportLostItem account={account} />
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/profile"
            element={
              account ? <ProfilePage account={account} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/recent-lost-items"
            element={
              account ? (
                <RecentLostItems account={account} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/submit-found"
            element={
              account ? (
                <SubmitFoundItem account={account} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              account ? <Dashboard account={account} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
