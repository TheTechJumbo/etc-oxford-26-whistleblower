import "dotenv/config";
import fs from "fs";
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

const {
  COSTON_RPC_URL,
  COSTON2_RPC_URL,
  SEPOLIA_RPC_URL,
  PRIVATE_KEY,
} = process.env;

type KeyFile = { privateKey?: string; privateKeys?: string[] };

const loadKeyFile = (): string[] => {
  try {
    const raw = fs.readFileSync("keys.json", "utf-8");
    const parsed = JSON.parse(raw) as KeyFile;
    if (parsed.privateKey) return [parsed.privateKey];
    if (Array.isArray(parsed.privateKeys)) return parsed.privateKeys;
  } catch {
    return [];
  }
  return [];
};

const fileAccounts = loadKeyFile();
const accounts = fileAccounts.length > 0 ? fileAccounts : PRIVATE_KEY ? [PRIVATE_KEY] : [];

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
