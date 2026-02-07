const reportInput = document.getElementById("reportInput");
const reportType = document.getElementById("reportType");
const encryptBtn = document.getElementById("encryptBtn");
const clearBtn = document.getElementById("clearBtn");
const ciphertextOutput = document.getElementById("ciphertextOutput");
const ivOutput = document.getElementById("ivOutput");
const keyOutput = document.getElementById("keyOutput");
const downloadCipherBtn = document.getElementById("downloadCipherBtn");

const attestationRequest = document.getElementById("attestationRequest");
const attestationResult = document.getElementById("attestationResult");

const anchorBtn = document.getElementById("anchorBtn");
const tamperBtn = document.getElementById("tamperBtn");
const chainLog = document.getElementById("chainLog");
const verifyCiphertext = document.getElementById("verifyCiphertext");
const verifyBtn = document.getElementById("verifyBtn");
const verifyResult = document.getElementById("verifyResult");

const reviewCiphertext = document.getElementById("reviewCiphertext");
const reviewKey = document.getElementById("reviewKey");
const decryptBtn = document.getElementById("decryptBtn");
const reviewPlaintext = document.getElementById("reviewPlaintext");

const CHAIN_KEY = "flareflr_chain_log";

const enc = new TextEncoder();
const dec = new TextDecoder();

const toBase64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromBase64 = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const randomBytes = (len) => {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return bytes;
};

async function sha256Hex(buf) {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function encryptReport(plaintext) {
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext)
  );
  const rawKey = await crypto.subtle.exportKey("raw", key);

  return {
    iv: toBase64(iv),
    ciphertext: toBase64(ciphertext),
    key: toBase64(rawKey),
  };
}

async function decryptReport(ciphertextB64, ivB64, keyB64) {
  const key = await crypto.subtle.importKey(
    "raw",
    fromBase64(keyB64),
    "AES-GCM",
    false,
    ["decrypt"]
  );
  const plaintext = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(ivB64) },
    key,
    fromBase64(ciphertextB64)
  );
  return dec.decode(plaintext);
}

function currentBucketMs() {
  const minute = 60 * 1000;
  return Math.floor(Date.now() / minute) * minute;
}

function mockFdcAttest(request) {
  const idBytes = randomBytes(8);
  const attestationId =
    "0x" + Array.from(idBytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return {
    attestationId,
    status: "verified",
    consensusTimestamp: new Date().toISOString(),
    requestHash: request.reportHash,
    reportType: request.reportType,
    bucketMs: request.bucketMs,
  };
}

function readChainLog() {
  const raw = localStorage.getItem(CHAIN_KEY);
  return raw ? JSON.parse(raw) : [];
}

function writeChainLog(entries) {
  localStorage.setItem(CHAIN_KEY, JSON.stringify(entries));
}

function renderChainLog() {
  const entries = readChainLog();
  chainLog.innerHTML = "";
  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    item.textContent = `#${index + 1} | ${entry.reportHash.slice(0, 12)}... | ${entry.attestationId}`;
    item.dataset.hash = entry.reportHash;
    item.addEventListener("click", () => {
      verifyCiphertext.value = ciphertextOutput.value || verifyCiphertext.value;
      verifyResult.textContent = `Selected entry: ${entry.reportHash}`;
      verifyResult.dataset.selectedHash = entry.reportHash;
    });
    chainLog.appendChild(item);
  });
}

function updateCiphertextFields(payload) {
  ciphertextOutput.value = payload.ciphertext;
  ciphertextOutput.dataset.iv = payload.iv;
  ivOutput.value = payload.iv;
  verifyCiphertext.value = payload.ciphertext;
  reviewCiphertext.value = payload.ciphertext;
  reviewKey.value = keyOutput.value;
}

function formatJson(obj) {
  return JSON.stringify(obj, null, 2);
}

function ensureCiphertextPresent() {
  return ciphertextOutput.value && ciphertextOutput.dataset.iv;
}

encryptBtn.addEventListener("click", async () => {
  const report = reportInput.value.trim();
  if (!report) return;

  const encrypted = await encryptReport(report);
  keyOutput.value = encrypted.key;
  ciphertextOutput.value = encrypted.ciphertext;
  ciphertextOutput.dataset.iv = encrypted.iv;
  ivOutput.value = encrypted.iv;
  updateCiphertextFields(encrypted);

  const reportHash = await sha256Hex(fromBase64(encrypted.ciphertext));
  const request = {
    protocol: "FDC",
    reportHash,
    reportType: reportType.value,
    bucketMs: currentBucketMs(),
  };
  const result = mockFdcAttest(request);
  attestationRequest.textContent = formatJson(request);
  attestationResult.textContent = formatJson(result);

  ciphertextOutput.dataset.reportHash = reportHash;
  ciphertextOutput.dataset.attestationId = result.attestationId;
});

anchorBtn.addEventListener("click", () => {
  if (!ensureCiphertextPresent()) return;
  const reportHash = ciphertextOutput.dataset.reportHash;
  const attestationId = ciphertextOutput.dataset.attestationId;
  if (!reportHash || !attestationId) return;

  const entries = readChainLog();
  entries.unshift({
    reportHash,
    attestationId,
    anchoredAt: new Date().toISOString(),
  });
  writeChainLog(entries);
  renderChainLog();
});

tamperBtn.addEventListener("click", () => {
  if (!ciphertextOutput.value) return;
  const bytes = fromBase64(ciphertextOutput.value);
  bytes[0] = bytes[0] ^ 0xff;
  ciphertextOutput.value = toBase64(bytes);
  verifyCiphertext.value = ciphertextOutput.value;
});

verifyBtn.addEventListener("click", async () => {
  const selectedHash =
    verifyResult.dataset.selectedHash || ciphertextOutput.dataset.reportHash;
  if (!selectedHash) return;
  const cipherB64 = verifyCiphertext.value.trim();
  if (!cipherB64) return;
  const computed = await sha256Hex(fromBase64(cipherB64));
  if (computed === selectedHash) {
    verifyResult.textContent = "Match: ciphertext hash equals anchored hash.";
  } else {
    verifyResult.textContent = "Mismatch: ciphertext has been tampered with.";
  }
});

decryptBtn.addEventListener("click", async () => {
  try {
    const plaintext = await decryptReport(
      reviewCiphertext.value.trim(),
      ivOutput.value.trim(),
      reviewKey.value.trim()
    );
    reviewPlaintext.textContent = plaintext;
  } catch (err) {
    reviewPlaintext.textContent = "Decryption failed. Check key/ciphertext.";
  }
});

clearBtn.addEventListener("click", () => {
  reportInput.value = "";
  ciphertextOutput.value = "";
  keyOutput.value = "";
  attestationRequest.textContent = "";
  attestationResult.textContent = "";
  verifyCiphertext.value = "";
  verifyResult.textContent = "";
  reviewCiphertext.value = "";
  reviewKey.value = "";
  reviewPlaintext.textContent = "";
  ivOutput.value = "";
  delete ciphertextOutput.dataset.iv;
  delete ciphertextOutput.dataset.reportHash;
  delete ciphertextOutput.dataset.attestationId;
});

downloadCipherBtn.addEventListener("click", () => {
  if (!ensureCiphertextPresent()) return;
  const payload = {
    iv: ciphertextOutput.dataset.iv,
    ciphertext: ciphertextOutput.value,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "flareflr-ciphertext.json";
  link.click();
  URL.revokeObjectURL(url);
});

renderChainLog();
