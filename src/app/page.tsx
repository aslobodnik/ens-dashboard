import { createPublicClient, http, Address } from "viem";
import { Client } from "./client";
import { mainnet } from "viem/chains";
import multisigsData from "./data/multisigsData";
import { MultiSig } from "./types/types";
import { useState } from "react";

const transport = http(process.env.SERVER_URL);

const ENS_TOKEN_CONTRACT =
  "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72" as Address;

const USDC_TOKEN_CONTRACT =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

const abiBalanceOf = [
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const abiOwners = [
  {
    inputs: [],
    name: "getOwners",
    outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: mainnet,
  transport,
});

type MultiSigResult = {
  address: Address;
  balance_ETH: BigInt;
  balance_USDC: BigInt;
  balance_ENS: BigInt;
  signers: Address[];
};

export default async function Home() {
  const addresses = multisigsData.map((multisig) => multisig.address);

  // (async () => {
  //   const updatedMultisigs = await updateMultisigsWithBalances(
  //     addresses,
  //     multisigsData
  //   );

  // })();
  const updatedMultisigs = await updateMultisigsWithBalances(
    addresses,
    multisigsData
  );

  return <Client multiSigData={updatedMultisigs} />;
}

async function getBalancesForAddresses({
  addresses,
}: {
  addresses: Address[];
}): Promise<MultiSigResult[]> {
  const promises = addresses.map(async (address) => {
    const balanceENS = await publicClient.readContract({
      address: ENS_TOKEN_CONTRACT,
      abi: abiBalanceOf,
      functionName: "balanceOf",
      args: [address],
    });

    const balanceUSDC = await publicClient.readContract({
      address: USDC_TOKEN_CONTRACT,
      abi: abiBalanceOf,
      functionName: "balanceOf",
      args: [address],
    });

    const signers = await publicClient.readContract({
      address: address,
      abi: abiOwners,
      functionName: "getOwners",
    });
    const balance = await publicClient.getBalance({
      address: address,
    });

    return {
      address: address,
      balance_ETH: balance,
      balance_ENS: balanceENS,
      balance_USDC: balanceUSDC,
      signers: [...signers],
    };
  });

  try {
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error("Error reading contracts:", error);
    throw error;
  }
}

async function updateMultisigsWithBalances(
  addresses: Address[],
  multisigsData: MultiSig[]
): Promise<MultiSig[]> {
  const balances = await getBalancesForAddresses({ addresses });

  const updatedMultisigs = multisigsData.map((multisig) => {
    const balanceInfo = balances.find(
      (balance) => balance.address === multisig.address
    );

    return {
      ...multisig,
      balance: balanceInfo ? balanceInfo.balance_ETH : multisig.balance,
      usdc: balanceInfo ? balanceInfo.balance_USDC : multisig.usdc,
      ens: balanceInfo ? balanceInfo.balance_ENS : multisig.ens,
      signers: balanceInfo ? balanceInfo.signers : multisig.signers,
    };
  });

  return updatedMultisigs;
}
