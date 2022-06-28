const xrpl = require("xrpl");
const { config } = require("./config");
const { nftDevnetWallet } = require("./nftDevnetWallet.js");
const { xrplClient, mintNFT } = require("./utils/utils");

async function main() {
  // Define the network client
  const client = await xrplClient(config.NFT_DEVNET_SERVER);

  //create wallet
  //   newXrplWallet = walletCreate();

  let test_wallet = xrpl.Wallet.fromSeed(nftDevnetWallet.seed[0]); // Test secret; don't use for real
  console.log(test_wallet);

  // Get info from the ledger about the address we just funded
  const response = await client.request({
    command: "account_info",
    account: test_wallet.address,
    ledger_index: "validated",
  });
  console.log(response);

  let tokenuri = "ipfs://Qme6fD5HpXSJL5qBUWJqA8KkygS4DZc8MsZK36KhYi2664";
  await mintNFT(client, test_wallet, tokenuri);

  // Disconnect when done (If you omit this, Node.js won't end the process)
  client.disconnect();
}

main();
