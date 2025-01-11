import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Navbar from "./Navbar";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const contractAddress = "0x832f40a4cC0002654c3B918F3E9a4124Eff637AF";

function RecentLostItems() {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    connectAndFetchItems();
  }, []);

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

      console.log("Getting item count...");
      const itemCount = await contract.getItemCount();
      console.log("Total items:", itemCount.toString());

      const items = [];
      for (let i = itemCount; i >= 1; i--) {
        console.log("Fetching item", i);
        const item = await contract.getLostItem(i);
        console.log("Item data:", item);
        items.push({
          id: item.id.toString(),
          reporter: item.reporter,
          name: item.name,
          description: item.description,
          location: item.location,
          contact: item.contact,
          isFound: item.isFound,
          timestamp: new Date(item.timestamp * 1000).toLocaleString(),
        });
      }

      console.log("All items:", items);
      setLostItems(items);
      setError(null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Failed to fetch items. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Recent Lost Items
        </h2>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lostItems.map((item) => (
              <div
                key={item.id}
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
                    <strong>Reported:</strong> {item.timestamp}
                  </p>
                  <p className="text-xs mt-2 truncate">
                    <strong>Reporter:</strong>{" "}
                    <span className="font-mono">{item.reporter}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentLostItems;
