"use client";

import { useState, createContext, useEffect, useCallback, useRef } from "react";
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

  const contractAddress =
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
    "0x0000000000000000000000000000000000000000";
  const contractABI = abi.abi;

  // ── Read-only contract (no wallet) on page load ───────────────────────────
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

  // ── Rebuild signer + contract for the given address ──────────────────────
  // Accepts the address string explicitly so there is never a stale-closure
  // or timing issue with whichever account MetaMask considers "active".
  const rebuildSigner = useCallback(
    async (newAddress) => {
      if (!newAddress || !window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // Pass the address explicitly – avoids ethers picking the wrong account
        const signer = await provider.getSigner(newAddress);
        const actualAddress = await signer.getAddress();
        console.log("[AuthContext] Signer rebuilt for:", actualAddress);
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        setValue({ provider, signer, contract, isLogged: true });
        return actualAddress;
      } catch (err) {
        console.error("[AuthContext] rebuildSigner failed:", err);
      }
    },
    [contractAddress, contractABI]
  );

  // ── Handle MetaMask account changes ──────────────────────────────────────
  const handleAccountsChanged = useCallback(
    async (accounts) => {
      console.log("[AuthContext] accountsChanged →", accounts);
      if (!accounts || accounts.length === 0) {
        setAccount({ address: null, balance: null });
        setValue((prev) => ({ ...prev, signer: null, isLogged: false }));
        return;
      }

      const newAddress = accounts[0];

      // Update display address + balance
      try {
        const web3 = new Web3(Web3.givenProvider);
        const balance = await web3.eth.getBalance(newAddress);
        setAccount({
          address: newAddress,
          balance: web3.utils.fromWei(balance, "ether"),
        });
      } catch (err) {
        console.error("[AuthContext] Balance fetch failed:", err);
        setAccount({ address: newAddress, balance: "?" });
      }

      // Rebuild signer + contract for the new account
      await rebuildSigner(newAddress);
    },
    [rebuildSigner]
  );

  // Keep a stable ref to handleAccountsChanged so the event listener
  // registered once never goes stale (avoids re-registering on every render).
  const handleAccountsChangedRef = useRef(handleAccountsChanged);
  useEffect(() => {
    handleAccountsChangedRef.current = handleAccountsChanged;
  }, [handleAccountsChanged]);

  // ── Shared wallet connect logic ───────────────────────────────────────────
  const connectWallet = useCallback(
    async (walletName) => {
      try {
        const { ethereum } = window;
        if (!ethereum) {
          toast.error(
            walletName === "MetaMask"
              ? "MetaMask not detected. Install the MetaMask extension and reload."
              : `Please install ${walletName} Wallet.`,
            { autoClose: 6000 }
          );
          if (walletName === "MetaMask")
            window.open("https://metamask.io/download/", "_blank");
          return;
        }

        // Register event listeners only once using stable refs
        if (!ethereum._agListenersAttached) {
          ethereum.on("chainChanged", () => window.location.reload());
          ethereum.on("accountsChanged", (accs) =>
            handleAccountsChangedRef.current(accs)
          );
          ethereum._agListenersAttached = true;
        }

        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        if (!accounts || accounts.length === 0) {
          toast.error("No accounts returned from wallet.");
          return;
        }

        const address = accounts[0];
        const actualAddress = await rebuildSigner(address);

        // Update address + balance
        try {
          const web3 = new Web3(Web3.givenProvider);
          const balance = await web3.eth.getBalance(address);
          setAccount({
            address: actualAddress || address,
            balance: web3.utils.fromWei(balance, "ether"),
          });
        } catch {
          setAccount({ address: actualAddress || address, balance: "?" });
        }
      } catch (err) {
        if (err.code === -32002)
          toast.warning("Wallet popup already open — check your browser extension.");
        else if (err.code === 4001)
          toast.info("Connection cancelled.");
        console.error(`[AuthContext] connect${walletName} error:`, err);
      }
    },
    [rebuildSigner]
  );

  const connectMetaMask = useCallback(() => connectWallet("MetaMask"), [connectWallet]);
  const connectCoinBase = useCallback(() => connectWallet("Coinbase"), [connectWallet]);
  const connectPhantom  = useCallback(() => connectWallet("Phantom"),  [connectWallet]);

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
