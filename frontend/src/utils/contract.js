import { ethers } from "ethers";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const CONTRACT_ADDRESS = "0xd8b934580fcE35a11B58C6D73aDeE468a2833fa8";

export const getContract = async (signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, LostAndFound.abi, signer);
};

export const getProvider = () => {
  if (!window.ethereum) {
    throw new Error("Please install MetaMask!");
  }
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
};

// Test functions
export const testContractConnection = async () => {
  try {
    const signer = await getSigner();
    const contract = await getContract(signer);
    const itemCount = await contract.itemCounter();
    console.log(
      "Connected to contract. Current item count:",
      itemCount.toString()
    );
    return true;
  } catch (error) {
    console.error("Contract connection test failed:", error);
    return false;
  }
};

export const testReportLostItem = async () => {
  try {
    const signer = await getSigner();
    const contract = await getContract(signer);

    const tx = await contract.reportLostItem(
      "Test iPhone",
      "Electronics",
      "Test Location",
      "test-image-url.jpg",
      new Date().toISOString(),
      { value: ethers.utils.parseEther("0.01") } // 0.01 ETH as bounty
    );

    await tx.wait();
    console.log("Test lost item reported successfully!");
    return true;
  } catch (error) {
    console.error("Test report lost item failed:", error);
    return false;
  }
};

export const testGetUserItems = async () => {
  try {
    const signer = await getSigner();
    const contract = await getContract(signer);
    const address = await signer.getAddress();

    const lostItems = await contract.getUserLostItems(address);
    console.log("User's lost items:", lostItems);
    return lostItems;
  } catch (error) {
    console.error("Test get user items failed:", error);
    return [];
  }
};
