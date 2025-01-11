import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import LostAndFound from "../artifacts/contracts/LostAndFound.sol/LostAndFound.json";

const ContractContext = createContext();

export function ContractProvider({ children }) {
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const contractAddress = "YOUR_DEPLOYED_CONTRACT_ADDRESS"; // Replace after deployment

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          contractAddress,
          LostAndFound.abi,
          signer
        );

        setProvider(provider);
        setSigner(signer);
        setContract(contract);
      }
    };

    initContract();
  }, []);

  const reportLostItem = async (
    name,
    category,
    location,
    imageUrl,
    date,
    bountyAmount
  ) => {
    try {
      const tx = await contract.reportLostItem(
        name,
        category,
        location,
        imageUrl,
        date,
        { value: ethers.utils.parseEther(bountyAmount.toString()) }
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error reporting lost item:", error);
      return false;
    }
  };

  const reportFoundItem = async (itemId, location, date) => {
    try {
      const tx = await contract.reportFoundItem(itemId, location, date);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error reporting found item:", error);
      return false;
    }
  };

  const getUserItems = async (address) => {
    try {
      const lostItems = await contract.getUserLostItems(address);
      const foundItems = await contract.getUserFoundItems(address);

      const lostItemsData = await Promise.all(
        lostItems.map(async (id) => await contract.getItem(id))
      );

      const foundItemsData = await Promise.all(
        foundItems.map(async (id) => await contract.getItem(id))
      );

      return { lostItems: lostItemsData, foundItems: foundItemsData };
    } catch (error) {
      console.error("Error fetching user items:", error);
      return { lostItems: [], foundItems: [] };
    }
  };

  return (
    <ContractContext.Provider
      value={{
        contract,
        provider,
        signer,
        reportLostItem,
        reportFoundItem,
        getUserItems,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
}

export function useContract() {
  return useContext(ContractContext);
}
