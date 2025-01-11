const { ethers } = require("hardhat");

async function main() {
  const LostAndFound = await ethers.getContractFactory("LostAndFound");
  console.log("Deploying LostAndFound contract...");

  const lostAndFound = await LostAndFound.deploy();
  await lostAndFound.deployed();

  console.log("LostAndFound deployed to:", lostAndFound.address);

  // Verify the deployment
  const itemCount = await lostAndFound.getItemCount();
  console.log("Initial item count:", itemCount.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
