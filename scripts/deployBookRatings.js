const hre = require("hardhat");

/**
 * Deploy the BookRatings smart contract.
 *
 * ── Testing with Ganache
 *   1. first Open Ganache  (or run: npx ganache)
 *   2. Copy any private key from Ganache → paste as GANACHE_KEY in .env (important)
 *   3. Run:
 *        node node_modules/hardhat/internal/cli/cli.js run scripts/deployBookRatings.js --network ganache
 *
 * ── Deploy to Sepolia TestNet (public testnet) ──────────────────────────
 *   1. Get free Sepolia ETH: https://faucet.alchemy.com
 *   2. Fill SEPOLIA_URL and PRIVATE_KEY in .env
 *   3. Run:
 *        node node_modules/hardhat/internal/cli/cli.js run scripts/deployBookRatings.js --network sepolia
 *
 * After deploying (either network):
 *   • Copy the printed address into client/src/utils/AuthContext.js  (contractAddress)
 *   • For Ganache: set NEXT_PUBLIC_ALCHEMY_URL=http://127.0.0.1:7545 in client/.env.local
 *   • For Sepolia: set NEXT_PUBLIC_ALCHEMY_URL=<your alchemy url>   in client/.env.local
 */
async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying BookRatings to "${network}" network...`);

  const BookRatingsFactory = await hre.ethers.getContractFactory("BookRatings");
  const bookRatings = await BookRatingsFactory.deploy();

  await bookRatings.deployed();

  const address = bookRatings.address;
  console.log(`\n✅ BookRatings deployed to: ${address}`);

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Next steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 1. Open:  client/src/utils/AuthContext.js
    Set:   contractAddress = "${address}"

 2. Open (or create):  client/.env.local
    Set:   NEXT_PUBLIC_CONTRACT_ADDRESS=${address}
${network === "ganache"
  ? `    Set:   NEXT_PUBLIC_ALCHEMY_URL=http://127.0.0.1:7545\n\n    In MetaMask → Add Network:
         RPC URL : http://127.0.0.1:7545
         Chain ID: 1337
    Then import a Ganache private key into MetaMask.`
  : `    Set:   NEXT_PUBLIC_ALCHEMY_URL=<your Alchemy Sepolia URL>
    Switch MetaMask to the Sepolia network.`}

 3. Run the frontend:
         cd client && npm run dev
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
