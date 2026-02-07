import { ethers } from "hardhat";
import { interfaceToAbi } from "@flarenetwork/flare-periphery-contract-artifacts";
import { createRequire } from "module";

type PrepareResponse = {
  abiEncodedRequest: string;
  requestHash: string;
};

type ProofResponse = {
  proof: string[];
  response: {
    requestBody: {
      transactionHash: string;
      requiredConfirmations: number;
      provideInput: boolean;
      listEvents: boolean;
      logIndices: number[];
    };
    responseBody: {
      blockNumber: number;
      blockTimestamp: number;
      sourceAddress: string;
      receivingAddress: string;
      value: string;
      status: number;
      transactionHash: string;
      input: string;
      events: Array<{
        emitterAddress: string;
        topics: string[];
        data: string;
        logIndex: number;
      }>;
    };
  };
};

const VERIFIER_BASE_URL =
  process.env.VERIFIER_BASE_URL || "https://fdc-verifiers-testnet.flare.network/";
const VERIFIER_API_KEY = process.env.VERIFIER_API_KEY || "00000000-0000-0000-0000-000000000000";
const DA_LAYER_URL =
  process.env.DA_LAYER_URL || "https://ctn2-data-availability.flare.network/";
const FDC_PROTOCOL_ID = Number(process.env.FDC_PROTOCOL_ID || "200");

const FIRST_VOTING_ROUND_START_TS = Number(
  process.env.FIRST_VOTING_ROUND_START_TS || "1658429955"
);
const VOTING_EPOCH_DURATION_SECONDS = Number(
  process.env.VOTING_EPOCH_DURATION_SECONDS || "90"
);

async function prepareRequest(txHash: string, sourceId: string) {
  const url = `${VERIFIER_BASE_URL}verifier/EVMTransaction/prepareRequest`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": VERIFIER_API_KEY,
    },
    body: JSON.stringify({
      sourceId,
      requestBody: {
        transactionHash: txHash,
        requiredConfirmations: 1,
        provideInput: true,
        listEvents: true,
        logIndices: [],
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`prepareRequest failed: ${response.status} ${text}`);
  }

  return (await response.json()) as PrepareResponse;
}

function calcRoundId() {
  const now = Math.floor(Date.now() / 1000);
  return Math.floor((now - FIRST_VOTING_ROUND_START_TS) / VOTING_EPOCH_DURATION_SECONDS);
}

async function waitForFinalization(relayAddress: string, roundId: number) {
  const relayAbi = interfaceToAbi("IRelay", "coston2");
  const relay = await ethers.getContractAt(relayAbi, relayAddress);

  for (let i = 0; i < 30; i++) {
    const finalized = await relay.isFinalized(FDC_PROTOCOL_ID, roundId);
    if (finalized) return;
    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
  throw new Error("Voting round not finalized yet.");
}

async function fetchProof(roundId: number, abiEncodedRequest: string) {
  const url = `${DA_LAYER_URL}api/v0/fdc/get-proof-round-id-bytes`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": VERIFIER_API_KEY,
    },
    body: JSON.stringify({
      votingRoundId: roundId,
      requestBytes: abiEncodedRequest,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`get-proof failed: ${response.status} ${text}`);
  }

  return (await response.json()) as ProofResponse;
}

async function resolveAddressByName(name: string) {
  const registryAbi = interfaceToAbi("IFlareContractRegistry", "coston2");
  const registryAddress =
    process.env.FLARE_CONTRACT_REGISTRY || (await loadRegistryAddress());
  const registry = await ethers.getContractAt(registryAbi, registryAddress);
  return registry.getContractAddressByName(name);
}

async function loadRegistryAddress() {
  const require = createRequire(import.meta.url);
  try {
    const registryJson = require(
      "@flarenetwork/flare-periphery-contract-artifacts/coston2/FlareContractRegistry.json"
    );
    return registryJson.address as string;
  } catch (err) {
    throw new Error("FLARE_CONTRACT_REGISTRY is required to resolve addresses.");
  }
}

async function main() {
  const txHash = process.env.SOURCE_TX_HASH;
  const sourceId = process.env.SOURCE_ID || "testETH";
  const flareflrAddress = process.env.FLAREFLR_ADDRESS;

  if (!txHash || !flareflrAddress) {
    throw new Error("SOURCE_TX_HASH and FLAREFLR_ADDRESS are required");
  }

  const request = await prepareRequest(txHash, sourceId);
  console.log("Prepared request hash:", request.requestHash);

  const fdcHubAddress = process.env.FDC_HUB_ADDRESS || (await resolveAddressByName("FdcHub"));
  const relayAddress = process.env.RELAY_ADDRESS || (await resolveAddressByName("Relay"));

  const fdcHubAbi = interfaceToAbi("IFdcHub", "coston2");
  const fdcHub = await ethers.getContractAt(fdcHubAbi, fdcHubAddress);

  const fee = ethers.parseEther(process.env.FDC_REQUEST_FEE_FLR || "1");
  const tx = await fdcHub.requestAttestation(request.abiEncodedRequest, { value: fee });
  const receipt = await tx.wait();
  console.log("FDC request tx:", receipt?.hash || tx.hash);

  const roundId = calcRoundId();
  console.log("Estimated voting round id:", roundId);
  await waitForFinalization(relayAddress, roundId);

  const proof = await fetchProof(roundId, request.abiEncodedRequest);
  console.log("Fetched proof.");

  const flareflr = await ethers.getContractAt("FlareFLR", flareflrAddress);
  const anchorTx = await flareflr.anchorFromEvmProof({
    merkleProof: proof.proof,
    data: proof.response,
  });
  const anchorReceipt = await anchorTx.wait();
  console.log("Anchored on Flare:", anchorReceipt?.hash || anchorTx.hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
