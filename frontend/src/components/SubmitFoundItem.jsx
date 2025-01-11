import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511";

const SubmitFoundItem = () => {
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

      console.log("Marking item as found...", {
        itemId: selectedItem.id,
        details: formData.foundDetails,
        location: formData.location,
        contact: formData.contact,
      });

      const transaction = await contract.markItemAsFound(
        selectedItem.id,
        formData.foundDetails,
        formData.location,
        formData.contact
      );

      console.log("Transaction sent:", transaction.hash);
      await transaction.wait();
      console.log("Transaction confirmed");

      alert("Found item submitted successfully!");
      navigate("/recent-lost-items");
    } catch (error) {
      console.error("Error:", error);
      alert("Error submitting found item: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Submit Found Item</h2>
          {selectedItem && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800">
                Selected Lost Item
              </h3>
              <p className="text-blue-600">Name: {selectedItem.name}</p>
              <p className="text-blue-600">
                Description: {selectedItem.description}
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Found Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Your Contact Information</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Found Details</label>
              <textarea
                name="foundDetails"
                value={formData.foundDetails}
                onChange={handleChange}
                className="w-full border rounded p-2"
                placeholder="Please provide details about how you found the item..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-blue-500 text-white py-2 rounded ${
                isSubmitting ? "opacity-50" : "hover:bg-blue-600"
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Found Item"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitFoundItem;
