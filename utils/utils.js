const xrpl = require("xrpl");

async function xrplClient(url) {
  const client = new xrpl.Client(url);
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

async function mintNFT(client, wallet, tokenURI) {
  const transactionBlob = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex(tokenURI),
    Flags: parseInt("11"),
    NFTokenTaxon: 0, //Required, but if you have no use for it, set to zero.
  };
  // Submit signed blob --------------------------------------------------------
  const tx = await client.submitAndWait(transactionBlob, { wallet });

  const nfts = await client.request({
    method: "account_nfts",
    account: wallet.classicAddress,
  });
  console.log(nfts);
  console.log(JSON.stringify(nfts.result.account_nfts));

  // Check transaction results -------------------------------------------------
  console.log("Transaction result:", tx.result.meta.TransactionResult);
  console.log(
    "Balance changes:",
    JSON.stringify(xrpl.getBalanceChanges(tx.result.meta), null, 2)
  );
}

module.exports = { xrplClient, walletCreate, prepareTx, mintNFT };
