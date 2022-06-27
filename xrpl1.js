const xrpl = require("xrpl");
const { config } = require("./config");
const { testnetWallet } = require("./testnetwallet");

async function main() {
  // Define the network client
  const client = await xrplClient();

  //create wallet
  //   newXrplWallet = walletCreate();

  let test_wallet = xrpl.Wallet.fromSeed(testnetWallet.seed[0]); // Test secret; don't use for real
  console.log(test_wallet);
  // ] fund a wallet with the Testnet faucet:
  //   const fund_result = await client.fundWallet();
  //   test_wallet = fund_result.wallet;
  //   console.log(test_wallet);

  // Get info from the ledger about the address we just funded
  const response = await client.request({
    command: "account_info",
    account: test_wallet.address,
    ledger_index: "validated",
  });
  console.log(response);

  //send xrp to testnet address-:rwtoSkXqwgMyQKtNpEfks1CeVQ95oPoMth
  let preparedTx = await prepareTx(
    client,
    test_wallet,
    "21", //xrp amount to send
    "Payment",
    testnetWallet.classicAddress[1]
  );
  // Sign prepared instructions ------------------------------------------------
  const signed = test_wallet.sign(preparedTx);
  console.log("Identifying hash:", signed.hash);
  console.log("Signed blob:", signed.tx_blob);
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(signed.tx_blob);
  console.log(tx);

  // Disconnect when done (If you omit this, Node.js won't end the process)
  client.disconnect();
}

async function xrplClient() {
  const client = new xrpl.Client(config.TESTNET_SERVER);
  await client.connect();
  return client;
}

function walletCreate() {
  const test_wallet = xrpl.Wallet.generate();
  console.log(test_wallet);
  return test_wallet;
}

async function prepareTx(client, wallet, amount, txType, destAddress) {
  // Prepare transaction -------------------------------------------------------
  const prepared = await client.autofill({
    TransactionType: txType,
    Account: wallet.address,
    Amount: xrpl.xrpToDrops(amount),
    Destination: destAddress,
  });
  const max_ledger = prepared.LastLedgerSequence;
  console.log("Prepared transaction instructions:", prepared);
  console.log("Transaction cost:", xrpl.dropsToXrp(prepared.Fee), "XRP");
  console.log("Transaction expires after ledger:", max_ledger);
  return prepared;
}

main();
