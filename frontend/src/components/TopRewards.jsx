import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511";

const TopRewards = () => {
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopItems();
    setupEventListener();
  }, []);

  const setupEventListener = () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      // Listen for new items and refresh the list
      contract.on("ItemReported", () => {
        fetchTopItems();
      });

      // Listen for items being found
      contract.on("ItemFound", () => {
        fetchTopItems();
      });

      return () => {
        contract.removeAllListeners("ItemReported");
        contract.removeAllListeners("ItemFound");
      };
    } catch (error) {
      console.error("Error setting up event listener:", error);
    }
  };

  const fetchTopItems = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      const itemCount = await contract.getItemCount();
      let items = [];

      for (let i = itemCount; i >= 1; i--) {
        const item = await contract.getLostItem(i);
        if (!item.isFound && !item.rewardClaimed) {
          items.push({
            id: item.id.toString(),
            name: item.name,
            description: item.description,
            location: item.location,
            reward: ethers.utils.formatEther(item.reward),
            timestamp: new Date(item.timestamp * 1000).toLocaleString(),
          });
        }
      }

      // Sort by reward amount (highest first) and take top 5
      items.sort((a, b) => parseFloat(b.reward) - parseFloat(a.reward));
      setTopItems(items.slice(0, 5));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching top items:", error);
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    navigate("/recent-lost-items");
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (index) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
      },
    }),
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold text-white">High Bounties</h2>
        </div>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-2 text-blue-300 hover:text-blue-400 transition-colors"
        >
          View All
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        <div className="grid gap-4">
          {topItems.map((item, index) => (
            <motion.div
              key={item.id}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white/10 backdrop-blur-md rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow relative overflow-hidden border border-white/20"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-1 text-white">
                    {item.name}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                    {item.description}
                  </p>
                  <p className="text-gray-300 text-sm">
                    <span className="font-medium">Location:</span>{" "}
                    {item.location}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                    {item.reward} ETH
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{item.timestamp}</p>
                </div>
              </div>
              {index === 0 && (
                <div className="absolute top-0 right-0 transform translate-x-6 -translate-y-6">
                  <div className="bg-yellow-500/90 text-white text-xs px-8 py-1 rotate-45 backdrop-blur-sm">
                    Top Reward
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {topItems.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-300 py-8"
        >
          <p>No active lost items with rewards</p>
        </motion.div>
      )}
    </div>
  );
};

export default TopRewards;
