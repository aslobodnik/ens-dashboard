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
  abiGetName,
  abiGetSymbol,
  abiGetDecimals,
  abiPieOf,
  abiREthRate,
  abiUsdEthRate,
} from "./abi/abi";

const transport = http(process.env.SERVER_URL);

const ENS_TOKEN_CONTRACT = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";

const USDC_TOKEN_CONTRACT = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const rEth = "0xae78736Cd615f374D3085123A210448E74Fc6393";
const usdEth = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";

const tokenContracts = [
  "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  "0x59cD1C87501baa753d0B5B5Ab5D8416A45cD71DB",
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  "0xc3d688B66703497DAA19211EEdff47f25384cdc3",
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
  "0xae78736Cd615f374D3085123A210448E74Fc6393",
  "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8",
  "0xE95A203B1a91a908F9B9CE46459d101078c2c3cb",
  "0x6b175474e89094c44da98b954eedeac495271d0f",
  "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b",
  "0xDd1fE5AD401D4777cE89959b7fa587e569Bf125D",
  "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
  "0x373238337Bfe1146fb49989fc222523f83081dDb",
  "0x1BA8603DA702602A8657980e825A6DAa03Dee93a", //USDCx
];

const publicClient = createPublicClient({
  batch: {
    multicall: true,
  },
  chain: mainnet,
  transport,
});

export default async function Home() {
  const ethPrice = await getEthPrice();
  const parsedEthPrice = BigInt(Math.round(Number(formatUnits(ethPrice, 8))));
  const rEthRate = await getrEthRate();
  const parsedREthRate = BigInt(
    Math.round(Number(formatEther(rEthRate)) * 1000)
  );
  const rEthPrice = (parsedREthRate * parsedEthPrice) / 1000n;

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

  const endowmentData = await fetchAllTokenDetails(
    "0x4F2083f5fBede34C2714aFfb3105539775f7FE64"
  );
  const ethTokens = [
    "aEthWETH",
    "stETH",
    "WETH",
    "spWETH",
    "cWETHv3",
    "ankrETH",
    "ETHx",
  ];
  const rEthTokens = ["rETH", "auraB-rETH-STABLE-vault"];

  endowmentData.map((token) => {
    if (ethTokens.includes(token.symbol)) {
      // eth balue
      token.usdValue = token.balance * parsedEthPrice;
    } else if (rEthTokens.includes(token.symbol)) {
      token.usdValue = token.balance * rEthPrice;
    } else if (token.symbol === "cUSDCv3") {
      token.usdValue = token.balance * BigInt(1e12);
    } else {
      token.usdValue = token.balance;
    }

    return token;
  });

  return (
    <Client
      multiSigData={multiSigData}
      opsData={opsData}
      endowmentData={endowmentData}
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

async function getTokenDetails(
  tokenContractAddress: Address,
  userAddress: Address
): Promise<TokenDetails> {
  // Fetch the token balance
  if (tokenContractAddress === "0x373238337Bfe1146fb49989fc222523f83081dDb") {
    const balance = await publicClient.readContract({
      address: tokenContractAddress,
      abi: abiPieOf,
      functionName: "pieOf",
      args: [userAddress],
    });

    const name = "Maker: DSR Manager";
    const symbol = "DAI";
    const decimals = 18;
    return {
      balance,
      name,
      symbol,
      decimals,
      address: tokenContractAddress,
    };
  } else {
    const balance = await publicClient.readContract({
      address: tokenContractAddress,
      abi: abiBalanceOf,
      functionName: "balanceOf",
      args: [userAddress],
    });

    // Fetch the token name
    const name = (await publicClient.readContract({
      address: tokenContractAddress,
      abi: abiGetName,
      functionName: "name",
      args: [],
    })) as string;

    const symbol = (await publicClient.readContract({
      address: tokenContractAddress,
      abi: abiGetSymbol,
      functionName: "symbol",
      args: [],
    })) as string;

    const decimals = (await publicClient.readContract({
      address: tokenContractAddress,
      abi: abiGetDecimals,
      functionName: "decimals",
      args: [],
    })) as number;

    return {
      balance,
      name,
      symbol,
      decimals,
      address: tokenContractAddress,
    };
  }
}

async function fetchAllTokenDetails(
  userAddress: Address
): Promise<TokenDetails[]> {
  try {
    const promises = tokenContracts.map((tokenContractAddress) =>
      getTokenDetails(tokenContractAddress as Address, userAddress)
    );

    const results = await Promise.all(promises);
    return results; // Return the array of token details
  } catch (error) {
    console.error("Error fetching token details:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
}

async function getEthPrice(): Promise<bigint> {
  return await publicClient.readContract({
    address: usdEth,
    abi: abiUsdEthRate,
    functionName: "latestAnswer",
  });
}

async function getrEthRate(): Promise<bigint> {
  return await publicClient.readContract({
    address: rEth,
    abi: abiREthRate,
    functionName: "getExchangeRate",
  });
}
