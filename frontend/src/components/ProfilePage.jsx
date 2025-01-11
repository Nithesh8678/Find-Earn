import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Edit2, MapPin, Clock, Award } from "lucide-react";
import Navbar from "./Navbar";
import Button from "./ui/Button";
import { useContract } from "../contexts/ContractContext";

const ProfilePage = ({ account }) => {
  const { getUserItems } = useContract();
  const [items, setItems] = useState({ lostItems: [], foundItems: [] });

  useEffect(() => {
    const fetchItems = async () => {
      if (account) {
        const userItems = await getUserItems(account);
        setItems(userItems);
      }
    };

    fetchItems();
  }, [account]);

  const [activeTab, setActiveTab] = useState("lost");

  return (
    <div
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url("/homebg.png")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="container mx-auto px-4 pt-20">
        <Navbar />

        {/* Profile Header */}
        <div className="mt-8">
          <Link to="/home">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/90 hover:text-white"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>

          <div className="mt-6 bg-white/10 backdrop-blur-md rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {account ? account.substring(0, 2) : ""}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {account
                      ? `${account.substring(0, 6)}...${account.substring(38)}`
                      : ""}
                  </h2>
                  <p className="text-purple-400 mt-1">Member since Feb 2024</p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-white/80">
                      <MapPin className="h-4 w-4" />
                      <span>New York</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/80">
                      <Clock className="h-4 w-4" />
                      <span>5 items reported</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/80">
                      <Award className="h-4 w-4" />
                      <span>3 items returned</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-white hover:text-purple-400"
              >
                <Edit2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 border-b border-white/20">
          <div className="flex gap-8">
            <button
              className={`pb-4 text-lg font-medium transition-colors duration-200 ${
                activeTab === "lost"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setActiveTab("lost")}
            >
              Lost Items
            </button>
            <button
              className={`pb-4 text-lg font-medium transition-colors duration-200 ${
                activeTab === "found"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-white/70 hover:text-white"
              }`}
              onClick={() => setActiveTab("found")}
            >
              Found Items
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(activeTab === "lost" ? items.lostItems : items.foundItems).map(
            (item) => (
              <div
                key={item.id}
                className="bg-white/10 backdrop-blur-md rounded-lg p-6 hover:bg-white/20 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {item.name}
                    </h3>
                    <p className="text-purple-400 mt-1">{item.category}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      item.status === "Active"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="h-4 w-4" />
                    <span>{item.date}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <span className="text-purple-400 font-medium">
                      {activeTab === "lost"
                        ? `Bounty: ${item.bounty}`
                        : `Reward: ${item.reward}`}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
