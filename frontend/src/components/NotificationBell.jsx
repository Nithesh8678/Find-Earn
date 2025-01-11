import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Bell } from "lucide-react";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const contractAddress = "0x21300Fb85259788990BA1ECCB5E601263EFfafa8";

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
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const setupNotificationListener = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(
      contractAddress,
      LostAndFound.abi,
      provider
    );

    contract.on("NotificationCreated", (notificationId, receiver, itemId) => {
      if (receiver.toLowerCase() === account.toLowerCase()) {
        fetchNotifications();
      }
    });

    return () => {
      contract.removeAllListeners("NotificationCreated");
    };
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
