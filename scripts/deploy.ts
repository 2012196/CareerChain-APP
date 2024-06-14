import { ethers } from "hardhat"
import 'dotenv/config'

async function main() {
  const contract = await ethers.deployContract("CareerChain", [process.env.TESTNET_WALLET_ADDRESS])
  await contract.waitForDeployment()
  console.log(contract.target)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
