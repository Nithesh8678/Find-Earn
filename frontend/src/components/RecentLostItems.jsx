import { useState, useEffect } from "react";
import { ethers } from "ethers";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const contractAddress = "0x832f40a4cC0002654c3B918F3E9a4124Eff637AF";

function RecentLostItems() {
  const [lostItems, setLostItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLostItems();
  }, []);

  async function fetchLostItems() {
    try {
      console.log("Fetching lost items...");
      if (typeof window.ethereum !== "undefined") {
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
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setLoading(false);
    }
  }

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Recent Lost Items</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lostItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
            <p className="text-gray-600 mb-2">{item.description}</p>
            <div className="text-sm text-gray-500">
              <p>
                <strong>Location:</strong> {item.location}
              </p>
              <p>
                <strong>Contact:</strong> {item.contact}
              </p>
              <p>
                <strong>Status:</strong> {item.isFound ? "Found" : "Still Lost"}
              </p>
              <p>
                <strong>Reported:</strong> {item.timestamp}
              </p>
              <p className="text-xs mt-2">
                <strong>Reporter:</strong> {item.reporter}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentLostItems;
