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

  useEffect(() => {
    if (account) {
      fetchNotifications();
      setupNotificationListener();
    }
  }, [account]);

  const fetchNotifications = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      const userNotifs = await contract.getUserNotifications(account);
      const formattedNotifs = userNotifs.map((notif) => ({
        id: notif.id.toString(),
        itemId: notif.itemId.toString(),
        finder: notif.finder,
        message: notif.message,
        finderContact: notif.finderContact,
        isRead: notif.isRead,
        timestamp: new Date(notif.timestamp * 1000).toLocaleString(),
      }));

      setNotifications(formattedNotifs);
      setUnreadCount(formattedNotifs.filter((n) => !n.isRead).length);

      const unreadNotifs = formattedNotifs.filter((n) => !n.isRead);
      if (unreadNotifs.length > 0) {
        toast.custom((t) => (
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md">
            <h4 className="font-semibold text-blue-800">New Item Found!</h4>
            <p className="text-sm mt-1">
              Someone has found your lost item. Check your notifications for
              details.
            </p>
          </div>
        ));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const setupNotificationListener = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        contractAddress,
        LostAndFound.abi,
        provider
      );

      contract.on("ItemFound", async (itemId, finder, location) => {
        const item = await contract.getLostItem(itemId);
        if (item.reporter.toLowerCase() === account.toLowerCase()) {
          toast.success("Someone found your item!", {
            duration: 5000,
            position: "top-right",
            icon: "🎉",
          });
          fetchNotifications();
        }
      });

      contract.on("NotificationCreated", (notificationId, receiver, itemId) => {
        if (receiver.toLowerCase() === account.toLowerCase()) {
          fetchNotifications();
        }
      });

      return () => {
        contract.removeAllListeners("ItemFound");
        contract.removeAllListeners("NotificationCreated");
      };
    } catch (error) {
      console.error("Error setting up listeners:", error);
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
      fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <div className="relative">
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

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Your Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500">No notifications yet</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg ${
                      notif.isRead ? "bg-gray-50" : "bg-blue-50"
                    } border ${
                      notif.isRead ? "border-gray-200" : "border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-blue-800">
                          New Lead on Your Lost Item!
                        </h4>
                        <p className="text-sm mt-1">{notif.message}</p>
                        <div className="mt-2 text-xs text-gray-600">
                          <p>
                            <span className="font-semibold">Found at:</span>{" "}
                            {notif.location}
                          </p>
                          <p>
                            <span className="font-semibold">
                              Finder's Contact:
                            </span>{" "}
                            {notif.finderContact}
                          </p>
                          <p className="mt-1 text-gray-500">
                            {notif.timestamp}
                          </p>
                        </div>
                      </div>
                      {!notif.isRead && (
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
