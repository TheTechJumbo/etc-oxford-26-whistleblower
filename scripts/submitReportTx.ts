import hre from "hardhat";
const { ethers } = hre;

async function main() {
  const reportHash = process.env.REPORT_HASH;
  const reportType = process.env.REPORT_TYPE || "other";
  const emitterAddress = process.env.SOURCE_EMITTER_ADDRESS;

  if (!reportHash || !emitterAddress) {
    throw new Error("REPORT_HASH and SOURCE_EMITTER_ADDRESS are required");
  }

  const emitter = await ethers.getContractAt("ReportEmitter", emitterAddress);
  const tx = await emitter.submitReport(reportHash, reportType);
  const receipt = await tx.wait();

  console.log("Submitted report tx hash:", receipt?.hash || tx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
