import { createPublicClient, http, Address } from "viem";
import { Client } from "./client";
import { mainnet } from "viem/chains";
import { multiSigs, opsContracts } from "./data/data";
import { ContractInfo, MultiSig } from "./types/types";
import { abiBalanceOf, abiOwners, abiGetThreshold } from "./abi/abi";

//TODO: Clean multsig types
//TODO: Move avatar url getting to server side with valid / invalid flag

const transport = http(process.env.SERVER_URL);

const ENS_TOKEN_CONTRACT =
  "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72" as Address;

const USDC_TOKEN_CONTRACT =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: mainnet,
  transport,
});

export default async function Home() {
  const multiSigData = await getMultiSigData({ multisigs: multiSigs });

  const balanceData = await getBalances({
    addresses: opsContracts.map((contract) => contract.address),
  });

  // Merge balance data back into opsContracts
  const opsData = opsContracts.map((contract) => {
    const balanceInfo = balanceData.find((b) => b.address === contract.address);
    return {
      ...contract,
      ...balanceInfo,
    };
  });

  console.log(opsData);

  return <Client multiSigData={multiSigData} opsData={opsData} />;
}

async function getMultiSigData({
  multisigs,
}: {
  multisigs: ContractInfo[];
}): Promise<MultiSig[]> {
  const addresses = multisigs.map((multisig) => multisig.address);

  // Fetch balances and multisig info for each address
  const balances = await getBalances({ addresses });
  const multiSigInfos = await getMultiSigInfo({ addresses });

  // Merge the data from balances and multiSigInfos
  return multisigs.map((multisig) => {
    // Find the corresponding balance and multisig info for each multisig
    const balance = balances.find((b) => b.address === multisig.address);
    const multiSigInfo = multiSigInfos.find(
      (info) => info.address === multisig.address
    );

    // Merge with default values for MultiSig properties if not found
    return {
      ...multisig,
      ...balance,
      signers: multiSigInfo?.signers || [], // Default to empty array if not found
      threshold: multiSigInfo?.threshold || 0, // Default to 0 if not found
      multisig: multiSigInfo?.multisig || false, // Default to false if not found
    };
  });
}

async function getBalances({
  addresses,
}: {
  addresses: Address[];
}): Promise<ContractInfo[]> {
  const promises = addresses.map(async (address) => {
    const ensBalance = await getTokenBalance(ENS_TOKEN_CONTRACT, address);
    const usdcBalance = await getTokenBalance(USDC_TOKEN_CONTRACT, address);
    const ethBalance = await publicClient.getBalance({ address });

    return {
      address,
      ethBalance,
      ensBalance,
      usdcBalance,
    };
  });

  try {
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error reading balance contracts:", error);
    throw error;
  }
}

// Gets signers and threshold
async function getMultiSigInfo({
  addresses,
}: {
  addresses: Address[];
}): Promise<MultiSig[]> {
  const promises = addresses.map(async (address) => {
    const signers = await publicClient.readContract({
      address,
      abi: abiOwners,
      functionName: "getOwners",
    });

    const threshold = await publicClient.readContract({
      address,
      abi: abiGetThreshold,
      functionName: "getThreshold",
    });

    return {
      address: address,
      signers: [...signers],
      threshold: threshold as number,
      multisig: true,
    };
  });

  try {
    return await Promise.all(promises);
  } catch (error) {
    console.error("Error reading multisig contracts:", error);
    throw error;
  }
}

async function getTokenBalance(
  tokenContractAddress: Address,
  userAddress: Address
): Promise<bigint> {
  return await publicClient.readContract({
    address: tokenContractAddress,
    abi: abiBalanceOf,
    functionName: "balanceOf",
    args: [userAddress],
  });
}
