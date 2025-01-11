import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { MapPin, Clock, Wallet, Send, AlertTriangle } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import { toast } from "react-hot-toast";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511";

const ReportLostItem = ({ account }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    contact: "",
    reward: "", // ETH amount
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        signer
      );

      // Convert ETH to Wei
      const rewardInWei = ethers.utils.parseEther(formData.reward);

      const transaction = await contract.reportLostItem(
        formData.name,
        formData.description,
        formData.location,
        formData.contact,
        { value: rewardInWei }
      );

      await transaction.wait();
      toast.success("Lost item reported successfully with reward!", {
        duration: 5000,
        position: "top-right",
      });

      // Clear form
      setFormData({
        name: "",
        description: "",
        location: "",
        contact: "",
        reward: "",
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error reporting lost item: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar account={account} />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 font-iceberg">
                Report Lost Item
              </h2>
              <p className="text-gray-400">
                Provide detailed information about your lost item to help others
                identify it. Set a reward to increase the chances of recovery.
              </p>
            </div>

            {/* Important Notice Card */}
            <div className="mb-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-yellow-500 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-500 mb-2">
                    Important Notice
                  </h3>
                  <p className="text-yellow-200/80 text-sm">
                    The reward amount you set will be locked in the contract and
                    automatically transferred to the finder once you verify and
                    approve the found item. Make sure to set an appropriate
                    reward amount.
                  </p>
                </div>
              </div>
            </div>

            {/* Report Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">Item Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="What did you lose?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Last Seen Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="Where did you last see it?"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white mb-2">
                  Item Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 h-32"
                  placeholder="Provide detailed description including color, size, distinctive marks, etc..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white mb-2">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                    placeholder="How can finders reach you?"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Reward Amount (ETH)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      name="reward"
                      value={formData.reward}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      placeholder="e.g., 0.1"
                      required
                    />
                    <Wallet className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    This amount will be locked until item is found
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReportLostItem;
