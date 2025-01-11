import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { MapPin, Clock, Wallet, AlertCircle, Send } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";
import { toast } from "react-hot-toast";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511";

const SubmitFoundItem = ({ account }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedItem = location.state?.selectedItem;

  const [formData, setFormData] = useState({
    location: "",
    contact: "",
    foundDetails: "",
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
      if (!selectedItem?.id) {
        throw new Error("No item selected");
      }

      if (typeof window.ethereum === "undefined") {
        throw new Error("Please install MetaMask!");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        signer
      );

      const transaction = await contract.markItemAsFound(
        selectedItem.id,
        formData.foundDetails,
        formData.location,
        formData.contact
      );

      await transaction.wait();
      toast.success("Item marked as found! The owner will be notified.", {
        duration: 5000,
        position: "top-right",
      });

      navigate("/recent-lost-items");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error submitting found item: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedItem) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar account={account} />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">
              No Item Selected
            </h2>
            <p className="text-gray-400 mb-8">
              Please select an item from the lost items list to report it as
              found.
            </p>
            <button
              onClick={() => navigate("/recent-lost-items")}
              className="bg-purple-500 text-white px-6 py-2 rounded-full hover:bg-purple-600 transition-colors"
            >
              View Lost Items
            </button>
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
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10"
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-4 font-iceberg">
                Submit Found Item
              </h2>
              <p className="text-gray-400">
                You're reporting that you've found this item. Please provide
                accurate details to help verify your find.
              </p>
            </div>

            {/* Item Details Card */}
            <div className="mb-8 bg-white/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">
                Item Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-2">
                    <span className="font-medium text-white">Name:</span>{" "}
                    {selectedItem.name}
                  </p>
                  <p className="text-gray-400 mb-2">
                    <span className="font-medium text-white">Description:</span>{" "}
                    {selectedItem.description}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="h-4 w-4 text-purple-400" />
                    <span>Last seen at: {selectedItem.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span>Reported: {selectedItem.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Wallet className="h-4 w-4 text-purple-400" />
                    <span className="font-medium text-purple-400">
                      {selectedItem.reward} ETH Reward
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Found Details Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white mb-2">Found Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="Where did you find the item?"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">
                  Your Contact Info
                </label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  placeholder="How can the owner reach you?"
                  required
                />
              </div>

              <div>
                <label className="block text-white mb-2">Found Details</label>
                <textarea
                  name="foundDetails"
                  value={formData.foundDetails}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 h-32"
                  placeholder="Please provide details about how and where you found the item..."
                  required
                />
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
                    <span>Submit Found Report</span>
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

export default SubmitFoundItem;
