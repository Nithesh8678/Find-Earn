import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Wallet,
  Search,
  AlertCircle,
  Package,
  CheckCircle,
} from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511";

const Dashboard = ({ account }) => {
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("lost"); // "lost" or "found"

  useEffect(() => {
    if (account) {
      fetchUserItems();
      setupEventListeners();
    }
    return () => removeEventListeners();
  }, [account]);

  const setupEventListeners = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      // Listen for new lost items
      contract.on("ItemReported", (id, reporter) => {
        if (reporter.toLowerCase() === account.toLowerCase()) {
          fetchUserItems();
        }
      });

      // Listen for items being found
      contract.on("ItemFound", (id, finder) => {
        fetchUserItems();
      });

      // Listen for reward claims
      contract.on("RewardClaimed", (itemId, finder) => {
        fetchUserItems();
      });
    } catch (error) {
      console.error("Error setting up event listeners:", error);
    }
  };

  const removeEventListeners = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      LostAndFound.abi,
      provider
    );
    contract.removeAllListeners("ItemReported");
    contract.removeAllListeners("ItemFound");
    contract.removeAllListeners("RewardClaimed");
  };

  const fetchUserItems = async () => {
    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      const itemCount = await contract.itemCount();
      const lost = [];
      const found = [];

      // Fetch all items in parallel for better performance
      const promises = [];
      for (let i = itemCount; i >= 1; i--) {
        promises.push(contract.lostItems(i));
      }

      const items = await Promise.all(promises);

      // Process items
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const formattedItem = {
          id: (itemCount - i).toString(),
          name: item.name,
          description: item.description,
          location: item.location,
          contact: item.contact,
          isFound: item.isFound,
          timestamp: new Date(item.timestamp * 1000).toLocaleString(),
          reward: ethers.utils.formatEther(item.reward),
          rewardClaimed: item.rewardClaimed,
          reporter: item.reporter,
        };

        // Check if this is user's lost item
        if (item.reporter.toLowerCase() === account.toLowerCase()) {
          lost.push(formattedItem);
        }

        // Check if user has found this item
        if (item.isFound) {
          try {
            const notifications = await contract.getUserNotifications(account);
            const isFoundByUser = notifications.some(
              (notif) =>
                notif.itemId.toString() === formattedItem.id &&
                notif.finder.toLowerCase() === account.toLowerCase()
            );
            if (isFoundByUser) {
              found.push(formattedItem);
            }
          } catch (error) {
            console.error("Error checking notifications:", error);
          }
        }
      }

      setLostItems(lost);
      setFoundItems(found);
      setError(null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch your items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ label, count, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
        isActive
          ? "bg-purple-500 text-white"
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }`}
    >
      {label === "Lost Items" ? (
        <Package className="h-5 w-5" />
      ) : (
        <CheckCircle className="h-5 w-5" />
      )}
      {label}
      <span
        className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
          isActive ? "bg-white/20" : "bg-gray-700"
        }`}
      >
        {count}
      </span>
    </button>
  );

  const ItemCard = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-white">{item.name}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            item.isFound
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {item.isFound ? "Found" : "Lost"}
        </span>
      </div>

      <p className="text-gray-400 mb-4">{item.description}</p>

      <div className="space-y-2 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-purple-400" />
          <span>{item.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>{item.timestamp}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-purple-400" />
          <span className="font-medium text-purple-400">
            {item.reward} ETH{" "}
            {item.rewardClaimed && (
              <span className="text-green-400">(Claimed)</span>
            )}
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar account={account} />
        <div className="container mx-auto px-4 py-24">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading your items...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar account={account} />
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4 font-iceberg">
            Your Dashboard
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Track all your lost items and items you've found to help others.
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-8">
          <TabButton
            label="Lost Items"
            count={lostItems.length}
            isActive={activeTab === "lost"}
            onClick={() => setActiveTab("lost")}
          />
          <TabButton
            label="Found Items"
            count={foundItems.length}
            isActive={activeTab === "found"}
            onClick={() => setActiveTab("found")}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(activeTab === "lost" ? lostItems : foundItems).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </motion.div>
        </AnimatePresence>

        {(activeTab === "lost" ? lostItems : foundItems).length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-xl text-gray-400">
              No {activeTab === "lost" ? "lost" : "found"} items yet
            </p>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
