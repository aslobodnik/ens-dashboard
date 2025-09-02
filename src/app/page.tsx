import {
  createPublicClient,
  http,
  Address,
  parseEther,
  formatEther,
  formatUnits,
} from "viem";
import { Client } from "./client";
import { mainnet } from "viem/chains";
import { multiSigs, opsContracts, endowment } from "./data/data";
import { ContractInfo, MultiSig, TokenDetails } from "./types/types";
import {
  abiBalanceOf,
  abiOwners,
  abiGetThreshold,
  abiUsdEthRate,
} from "./abi/abi";

const transport = http(process.env.NEXT_PUBLIC_ALCHEMY_URL);
export const revalidate = 3600;

const ENS_TOKEN_CONTRACT = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";

const USDC_TOKEN_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const usdEth = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: mainnet,
  transport,
});

export default async function Home() {
  const ethPrice = await getEthPrice();

  if (ethPrice === null) {
    console.error("Failed to fetch ETH price. Using a default value.");
    return null; // or handle this scenario as needed, e.g., use a fallback price
  }

  const parsedEthPrice = BigInt(Math.round(Number(formatUnits(ethPrice, 8))));

  const multiSigData = await getMultiSigData({ multisigs: multiSigs });

  const balanceData = await getBalances({
    addresses: opsContracts.map((contract) => contract.address),
  });

  // Merge balance data back into opsContracts
  const opsData = opsContracts.map((contract) => {
    const balanceInfo = balanceData.find((b) => b.address === contract.address);
    const usdValue =
      (balanceInfo?.ethBalance
        ? balanceInfo.ethBalance * parsedEthPrice
        : BigInt(0)) +
      (balanceInfo?.usdcBalance
        ? balanceInfo.usdcBalance * BigInt(1e12)
        : BigInt(0));
    return {
      ...contract,
      ...balanceInfo,
      usdValue,
    };
  });

  const blockTimestamp = (await publicClient.getBlock()).timestamp * 1000n;

  return (
    <Client
      multiSigData={multiSigData}
      opsData={opsData}
      block={blockTimestamp}
    />
  );
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
      factory: undefined,
      factoryData: undefined,
      stateOverride: undefined,
    });

    const threshold = await publicClient.readContract({
      address,
      abi: abiGetThreshold,
      functionName: "getThreshold",
      factory: undefined,
      factoryData: undefined,
      stateOverride: undefined,
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
    factory: undefined,
    factoryData: undefined,
    stateOverride: undefined,
  });
}

async function getEthPrice(): Promise<bigint | null> {
  try {
    const [, answer] = await publicClient.readContract({
      address: usdEth,
      abi: abiUsdEthRate,
      functionName: "latestRoundData",
      blockTag: "latest", // Fetch the latest block data
    });
    return answer;
  } catch (error) {
    console.error("Error fetching ETH price:", error);
    return null;
  }
}
