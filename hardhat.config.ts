import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import 'dotenv/config'

const etherscanAPI = "25IPFUEZPJ1C9QEFUR4BEGZVPKTXRC27RF";


const config: HardhatUserConfig = {
  solidity: "0.8.20",
  etherscan: {
    apiKey: etherscanAPI,
  },
  networks: {
    sepolia: {
        url: process.env.ALCHEMY_SEPOLIA_URL,
        accounts: [process.env.TESTNET_WALLET_KEY as string],
    },
},
}

export default config
