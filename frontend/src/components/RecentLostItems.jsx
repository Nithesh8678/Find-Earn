import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import ConfirmationDialog from "./ConfirmationDialog";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import { motion, AnimatePresence } from "framer-motion";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511";

function RecentLostItems({ account }) {
  const [lostItems, setLostItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedItemForReward, setSelectedItemForReward] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (account) {
      connectAndFetchItems();
    }
  }, [account]);

  useEffect(() => {
    filterItems(searchQuery);
  }, [lostItems, searchQuery]);

  const filterItems = (query) => {
    if (!query) {
      setFilteredItems(lostItems);
      return;
    }

    const lowercaseQuery = query.toLowerCase();
    const filtered = lostItems.filter(
      (item) =>
        item.name.toLowerCase().includes(lowercaseQuery) ||
        item.description.toLowerCase().includes(lowercaseQuery) ||
        item.location.toLowerCase().includes(lowercaseQuery)
    );
    setFilteredItems(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleItemClick = (item) => {
    navigate("/submit-found", {
      state: {
        selectedItem: item,
      },
    });
  };

  async function connectAndFetchItems() {
    try {
      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask!");
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await fetchLostItems();
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  async function fetchLostItems() {
    try {
      console.log("Fetching lost items...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      const itemCount = await contract.getItemCount();
      const items = [];
      for (let i = itemCount; i >= 1; i--) {
        const item = await contract.getLostItem(i);
        items.push({
          id: item.id.toString(),
          reporter: item.reporter,
          name: item.name,
          description: item.description,
          location: item.location,
          contact: item.contact,
          isFound: item.isFound,
          timestamp: new Date(item.timestamp * 1000).toLocaleString(),
          reward: ethers.utils.formatEther(item.reward),
          rewardClaimed: item.rewardClaimed,
        });
      }

      setLostItems(items);
      setError(null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleClaimReward = async (itemId) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        signer
      );

      const transaction = await contract.claimReward(itemId);
      await transaction.wait();

      alert("Reward claimed successfully!");
      fetchLostItems();
    } catch (error) {
      console.error("Error claiming reward:", error);
      alert("Error claiming reward: " + error.message);
    }
  };

  const handleVerifyClick = (item) => {
    setSelectedItemForReward(item);
    setShowConfirmation(true);
  };

  const handleConfirmReward = async () => {
    if (!selectedItemForReward) return;

    try {
      await handleClaimReward(selectedItemForReward.id);
      setShowConfirmation(false);
      setSelectedItemForReward(null);
    } catch (error) {
      console.error("Error in confirmation:", error);
    }
  };

  const isItemOwner = (item) => {
    return account && item.reporter.toLowerCase() === account.toLowerCase();
  };

  const renderItemActions = (item) => {
    if (!item.isFound) {
      return (
        <button
          onClick={() => handleItemClick(item)}
          className="w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          I Found This Item
        </button>
      );
    }

    if (item.rewardClaimed) {
      return (
        <p className="text-sm text-green-500 mt-2">✓ Reward has been claimed</p>
      );
    }

    if (item.isFound && !item.rewardClaimed) {
      if (isItemOwner(item)) {
        return (
          <button
            onClick={() => handleVerifyClick(item)}
            className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition-colors"
          >
            Verify & Release Reward
          </button>
        );
      } else {
        return (
          <p className="text-sm text-orange-500 mt-2">
            Waiting for owner verification
          </p>
        );
      }
    }

    return null;
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar account={account} onSearch={handleSearch} />
      <div className="container mx-auto px-4 py-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-6 text-center"
        >
          Recent Lost Items
        </motion.h2>

        {error && (
          <div className="text-red-500 text-center mb-4">
            Error: {error}
            <button
              onClick={connectAndFetchItems}
              className="ml-4 text-blue-500 underline"
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading items...</p>
          </div>
        ) : lostItems.length === 0 ? (
          <div className="text-center text-gray-600">
            <p className="text-xl">No lost items reported yet.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
                >
                  <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <p>
                      <strong>Location:</strong> {item.location}
                    </p>
                    <p>
                      <strong>Contact:</strong> {item.contact}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`${
                          item.isFound ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {item.isFound ? "Found" : "Still Lost"}
                      </span>
                    </p>
                    <p>
                      <strong>Reward:</strong>{" "}
                      <span className="text-green-600 font-semibold">
                        {item.reward} ETH
                      </span>
                    </p>
                    <p>
                      <strong>Reported:</strong> {item.timestamp}
                    </p>
                    {isItemOwner(item) && (
                      <p className="text-xs mt-2 text-blue-500">
                        You reported this item
                      </p>
                    )}
                    <div className="mt-4">{renderItemActions(item)}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {filteredItems.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 mt-8"
          >
            <p className="text-xl">No items found matching your search</p>
          </motion.div>
        )}

        <ConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmReward}
          itemName={selectedItemForReward?.name}
        />
      </div>
    </div>
  );
}

export default RecentLostItems;
