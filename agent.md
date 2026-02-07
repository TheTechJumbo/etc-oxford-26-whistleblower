# agent.md — FLR Privacy-First Whistleblowing on Flare (ETH Oxford 2026)

## Name
FlareFLR — Privacy-Preserving Whistleblowing dApp

## Hackathon Context
**Event:** ETH Oxford 2026  
**Track:** Flare Main Track (with Bonus Track eligibility)  
**Core Requirement:** Use at least one of Flare’s Enshrined Data Protocols  
**Primary Protocol Used:** Flare Data Connector (FDC)  
**Optional Add-ons:** Secure Random, Flare Smart Accounts

---

## One-liner
A privacy-first whistleblowing dApp on Flare that enables anonymous, tamper-evident reporting of misconduct, using Flare’s Data Connector to verify and anchor disclosures without revealing identities or metadata.

---

## Problem
Whistleblowers face three major risks:
1. **Identity exposure** (direct or via metadata).
2. **Data tampering or suppression** by centralized platforms.
3. **Lack of trust** in a single organization to safely handle sensitive disclosures.

Existing tools rely on centralized trust assumptions and off-chain integrity guarantees.

---

## Proposed Solution
Build a decentralized whistleblowing intake dApp on **Flare** that:
- Preserves anonymity and minimizes metadata leakage.
- Makes disclosures **tamper-evident** and **verifiable on-chain**.
- Avoids reliance on a single trusted server.
- Uses Flare’s native data infrastructure rather than external oracles.

---

## What “FLR” Means Here
- **FLR (token):** Used to deploy and operate the dApp on Flare.
- **FLR (conceptual):** Fault-tolerant, replicated handling of encrypted disclosures, with integrity anchored on-chain.

---

## Why Flare
Flare is uniquely suited because it:
- Is an EVM chain optimized for **decentralized data acquisition**.
- Provides **FDC** to verify off-chain and cross-chain data trustlessly.
- Eliminates reliance on centralized oracle providers.
- Supports Web2 + Web3 data verification natively.

---

## Core Flare Protocol Usage

### 1. Flare Data Connector (FDC) — **Required**
Used to:
- Verify that a whistleblowing disclosure hash corresponds to a real off-chain submission.
- Attest to metadata-minimal properties (e.g. submission timestamp bucket, report type).
- Anchor integrity proofs on-chain without publishing sensitive content.

**Example:**
- Off-chain encrypted report → hash generated client-side.
- Hash + structured attestation request submitted via FDC.
- Consensus result stored on Flare and verifiable by the dApp.

### 2. Secure Random (Optional)
- Generate unlinkable submission IDs or retrieval tokens.
- Prevent predictable identifiers that could aid correlation attacks.

### 3. Flare Smart Accounts (Optional)
- Allow submissions or interactions without users holding FLR directly.
- Reduce UX friction and user fingerprinting.

---

## Target Users
- Whistleblowers reporting misconduct or abuse.
- Journalists, NGOs, or oversight bodies receiving disclosures.
- Researchers exploring privacy-preserving civic tech.

---

## Key Principles
- **Privacy-first:** Identity and metadata minimization are first-class goals.
- **Least trust:** No single party can alter or suppress reports undetected.
- **Responsible framing:** Reporting wrongdoing, not “leaking secrets.”
- **Hackathon-realistic:** Clear demoable guarantees in limited time.

---

## Threat Model (Hackathon Scope)

### Adversaries
- A compromised backend or storage provider.
- A malicious operator attempting to alter or delete reports.
- Network observers attempting metadata correlation.
- A dishonest reviewer disputing the existence or timing of a report.

### Non-Goals
- Protection against global passive adversaries.
- Handling classified material workflows.
- Production-grade whistleblower safety guarantees.

---

## System Architecture

### Components
1. **Client (Web UI or CLI)**
   - Encrypts report locally.
   - Generates content hash.
   - Sends only ciphertext + minimal metadata.

2. **Off-chain Storage / Relay**
   - Stores encrypted submissions.
   - No plaintext, no identity logs.

3. **Flare Smart Contract**
   - Accepts FDC-verified attestations.
   - Stores hashes, timestamps, and status.

4. **Reviewer Interface**
   - Fetches encrypted data.
   - Verifies on-chain attestation.
   - Decrypts locally with private key.

---

## Data Flow
1. User writes report.
2. Client encrypts report and computes hash.
3. Hash is submitted via FDC attestation request.
4. FDC validators reach consensus.
5. Attested hash is recorded on Flare.
6. Reviewer verifies integrity on-chain, then decrypts off-chain content.

---

## MVP Requirements
- Anonymous submission (no accounts).
- Client-side encryption.
- FDC-verified attestation on Flare.
- On-chain tamper evidence.
- Working end-to-end demo on Coston or Coston2.

---

## Demo Plan (3–5 Minutes)
1. Submit an anonymous encrypted report.
2. Show FDC attestation result on Flare explorer.
3. Demonstrate that on-chain hash matches encrypted report.
4. Attempt tampering → integrity verification fails.
5. Reviewer decrypts and reads the original report.

---

## Judging Alignment

### Main Track
- Uses **Flare Data Connector** ✔
- Addresses a real-world problem ✔
- Innovative use of decentralized data verification ✔

### Bonus Track
- Novel use of Web2/off-chain data attested on-chain ✔
- Strong privacy-preserving application ✔

---

## Ethics & Framing
**Use in pitch and README:**
- “Anonymous disclosure”
- “Privacy-preserving reporting”
- “Tamper-evident whistleblowing”

**Avoid:**
- “Reveal secrets”
- “Leaks”
- “Bypassing laws”

**Disclaimer:**
> This project is a hackathon prototype and not production-ready for real whistleblower use.

---

## Stretch Goals
- Anonymous reply channel using one-time tokens.
- Submission batching to reduce timing correlation.
- Multiple reviewer keys (threshold decryption).
- SubQuery / Subsquid indexing for submissions.

---

## README Feedback Section (Required)
Include:
- Experience integrating FDC.
- Challenges with data attestation.
- Feedback on Flare developer tooling.
- Suggestions for improving privacy-focused dApps on Flare.

---

## Hackathon Track Alignment & Submission Context

### Flare Hackathon (ETH Oxford 2026)
**Submission:** MAIN Track (with BONUS Track eligibility)

- Uses **Flare Data Connector (FDC)** as the core protocol.
- Addresses a real-world privacy and integrity problem.
- Includes required README feedback on Flare developer experience.

### DoraHacks Tracks
**Primary:** Main — Programmable Cryptography  
**Secondary:** Main — Prediction Markets + DeFi  
**Exploratory:** New Consumer Primitives

This project leverages:
- Programmable cryptography to enable anonymous, trust-minimized cooperation.
- On-chain data attestations as privacy-preserving truth signals.
- Optional DeFi primitives (prediction markets) to reason about hidden information without disclosure.

---

## References & Resources

- Flare Hackathon Guide:  
  https://flare-network.notion.site/Flare-Hackathon-Guide-ETH-Oxford-2026-2e6d502e6fa680598c39c7103e3c4763

- DoraHacks Tracks:
  - Programmable Cryptography
  - Prediction Markets + DeFi
  - New Consumer Primitives