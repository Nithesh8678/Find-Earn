// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LostAndFound {
    struct Item {
        uint256 id;
        address owner;
        string name;
        string category;
        string location;
        string imageUrl;
        uint256 bountyAmount;
        bool isFound;
        bool isReturned;
        string date;
    }

    uint256 private itemCounter = 0;
    mapping(uint256 => Item) public items;
    mapping(address => uint256[]) public userLostItems;
    mapping(address => uint256[]) public userFoundItems;

    event ItemReported(uint256 indexed id, address indexed owner, string name);
    event ItemFound(uint256 indexed id, address indexed finder);
    event ItemReturned(uint256 indexed id, address indexed finder, uint256 bounty);

    function reportLostItem(
        string memory _name,
        string memory _category,
        string memory _location,
        string memory _imageUrl,
        string memory _date
    ) public payable {
        require(msg.value > 0, "Bounty amount must be greater than 0");

        itemCounter++;
        items[itemCounter] = Item(
            itemCounter,
            msg.sender,
            _name,
            _category,
            _location,
            _imageUrl,
            msg.value,
            false,
            false,
            _date
        );

        userLostItems[msg.sender].push(itemCounter);
        emit ItemReported(itemCounter, msg.sender, _name);
    }

    function reportFoundItem(
        uint256 _itemId,
        string memory _location,
        string memory _date
    ) public {
        require(_itemId <= itemCounter, "Item does not exist");
        require(!items[_itemId].isFound, "Item already marked as found");
        
        Item storage item = items[_itemId];
        item.isFound = true;
        item.location = _location;
        item.date = _date;
        
        userFoundItems[msg.sender].push(_itemId);
        emit ItemFound(_itemId, msg.sender);
    }

    function confirmReturn(uint256 _itemId, address _finder) public {
        require(_itemId <= itemCounter, "Item does not exist");
        Item storage item = items[_itemId];
        require(msg.sender == item.owner, "Only owner can confirm return");
        require(item.isFound && !item.isReturned, "Invalid item state");

        item.isReturned = true;
        payable(_finder).transfer(item.bountyAmount);
        emit ItemReturned(_itemId, _finder, item.bountyAmount);
    }

    function getUserLostItems(address _user) public view returns (uint256[] memory) {
        return userLostItems[_user];
    }

    function getUserFoundItems(address _user) public view returns (uint256[] memory) {
        return userFoundItems[_user];
    }

    function getItem(uint256 _itemId) public view returns (Item memory) {
        require(_itemId <= itemCounter, "Item does not exist");
        return items[_itemId];
    }
} 