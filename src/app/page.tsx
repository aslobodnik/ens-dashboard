"use client";
import Image from "next/image";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReadContracts, useEnsName } from "wagmi";

import { normalize } from "viem/ens";
import { mainnet } from "viem/chains";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  createPublicClient,
  http,
  Address,
  formatEther,
  formatUnits,
} from "viem";

import { CustomAvatarProps, AvatarStackProps, MultiSig } from "./types/types";
import multisigsData from "./data/multisigsData";
import { useEffect, useState } from "react";

const ENS_TOKEN_CONTRACT =
  "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72" as Address;

const USDC_TOKEN_CONTRACT =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;

const ETH_BULK_BALANCE_CONTRACT =
  "0xb1F8e55c7f64D203C1400B9D8555d050F94aDF39" as Address;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;

const alchemyUrl = process.env.ALCHEMY_URL;
const transport = http(alchemyUrl);

const client = createPublicClient({
  chain: mainnet,
  transport,
});

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

const abiBulkEthBalanceOf = [
  {
    constant: true,
    inputs: [
      { name: "users", type: "address[]" },
      { name: "tokens", type: "address[]" },
    ],
    name: "balances",
    outputs: [{ name: "", type: "uint256[]" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

export default function Home() {
  const [multisigs, setMultisigs] = useState<MultiSig[]>(multisigsData); // Initial state from your data file

  const contractReads = multisigs.map((multisig) => ({
    address: multisig.address,
    abi: abiOwners,
    functionName: "getOwners",
  }));

  const { data: signersData, isLoading } = useReadContracts({
    contracts: contractReads,
  });

  useEffect(() => {
    if (signersData && !isLoading) {
      const updatedMultisigs = multisigs.map((multisig, index) => {
        const signerResults =
          signersData[index]?.status === "success"
            ? (signersData[index].result as Address[])
            : [];

        return {
          ...multisig,
          signers: signerResults,
        };
      });
      console.log({ updatedMultisigs });
      setMultisigs(updatedMultisigs);
    }
  }, [signersData, isLoading]);

  const ensBalanceReads = multisigs.map((multisig) => ({
    address: ENS_TOKEN_CONTRACT,
    abi: abiBalanceOf,
    functionName: "balanceOf",
    args: [multisig.address],
  }));

  const { data: ensBalances, isLoading: isLoadingEnsBalances } =
    useReadContracts({
      contracts: ensBalanceReads,
    });

  useEffect(() => {
    if (ensBalances && !isLoadingEnsBalances) {
      const updatedMultisigs = multisigs.map((multisig, index) => {
        // Safely access the result using optional chaining
        const ensBalance = ensBalances[index]?.result
          ? parseFloat(ensBalances[index].result.toString())
          : 0;

        return {
          ...multisig,
          ens: ensBalance,
        };
      });
      setMultisigs(updatedMultisigs);
    }
  }, [ensBalances, isLoadingEnsBalances]);

  const usdcBalanceReads = multisigs.map((multisig) => ({
    address: USDC_TOKEN_CONTRACT,
    abi: abiBalanceOf,
    functionName: "balanceOf",
    args: [multisig.address],
  }));

  const { data: usdcBalances, isLoading: isLoadingusdcBalances } =
    useReadContracts({
      contracts: usdcBalanceReads,
    });

  useEffect(() => {
    if (usdcBalances && !isLoadingusdcBalances) {
      const updatedMultisigs = multisigs.map((multisig, index) => {
        // Safely access the result using optional chaining
        const usdcBalance = usdcBalances[index]?.result
          ? parseFloat(formatUnits(usdcBalances[index].result as bigint, 6))
          : 0;

        return {
          ...multisig,
          usdc: usdcBalance,
        };
      });
      setMultisigs(updatedMultisigs);
    }
  }, [usdcBalances, isLoadingusdcBalances]);

  // // Prepare contract read for ETH balances
  // const ethBalanceRead = {
  //   address: ETH_BULK_BALANCE_CONTRACT,
  //   abi: abiBulkEthBalanceOf,
  //   functionName: "balances" as "balances", // Explicitly setting the type to the string literal
  //   args: [
  //     multisigs.map((ms) => ms.address), // Array of user addresses
  //     new Array(multisigs.length).fill(ZERO_ADDRESS), // Array of the zero address representing ETH
  //   ],
  // };

  // const { data: ethBalances, isLoading: isLoadingEthBalances } =
  //   useReadContracts({
  //     contracts: [ethBalanceRead],
  //   });

  // useEffect(() => {
  //   if (ethBalances && !isLoadingEthBalances) {
  //     const updatedMultisigs = multisigs.map((multisig, index) => {
  //       let ethBalance = 0;
  //       if (ethBalances[0]?.result[index]) {
  //         // Convert from Wei to Ether (assuming the balance is in Wei)
  //         const balanceInWei = BigInt(ethBalances[0].result[index]);
  //         const balanceInEther = balanceInWei / BigInt(1e18);
  //         ethBalance = Number(balanceInEther); // Convert BigInt to a regular number
  //       }

  //       return {
  //         ...multisig,
  //         balance: ethBalance,
  //       };
  //     });
  //     setMultisigs(updatedMultisigs);
  //   }
  // }, [ethBalances, isLoadingEthBalances]);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="scroll-m-20 text-4xl mb-10 font-extrabold tracking-tight lg:text-4xl">
        ENS DAO Dashboard
      </h1>

      <div>
        <Table>
          <TableCaption>ENS DAO Wallets</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">Address</TableHead>
              <TableHead className="text-center">Working Group </TableHead>
              <TableHead className="text-center">Signers</TableHead>
              <TableHead colSpan={3} className="text-center">
                Current Balance
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {multisigs.map((multisig, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium  min-w-52">
                  <WalletAddress address={multisig.address} />
                  <div className="text-xs text-left pt-2 text-gray-400">
                    Signers: {multisig.signers.length}
                  </div>
                </TableCell>
                <TableCell>{multisig.workingGroup}</TableCell>
                <TableCell className="flex flex-col  max-w-96 flex-wrap">
                  {multisig.signers.map((signer, signerIndex) => (
                    <DisplaySigner
                      key={signerIndex}
                      address={signer as Address}
                    />
                  ))}
                </TableCell>

                <TableCell className="text-right">
                  {multisig.balance} ETH
                </TableCell>
                <TableCell className="text-right">
                  {multisig.usdc} USDC
                </TableCell>
                <TableCell className="text-right">{multisig.ens} ENS</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Select>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Working Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="eco">Ecosystem</SelectItem>
            <SelectItem value="pg">Public Goods</SelectItem>
            <SelectItem value="meta">Metagov</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </main>
  );
}

function DisplaySigner({ address }: { address: Address }) {
  const { data: ensName, isLoading: isLoadingEnsName } = useEnsName({
    address,
  });

  return (
    <span className="py-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex flex-col ">
            <span className="w-full text-left">
              {ensName || <WalletAddress address={address} />}
            </span>
          </TooltipTrigger>
          <TooltipContent className="">{address}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

export function CustomAvatar({ name, image, className }: CustomAvatarProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Avatar className={className}>
            <AvatarImage className="cursor-pointer" src={image} />
          </Avatar>
        </TooltipTrigger>
        <TooltipContent>
          <p>{name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function WalletAddress({ address }: { address: Address }) {
  const { data: ensName, isLoading } = useEnsName({
    address: address,
  });
  const displayAddress =
    address.substring(0, 6) + "..." + address.substring(address.length - 4);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger className="flex flex-col ">
          <span className="w-full text-left">{displayAddress}</span>
          <span className="text-xs text-gray-500 w-full text-left">
            {ensName}
          </span>
        </TooltipTrigger>
        <TooltipContent className="">{address}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AvatarStack({ avatars }: AvatarStackProps) {
  if (!avatars || avatars.length < 1 || avatars.length > 7) {
    console.error("AvatarStack requires between 1 and 7 avatars.");
    return null;
  }

  return (
    <div className="flex relative">
      {avatars.map((avatar, index) => (
        <CustomAvatar
          key={avatar.name}
          className={`z-${(index + 1) * 10} -ml-${
            index > 0 ? 2 : 0
          } drop-shadow-lg`}
          name={avatar.name}
          image={avatar.image}
        />
      ))}
    </div>
  );
}

function formatNumber(numberString: string): string {
  // Convert the string to a number and round it
  const roundedNumber = Math.round(parseFloat(numberString));
  console.log({ roundedNumber });
  // Format the number with commas
  return new Intl.NumberFormat("en-US").format(roundedNumber);
}

{
  /* <TableCell className="flex gap-2 relative">
                <AvatarStack
                  avatars={[
                    {
                      name: "coltron.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1636430861993385986/hCnL6SBv_400x400.jpg",
                    },
                    {
                      name: "simona.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1494871363034750980/WbDNU90b_400x400.jpg",
                    },
                    {
                      name: "slobo.eth",
                      image:
                        "https://pbs.twimg.com/profile_images/1520031978376077313/SNxbJVLP_400x400.jpg",
                    },
                  ]}
                />
              </TableCell> */
}
