require("dotenv/config");
const fs = require("fs");
require("@nomicfoundation/hardhat-ethers");

const { COSTON_RPC_URL, COSTON2_RPC_URL, PRIVATE_KEY } = process.env;

const loadKeyFile = () => {
  try {
    const raw = fs.readFileSync("keys.json", "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.privateKey) return [parsed.privateKey];
    if (Array.isArray(parsed.privateKeys)) return parsed.privateKeys;
  } catch {
    return [];
  }
  return [];
};

const fileAccounts = loadKeyFile();
const accounts = fileAccounts.length > 0 ? fileAccounts : PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.25",
  networks: {
    coston: {
      url: COSTON_RPC_URL || "",
      accounts,
    },
    coston2: {
      url: COSTON2_RPC_URL || "",
      accounts,
    },
  },
};
