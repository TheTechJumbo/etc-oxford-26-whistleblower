import { ethers } from "hardhat";

async function main() {
  const ReportEmitter = await ethers.getContractFactory("ReportEmitter");
  const emitter = await ReportEmitter.deploy();
  await emitter.waitForDeployment();

  console.log("ReportEmitter deployed to:", await emitter.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
