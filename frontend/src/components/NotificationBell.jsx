import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Bell } from "lucide-react";
import { toast } from "react-hot-toast";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const contractAddress = "0x749855Fa678f0731273bF3e35748375CaFb34511";

const NotificationBell = ({ account }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Clean up function to remove event listeners
  const cleanup = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      LostAndFound.abi,
      provider
    );
    contract.removeAllListeners("ItemFound");
    contract.removeAllListeners("NotificationCreated");
  };

  useEffect(() => {
    if (account) {
      fetchNotifications();
      const setupListener = async () => {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(
            contractAddress,
            LostAndFound.abi,
            provider
          );

          contract.on("ItemFound", async (itemId, finder, location) => {
            const item = await contract.lostItems(itemId);
            if (item.reporter.toLowerCase() === account.toLowerCase()) {
              toast.success("Someone found your item!", {
                duration: 5000,
                position: "top-right",
                icon: "🎉",
              });
              fetchNotifications();
            }
          });

          contract.on(
            "NotificationCreated",
            (notificationId, receiver, itemId) => {
              if (receiver.toLowerCase() === account.toLowerCase()) {
                fetchNotifications();
              }
            }
          );
        } catch (error) {
          console.error("Error setting up notification listeners:", error);
        }
      };

      setupListener();
      return cleanup;
    }
  }, [account]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest(".notification-bell")) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      if (!account) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      const userNotifs = await contract.getUserNotifications(account);
      const formattedNotifs = userNotifs
        .filter((notif) => !notif.isRead) // Only show unread notifications
        .map((notif) => ({
          id: notif.id.toString(),
          itemId: notif.itemId.toString(),
          finder: notif.finder,
          message: notif.message,
          finderContact: notif.finderContact,
          isRead: notif.isRead,
          timestamp: new Date(notif.timestamp * 1000).toLocaleString(),
        }));

      setNotifications(formattedNotifs);
      setUnreadCount(formattedNotifs.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        signer
      );

      await contract.markNotificationAsRead(notificationId);
      await fetchNotifications(); // Refresh notifications
      setShowNotifications(false); // Close notification panel after marking as read
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (!account) return null; // Don't render if no account is connected

  return (
    <div className="relative notification-bell">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2"
      >
        <Bell className="h-6 w-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showNotifications && notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Your Notifications</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 rounded-lg bg-blue-50 border border-blue-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-blue-800">
                        New Lead on Your Lost Item!
                      </h4>
                      <p className="text-sm mt-1">{notif.message}</p>
                      <div className="mt-2 text-xs text-gray-600">
                        <p>
                          <span className="font-semibold">
                            Finder's Contact:
                          </span>{" "}
                          {notif.finderContact}
                        </p>
                        <p className="mt-1 text-gray-500">{notif.timestamp}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                    >
                      Mark as read
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
