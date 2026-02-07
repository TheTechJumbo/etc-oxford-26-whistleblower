import "dotenv/config";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const {
  COSTON_RPC_URL,
  COSTON2_RPC_URL,
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
} = process.env;

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    coston: {
      url: COSTON_RPC_URL || "",
      accounts,
    },
    coston2: {
      url: COSTON2_RPC_URL || "",
      accounts,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL || "",
      accounts,
    },
  },
};

export default config;
