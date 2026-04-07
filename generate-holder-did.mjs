// generate-holder-did.mjs
// Run: node generate-holder-did.mjs

import { Wallet } from "ethers";
import { buildVerifierId, core } from "./dist/node/esm/index.js";

const info = {
  method: "iden3",
  blockchain: "adi",
  networkId: "adiTestnet",
};

const ADI_CHAIN_ID = 99999;
const ADI_NETWORK_FLAG = 249;

function asString(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  if (typeof x.string === "function") return x.string();
  if (typeof x.toString === "function") return x.toString();
  return String(x);
}

async function main() {
  // 1) Register ADI in JS core registry (this fixes: "blockchain adi and network adiTestnet is not defined in core lib")

  // (optional but safe) register blockchain + chainId + network
  core.registerBlockchain(info.blockchain);
  core.registerChainId(info.blockchain, ADI_CHAIN_ID);
  core.registerNetwork(info.blockchain, info.networkId);

  // Register DID method network mapping (method + blockchain + network + flag + chainId)
  core.registerDidMethodNetwork({
    method: core.DidMethod.Iden3,     // ✅ matches did:iden3:...
    blockchain: info.blockchain,      // "adi"
    chainId: ADI_CHAIN_ID,            // 99999
    network: info.networkId,          // "adiTestnet"
    networkFlag: ADI_NETWORK_FLAG,    // 249 (must match issuer-node resolvers_settings.yaml)
  });

  // 2) Generate a random EVM address and build verifier Id
  const w = Wallet.createRandom();
  const addr = await w.getAddress();

  const verifierId = buildVerifierId(addr, info);

  // 3) Compose DID
  const idStr = asString(verifierId);
  const did = `did:${info.method}:${info.blockchain}:${info.networkId}:${idStr}`;

  console.log("EVM address:", addr);
  console.log("VerifierId (raw):", verifierId);
  console.log("\n✅ Holder DID (issuer-node parseable):");
  console.log(did);
}

main().catch((e) => {
  console.error("❌ Failed:", e?.message || e);
  process.exit(1);
});
