import { useState } from "react";
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

const contractAddress = "0x21300Fb85259788990BA1ECCB5E601263EFfafa8"; // You'll get this after deployment

function App() {
  const [account, setAccount] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
  });

  const handleDisconnect = () => {
    setAccount("");
  };

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
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/"
            element={
              account ? (
                <Navigate to="/home" />
              ) : (
                <div className="min-h-screen flex items-center justify-center login-bg">
                  <div className="absolute top-8 left-8">
                    <h1 className="text-4xl font-bold text-white mb-4 font-iceberg">
                      Find&Earn
                    </h1>
                  </div>
                  <div className="p-8 rounded-lg backdrop-blur-md">
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
