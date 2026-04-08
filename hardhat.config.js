require("@nomiclabs/hardhat-ethers");
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */

// ── Environment variables (required only for Sepolia deployment) ──
const SEPOLIA_URL = process.env.SEPOLIA_URL  || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY  || "";

// ── Ganache default RPC (change port if you customised it in the Ganache GUI) ──
const GANACHE_URL  = process.env.GANACHE_URL  || "http://127.0.0.1:7545";
const GANACHE_KEY  = process.env.GANACHE_KEY  || "";   // paste one of the Ganache private keys here

module.exports = {
  solidity: "0.8.18",

  networks: {
    // ── Local Hardhat node (npx hardhat node) ──────────────────────────
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
    },

    // ── Ganache (desktop GUI or ganache-cli) ───────────────────────────
    // Usage: node node_modules/hardhat/.../cli.js run scripts/deployBookRatings.js --network ganache
    ganache: {
      url: GANACHE_URL,
      // Chain ID in Ganache desktop is usually 1337; CLI default is 1337 too.
      // If it says 5777 in your Ganache GUI, change it here:
      chainId: 1337,
      accounts: GANACHE_KEY ? [GANACHE_KEY] : [],
    },

    // ── Sepolia public testnet (real testnet – free ETH from faucet) ───
    // Usage: node node_modules/hardhat/.../cli.js run scripts/deployBookRatings.js --network sepolia
    sepolia: {
      url: SEPOLIA_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
