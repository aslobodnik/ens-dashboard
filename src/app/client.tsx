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

import { useEnsName } from "wagmi";

import { mainnet } from "viem/chains";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { createPublicClient, http, Address, formatUnits } from "viem";

import { MultiSig } from "./types/types";

const alchemyUrl = process.env.ALCHEMY_URL;
const transport = http(alchemyUrl);

const client = createPublicClient({
  chain: mainnet,
  transport,
});

export function Client({ multiSigData }: { multiSigData: MultiSig[] }) {
  const totalEth = multiSigData.reduce(
    (acc, curr) => acc + toBigInt(curr.balance),
    BigInt(0)
  );
  const totalUsdc = multiSigData.reduce(
    (acc, curr) => acc + toBigInt(curr.usdc),
    BigInt(0)
  );
  const totalEns = multiSigData.reduce(
    (acc, curr) => acc + toBigInt(curr.ens),
    BigInt(0)
  );

  return (
    <main className="flex min-h-screen flex-col  items-center p-24 mx-auto">
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
            {multiSigData.map((multisig, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium  min-w-52">
                  <WalletAddress address={multisig.address} />
                  <div className="text-xs text-left pt-2 text-gray-400">
                    Signers: {multisig.signers.length}
                  </div>
                </TableCell>
                <TableCell>{multisig.workingGroup}</TableCell>
                <TableCell className="flex flex-col   min-w-56 max-w-96 flex-wrap">
                  {multisig.signers.map((signer, signerIndex) => (
                    <DisplaySigner
                      key={signerIndex}
                      address={signer as Address}
                    />
                  ))}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(multisig.balance as bigint, 18, 1)} ETH
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(multisig.usdc as bigint, 6, 0)} USDC
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(multisig.ens as bigint, 18, 0)} ENS
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell className="text-center  text-xl font-bold" colSpan={3}>
                Total
              </TableCell>
              <TableCell className="text-right  text-xl font-bold">
                {formatCurrency(totalEth, 18, 1)} ETH
              </TableCell>
              <TableCell className="text-right  text-xl font-bold">
                {formatCurrency(totalUsdc, 6, 0)} USDC
              </TableCell>
              <TableCell className="text-right text-xl font-bold">
                {formatCurrency(totalEns, 18, 0)} ENS
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </main>
  );
}

function DisplaySigner({ address }: { address: Address }) {
  const { data: ensName, isLoading: isLoadingEnsName } = useEnsName({
    address,
  });

  const displayAddress =
    address.substring(0, 6) + "..." + address.substring(address.length - 4);

  return (
    <span className="py-1">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex ">
            <Avatar className=" drop-shadow-md">
              <AvatarImage
                className="cursor-pointer"
                src={`https://metadata.ens.domains/mainnet/avatar/${ensName}`}
              />
              <AvatarFallback></AvatarFallback>
            </Avatar>
            <span className="w-full text-left mt-2 pl-2 ">
              {ensName || displayAddress}
            </span>
          </TooltipTrigger>
          <TooltipContent className="">{address}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
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

function formatCurrency(
  amount: bigint,
  tokenDecimals: number,
  displayDecimals: number
): string {
  const formatted = parseFloat(formatUnits(amount, tokenDecimals)).toFixed(
    displayDecimals
  );
  return new Intl.NumberFormat("en-US").format(parseFloat(formatted));
}

function toBigInt(value: number | bigint | BigInt | null | undefined): bigint {
  if (value === null || value === undefined) {
    return BigInt(0);
  } else if (typeof value === "number" || typeof value === "bigint") {
    return BigInt(value);
  } else {
    throw new Error("Invalid type for conversion to bigint");
  }
}
