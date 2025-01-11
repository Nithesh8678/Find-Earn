import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MapPin,
  Clock,
  Wallet,
  AlertCircle,
  Filter,
  SortDesc,
} from "lucide-react";
import Navbar from "./Navbar";
import ConfirmationDialog from "./ConfirmationDialog";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import Footer from "./Footer";

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
  const [sortBy, setSortBy] = useState("latest"); // "latest", "reward"
  const [filterStatus, setFilterStatus] = useState("all"); // "all", "lost", "found"

  useEffect(() => {
    if (account) {
      connectAndFetchItems();
    }
  }, [account]);

  useEffect(() => {
    setFilteredItems(lostItems);
  }, [lostItems]);

  useEffect(() => {
    filterItems(searchQuery);
  }, [lostItems, searchQuery]);

  const filterItems = (query) => {
    if (!query) {
      setFilteredItems(lostItems);
      return;
    }

    try {
      const lowercaseQuery = query.toLowerCase().trim();
      const filtered = lostItems.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(lowercaseQuery)) ||
          (item.description &&
            item.description.toLowerCase().includes(lowercaseQuery)) ||
          (item.location &&
            item.location.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredItems(filtered);
    } catch (error) {
      console.error("Error filtering items:", error);
      setFilteredItems(lostItems);
    }
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

      setLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      await fetchLostItems();
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect to wallet");
    } finally {
      setLoading(false);
    }
  }

  async function fetchLostItems() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      const itemCount = await contract.itemCount();
      const items = [];

      for (let i = itemCount; i >= 1; i--) {
        try {
          const item = await contract.lostItems(i);
          items.push({
            id: i.toString(),
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
        } catch (itemError) {
          console.error(`Error fetching item ${i}:`, itemError);
        }
      }

      setLostItems(items);
      setFilteredItems(items); // Initialize filtered items
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const sortAndFilterItems = (items) => {
    if (!items || !Array.isArray(items)) return [];

    let result = [...items];

    try {
      // Apply filter
      if (filterStatus !== "all") {
        result = result.filter((item) =>
          filterStatus === "found" ? item.isFound : !item.isFound
        );
      }

      // Apply sort
      result.sort((a, b) => {
        if (sortBy === "reward") {
          return parseFloat(b.reward || 0) - parseFloat(a.reward || 0);
        }
        // Default to latest
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      });

      return result;
    } catch (error) {
      console.error("Error in sortAndFilterItems:", error);
      return items;
    }
  };

  const FilterButton = ({ label, value, current, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        current === value
          ? "bg-purple-500 text-white"
          : "bg-white/5 text-gray-400 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar account={account} onSearch={handleSearch} />

      <div className="container mx-auto px-4 py-24">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-white mb-4 font-iceberg">
            Recently Lost Items
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Browse through recently reported lost items and help return them to
            their owners. Each successful return comes with a reward!
          </p>
        </motion.div>

        {/* Filters and Sort Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap gap-4 justify-center items-center"
        >
          <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
            <Filter className="h-4 w-4 text-purple-400 ml-3" />
            <FilterButton
              label="All Items"
              value="all"
              current={filterStatus}
              onClick={setFilterStatus}
            />
            <FilterButton
              label="Lost"
              value="lost"
              current={filterStatus}
              onClick={setFilterStatus}
            />
            <FilterButton
              label="Found"
              value="found"
              current={filterStatus}
              onClick={setFilterStatus}
            />
          </div>

          <div className="flex items-center gap-2 bg-white/5 rounded-full p-1">
            <SortDesc className="h-4 w-4 text-purple-400 ml-3" />
            <FilterButton
              label="Latest"
              value="latest"
              current={sortBy}
              onClick={setSortBy}
            />
            <FilterButton
              label="Highest Reward"
              value="reward"
              current={sortBy}
              onClick={setSortBy}
            />
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-8"
          >
            <div className="flex items-center justify-center gap-2 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <button
              onClick={connectAndFetchItems}
              className="mt-2 text-blue-400 underline hover:text-blue-300"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-400">Loading items...</p>
          </div>
        ) : sortAndFilterItems(filteredItems).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-xl text-gray-400">
              No items found matching your criteria
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {sortAndFilterItems(filteredItems).map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  layout
                  className="group bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {item.name}
                      </h3>
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

                    <p className="text-gray-400 mb-4 line-clamp-2">
                      {item.description}
                    </p>

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
                          {item.reward} ETH Reward
                        </span>
                      </div>
                    </div>

                    {isItemOwner(item) && (
                      <div className="mt-4 pb-2 border-t border-gray-800 pt-4">
                        <p className="text-sm text-purple-400">
                          You reported this item
                        </p>
                      </div>
                    )}

                    <div className="mt-4">{renderItemActions(item)}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        <ConfirmationDialog
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          onConfirm={handleConfirmReward}
          itemName={selectedItemForReward?.name}
        />
      </div>

      <Footer />
    </div>
  );
}

export default RecentLostItems;
