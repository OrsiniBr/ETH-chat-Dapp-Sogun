// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract Register {
    uint256 private suffixNumber;
    string private constant SUFFIX_STRING = ".eth";
    
    struct User {
        string name;
        address userAddress;
        string ensName;
        string image; // IPFS URL (e.g., "ipfs://QmXyz...") or HTTP gateway URL
    }

    mapping(address => User) public addressToUser;
    address[] private allUsers;

    event UserRegistered(address indexed userAddress, string ensName);
    event ProfileUpdated(address indexed userAddress);

    /**
     * @dev Register a new user with IPFS image
     * @param _name User's display name
     * @param _image IPFS URL of profile image (e.g., "ipfs://QmXyz..." or "https://ipfs.io/ipfs/QmXyz...")
     */
    function register(string memory _name, string memory _image) external {
        require(addressToUser[msg.sender].userAddress == address(0), "Already registered");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_image).length > 0, "Image URL cannot be empty");
        
        string memory _ensName = createEnsName(_name);
        User memory newUser = User(_name, msg.sender, _ensName, _image);
        addressToUser[msg.sender] = newUser;
        allUsers.push(msg.sender);
        
        emit UserRegistered(msg.sender, _ensName);
    }

    // Get single user with IPFS image URL
    function getUser(address _userAddress) external view returns (User memory) {
        require(addressToUser[_userAddress].userAddress != address(0), "User not registered");
        return addressToUser[_userAddress];
    }

    // Get ALL users with their IPFS image URLs
    function getAllUsers() external view returns (User[] memory) {
        User[] memory users = new User[](allUsers.length);
        for (uint256 i = 0; i < allUsers.length; i++) {
            users[i] = addressToUser[allUsers[i]];
        }
        return users;
    }

    // Get multiple users by addresses (for group chat members)
    function getUsers(address[] calldata _addresses) external view returns (User[] memory) {
        User[] memory users = new User[](_addresses.length);
        for (uint256 i = 0; i < _addresses.length; i++) {
            users[i] = addressToUser[_addresses[i]];
        }
        return users;
    }

    // Get total user count
    function getTotalUsers() external view returns (uint256) {
        return allUsers.length;
    }

    // Get all user addresses
    function getAllUserAddresses() external view returns (address[] memory) {
        return allUsers;
    }

    function createEnsName(string memory name) public returns (string memory) {
        string memory ensName = string(
            abi.encodePacked(name, uintToString(suffixNumber), SUFFIX_STRING)
        );
        suffixNumber++;
        return ensName;
    }

    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits--;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}