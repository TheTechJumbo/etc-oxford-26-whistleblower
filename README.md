# FlareFLR — Privacy-First Whistleblowing MVP

This repo contains:
- A no-build browser demo (`frontend/`) for client-side encryption + tamper checks.
- A Solidity verifier contract on Flare (`FlareFLR`) that anchors reports only after FDC verification.
- Scripts to deploy contracts and run a full FDC attestation flow on Coston2.

## Quickstart (Frontend Demo)
Serve the frontend locally to ensure WebCrypto works:
```bash
cd frontend
python3 -m http.server 5173
```
Then open `http://localhost:5173`.

## Real FDC Flow (Coston2)
This MVP uses the **EVMTransaction** attestation type:
- You submit a report on Sepolia via `ReportEmitter`.
- The FDC Verifier prepares an attestation request for that transaction.
- The request is submitted to Coston2’s FDC Hub.
- After finalization, the Data Availability layer returns a proof.
- `FlareFLR` verifies the proof and anchors the report.

The Verifier base URL and DA layer URL used here are per Flare docs. citeturn1search0turn1search1  
The public testnet verifier API key is documented for manual attestation. citeturn1search2  
The default voting round timing values in `.env.example` follow Flare’s FDC getting-started example. citeturn1search0

### 1) Install deps
```bash
npm install
```

### 2) Configure env
Copy `.env.example` to `.env` and fill in:
- `PRIVATE_KEY`
- `SEPOLIA_RPC_URL`
- `COSTON2_RPC_URL`
- `FLARE_CONTRACT_REGISTRY` (Coston2 address for FlareContractRegistry)
- Optional: `FDC_HUB_ADDRESS`, `RELAY_ADDRESS`

If you don’t want to put keys in `.env`, you can use `keys.json` instead.
Create it from `keys.example.json` and keep it out of git.

If you don’t know addresses, you can pull them from Flare’s periphery artifacts after install.

### 3) Deploy contracts
```bash
npm run deploy:emitter:sepolia
npm run deploy:flareflr:coston2
```

### 4) Submit a report (Sepolia)
Use the report hash from the frontend demo (or any `bytes32`).
```bash
export REPORT_HASH=0x...
export REPORT_TYPE=fraud
export SOURCE_EMITTER_ADDRESS=0x...
npm run submit:report:sepolia
```

### 5) Request attestation + anchor (Coston2)
```bash
export SOURCE_TX_HASH=0x...   # from step 4
export FLAREFLR_ADDRESS=0x... # from step 3
npm run fdc:attest:anchor
```

The script:
- Calls the FDC Verifier `prepareRequest`.
- Submits to `FdcHub.requestAttestation`.
- Waits for finalization via `Relay.isFinalized`.
- Fetches proof from the DA layer.
- Calls `FlareFLR.anchorFromEvmProof`.

## Contracts
### `contracts/ReportEmitter.sol`
Emits `ReportSubmitted(reportHash, reportType)` on the source chain (Sepolia).

### `contracts/FlareFLR.sol`
Verifies FDC proof (`verifyEVMTransaction`) and anchors the report on Flare.

## Disclaimer
This is a hackathon prototype and not production-ready for real whistleblower use.
