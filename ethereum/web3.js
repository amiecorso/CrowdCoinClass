import Web3 from "web3";
const HDWalletProvider = require("@truffle/hdwallet-provider");

let web3;

if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
  // We are in the browser and metamask is running.
  window.ethereum.request({ method: "eth_requestAccounts" });
  web3 = new Web3(window.ethereum);
} else {
  // We are on the server *OR* the user is not running metamask
  const provider = new HDWalletProvider(
    "will bridge buffalo must column convince together hurry brown energy become thank",
    "https://rinkeby.infura.io/v3/7b5b3c749801403a86e32f8341c74faa"
  );
  web3 = new Web3(provider);
}

export default web3;
