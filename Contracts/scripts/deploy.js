
const hre = require("hardhat");
const { NFT_COLLECTION_CONTRACT_ADDRESS } = require("../constants");

async function main() {
  const FakeNFTMarketplace = await hre.ethers.getContractFactory("FakeNFTMarketplace");
  const fakeNFTMarketplace = await FakeNFTMarketplace.deploy()
  await fakeNFTMarketplace.waitForDeployment()

  console.log("FakeNFTMarketPlace contract deployed at",fakeNFTMarketplace.target);

  const NFTDevsDAO = await  hre.ethers.getContractFactory("NFTDevsDAO");
  const nftDevsDAO = await NFTDevsDAO.deploy(fakeNFTMarketplace.target,
    NFT_COLLECTION_CONTRACT_ADDRESS,
    {value : hre.ethers.parseEther("0.001")}
    )
  await nftDevsDAO.waitForDeployment()

  console.log("NFTDevsDAO contract deployed at",nftDevsDAO.target);

  await hre.run("verify:verify",{
    address : nftDevsDAO.target,
    constructorArguments : [fakeNFTMarketplace.target,
      NFT_COLLECTION_CONTRACT_ADDRESS
      ]
  })

  await hre.run("verify:verify",{
    address : fakeNFTMarketplace.target,
    constructorArguments : []
  })
  
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
