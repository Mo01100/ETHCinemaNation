"use client";

import { useState, createContext, useEffect, useCallback } from "react";
import abi from "../contracts/BookRatings.json";
import { ethers, JsonRpcProvider } from "ethers";
var Web3 = require("web3");
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [Value, setValue] = useState({
    provider: null,
    signer: null,
    contract: null,
    isLogged: false,
  });
  const [account, setAccount] = useState({
    address: null,
    balance: null,
  });

  // ⚠️  After deploying BookRatings.sol, paste the deployed address here
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const contractABI = abi.abi;

  // Connect in read-only mode (no wallet) on page load
  const connectcontract = useCallback(() => {
    try {
      const rpcUrl =
        process.env.NEXT_PUBLIC_ALCHEMY_URL ||
        "https://eth-sepolia.g.alchemy.com/v2/vZ27K8ZtNERkM4E-hnXSBf96Hjt26HIe";
      const provider = new JsonRpcProvider(rpcUrl);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);
      setValue({ provider, signer: null, contract, isLogged: false });
    } catch (err) {
      console.error("Error setting up read-only contract:", err);
    }
  }, [contractAddress, contractABI]);

  useEffect(() => {
    connectcontract();
  }, [connectcontract]);

  // Fetch ETH balance for connected account
  const getaccountdetails = async (accounts) => {
    const web3 = new Web3(Web3.givenProvider);
    const balance = await web3.eth.getBalance(accounts[0]);
    setAccount({
      address: accounts[0],
      balance: web3.utils.fromWei(balance, "ether"),
    });
  };

  // ---------- MetaMask ----------
  const connectMetaMask = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        toast.error(
          "MetaMask not detected. Open this page in Chrome/Brave with the MetaMask extension installed.",
          { autoClose: 6000 }
        );
        // Open MetaMask download in a new tab for convenience
        window.open("https://metamask.io/download/", "_blank");
        return;
      }
      ethereum.on("chainChanged", () => window.location.reload());
      ethereum.on("accountsChanged", (accounts) => getaccountdetails(accounts));

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setValue({ provider, signer, contract, isLogged: true });
      await getaccountdetails(accounts);
    } catch (err) {
      if (err.code === -32002)
        toast.warning("MetaMask is already open — please check your browser extension.");
      else if (err.code === 4001)
        toast.info("Connection cancelled. Please approve the MetaMask request to continue.");
      console.error("connectMetaMask error:", err);
    }
  };

  // ---------- CoinBase ----------
  const connectCoinBase = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        toast.warning("Please install Coinbase Wallet");
        return;
      }
      ethereum.on("chainChanged", () => window.location.reload());
      ethereum.on("accountsChanged", (accounts) => getaccountdetails(accounts));

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setValue({ provider, signer, contract, isLogged: true });
      await getaccountdetails(accounts);
    } catch (err) {
      console.error("connectCoinBase error:", err);
    }
  };

  // ---------- Phantom ----------
  const connectPhantom = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        toast.warning("Please install Phantom Wallet");
        return;
      }
      ethereum.on("chainChanged", () => window.location.reload());
      ethereum.on("accountsChanged", (accounts) => getaccountdetails(accounts));

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      setValue({ provider, signer, contract, isLogged: true });
      await getaccountdetails(accounts);
    } catch (err) {
      if (err.code === -32002) toast.warning("Please open Phantom and login.");
      console.error("connectPhantom error:", err);
    }
  };

  const AuthValue = {
    connectMetaMask,
    connectCoinBase,
    connectPhantom,
    provider: Value.provider,
    signer: Value.signer,
    contract: Value.contract,
    address: account.address,
    balance: account.balance,
    isLogged: Value.isLogged,
  };

  return (
    <AuthContext.Provider value={AuthValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
