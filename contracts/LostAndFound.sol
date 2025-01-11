// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LostAndFound {
    struct LostItem {
        uint256 id;
        address reporter;
        string name;
        string description;
        string location;
        string contact;
        bool isFound;
        uint256 timestamp;
    }

    struct Notification {
        uint256 id;
        uint256 itemId;
        address finder;
        address receiver;
        string message;
        string finderContact;
        bool isRead;
        uint256 timestamp;
    }

    mapping(uint256 => LostItem) public lostItems;
    mapping(uint256 => Notification) public notifications;
    mapping(address => uint256[]) public userNotifications;
    
    uint256 public itemCount;
    uint256 public notificationCount;

    event ItemReported(uint256 indexed id, address reporter, string name);
    event ItemFound(uint256 indexed id, address finder, string foundLocation);
    event NotificationCreated(uint256 indexed notificationId, address indexed receiver, uint256 itemId);

    function reportLostItem(
        string memory _name,
        string memory _description,
        string memory _location,
        string memory _contact
    ) public {
        itemCount++;
        lostItems[itemCount] = LostItem(
            itemCount,
            msg.sender,
            _name,
            _description,
            _location,
            _contact,
            false,
            block.timestamp
        );

        emit ItemReported(itemCount, msg.sender, _name);
    }

    function getLostItem(uint256 _id) public view returns (
        uint256 id,
        address reporter,
        string memory name,
        string memory description,
        string memory location,
        string memory contact,
        bool isFound,
        uint256 timestamp
    ) {
        LostItem memory item = lostItems[_id];
        return (
            item.id,
            item.reporter,
            item.name,
            item.description,
            item.location,
            item.contact,
            item.isFound,
            item.timestamp
        );
    }

    function getItemCount() public view returns (uint256) {
        return itemCount;
    }

    function markItemAsFound(
        uint256 _itemId,
        string memory _foundDetails,
        string memory _foundLocation,
        string memory _finderContact
    ) public {
        require(_itemId > 0 && _itemId <= itemCount, "Invalid item ID");
        require(!lostItems[_itemId].isFound, "Item already marked as found");
        
        LostItem storage item = lostItems[_itemId];
        
        // Create notification for the item reporter
        notificationCount++;
        notifications[notificationCount] = Notification(
            notificationCount,
            _itemId,
            msg.sender,
            item.reporter,
            _foundDetails,
            _finderContact,
            false,
            block.timestamp
        );
        
        userNotifications[item.reporter].push(notificationCount);
        
        item.isFound = true;
        
        emit ItemFound(_itemId, msg.sender, _foundLocation);
        emit NotificationCreated(notificationCount, item.reporter, _itemId);
    }

    function getUserNotifications(address _user) public view returns (
        Notification[] memory
    ) {
        uint256[] storage userNotifIds = userNotifications[_user];
        Notification[] memory userNotifs = new Notification[](userNotifIds.length);
        
        for(uint i = 0; i < userNotifIds.length; i++) {
            userNotifs[i] = notifications[userNotifIds[i]];
        }
        
        return userNotifs;
    }

    function markNotificationAsRead(uint256 _notificationId) public {
        require(_notificationId > 0 && _notificationId <= notificationCount, "Invalid notification ID");
        require(notifications[_notificationId].receiver == msg.sender, "Not authorized");
        
        notifications[_notificationId].isRead = true;
    }
}
