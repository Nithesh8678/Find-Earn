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

    mapping(uint256 => LostItem) public lostItems;
    uint256 public itemCount;

    event ItemReported(uint256 indexed id, address reporter, string name);

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
}
