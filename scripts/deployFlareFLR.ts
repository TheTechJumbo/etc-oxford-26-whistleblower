import { ethers } from "hardhat";

async function main() {
  const sourceEmitter = process.env.SOURCE_EMITTER_ADDRESS;
  if (!sourceEmitter) {
    throw new Error("SOURCE_EMITTER_ADDRESS is required");
  }

  const FlareFLR = await ethers.getContractFactory("FlareFLR");
  const flareflr = await FlareFLR.deploy(sourceEmitter);
  await flareflr.waitForDeployment();

  console.log("FlareFLR deployed to:", await flareflr.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
